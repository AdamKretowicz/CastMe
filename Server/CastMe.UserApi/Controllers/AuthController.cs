using System.Security.Claims;
using Application.Auth;
using CastMe.Api.Features.Photos;
using CastMe.User.CrossCutting.DTOs;
using CastMe.UserApi.Mappers;
using CastMe.UserApi.Services;
using Infrastructure.Context;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WebApi.Services.Photo;

namespace WebApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Tags("Auth")]
    [Produces("application/json")]
    public sealed class AuthController : ControllerBase
    {
        private readonly UserDbContext _db;
        private readonly IPasswordHasher _passwordHasher;
        private readonly IJwtTokenService _tokenService;
        private readonly UserService _userService;
        private readonly IPhotoService _photoService;

        public AuthController(UserDbContext db, IPasswordHasher passwordHasher,
            IJwtTokenService tokenService, UserService userService, IPhotoService photoService)
        {
            _db = db;
            _passwordHasher = passwordHasher;
            _tokenService = tokenService;
            _userService = userService;
            _photoService = photoService;
        }

        [HttpPost("register")]
        [AllowAnonymous]
        [Tags("Register")]
        [ProducesResponseType(typeof(UserDto.Read), 201)]
        [ProducesResponseType(400)]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> Register([FromForm] UserDto.Create dto, CancellationToken ct = default)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            if (dto.Photos == null || dto.Photos.Length == 0)
                return BadRequest(new { message = "Musisz przesłać co najmniej jedno zdjęcie." });

            // Unikalność username/email
            var exists = await _db.Users
                .AsNoTracking()
                .AnyAsync(u => u.UserName.ToLower() == dto.UserName.ToLower() 
                || u.Email.ToLower() == dto.Email.ToLower(),ct);

            if (exists)
                return BadRequest(new { message = "UserName or Email already in use." });

            // Hash hasła
            var passwordHash = _passwordHasher.Hash(dto.Password);

            // Pobranie roli
            var userRole = await _userService.GetRoleByName(dto.RoleName);
            if (userRole == null|| dto.RoleName == "Admin")
                return BadRequest(new { message = "Wybrana rola nie istnieje." });

            // Tworzymy encję użytkownika
            var entity = dto.ToEntity(passwordHash, userRole.Id);


            using var tx = await _db.Database.BeginTransactionAsync();
            try
            {
                _db.Users.Add(entity);
                await _db.SaveChangesAsync();

                // Upload zdjęć
                bool first = true;
                foreach (var file in dto.Photos)
                {
                    var photo = await _photoService.UploadAsync(entity.Id, file);
                    if (first)
                    {
                        await _photoService.SetMainAsync(entity.Id, photo.Id);
                        first = false;
                    }
                }

                await tx.CommitAsync();
            }
            catch
            {
                await tx.RollbackAsync();
                throw;
            }

            var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, entity.Id.ToString()),
            new(ClaimTypes.Name, entity.UserName),
            new(ClaimTypes.Email, entity.Email)
        };
            var (accessToken, expiresAtUtc, refreshToken) = _tokenService.CreateTokens(claims);

            return Created($"/user/{entity.Id}", new
            {
                user = entity.ToReadDto(),
                accessToken,
                expiresAtUtc,
                refreshToken
            });
        }

        public sealed class LoginDto
        {
            public string UserName { get; set; } = default!;
            public string Password { get; set; } = default!;
        }

        [HttpPost("login")]
        [AllowAnonymous]
        [Tags("Login")]
        [ProducesResponseType(200)]
        [ProducesResponseType(400)]
        [ProducesResponseType(401)]
        public async Task<IActionResult> Login([FromBody] LoginDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.UserName) || string.IsNullOrWhiteSpace(dto.Password))
                return BadRequest(new { message = "Missing credentials" });

            var user = await _db.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.UserName == dto.UserName);

            if (user is null || !_passwordHasher.Verify(dto.Password, user.PasswordHash))
                return Unauthorized(new { message = "Invalid username or password" });

            var claims = new List<Claim>
            {
                new(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new(ClaimTypes.Name, user.UserName),
                new(ClaimTypes.Email, user.Email)
            };

            var (accessToken, expiresAtUtc, refreshToken) = _tokenService.CreateTokens(claims);

            return Ok(new
            {
                accessToken,
                expiresAtUtc,
                refreshToken,
                user = new { user.Id, user.UserName, user.Email, user.FirstName, user.LastName }
            });
        }
    }
}
