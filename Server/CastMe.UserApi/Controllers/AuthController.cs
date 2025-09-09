using System.Security.Claims;
using Application.Auth;
using CastMe.User.CrossCutting.DTOs;
using CastMe.UserApi.Mappers;
using Infrastructure.Context;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Application.Interfaces;
using Microsoft.AspNetCore.Authorization;

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
        private readonly Application.Interfaces.IAuthorizationService _authorizationService;

        public AuthController(
            UserDbContext db, 
            IPasswordHasher passwordHasher, 
            IJwtTokenService tokenService, 
            Application.Interfaces.IAuthorizationService authorizationService)
        {
            _db = db;
            _passwordHasher = passwordHasher;
            _tokenService = tokenService;
            _authorizationService = authorizationService;
        }


        [HttpPost("register")]
        [AllowAnonymous]
        [Tags("Register")]
        [ProducesResponseType(typeof(UserDto.Read), 201)]
        [ProducesResponseType(400)]
        public async Task<IActionResult> Register([FromBody] UserDto.Create dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            // Unikalność username/email
            var exists = await _db.Users
                .AsNoTracking()
                .AnyAsync(u => u.UserName == dto.UserName || u.Email == dto.Email);

            if (exists)
                return BadRequest(new { message = "UserName or Email already in use." });

            // Hash hasła i utworzenie encji
            var passwordHash = _passwordHasher.Hash(dto.Password);
            var entity = dto.ToEntity(passwordHash);

            _db.Users.Add(entity);
            await _db.SaveChangesAsync();

            // (Opcjonalnie) od razu wystaw token, żeby frontend mógł zalogować usera po rejestracji
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

        [HttpGet("permissions")]
        public async Task<IActionResult> GetUserPermissions()
        {
            var userIdClaim = User.FindFirst("sub") ?? User.FindFirst("id");
            if (userIdClaim == null || !Guid.TryParse(userIdClaim.Value, out var userId))
            {
                return Unauthorized();
            }
            var permissions = await _authorizationService.GetUserPermissionsAsync(userId);
            return Ok(permissions);
        }

        [HttpGet("check-permission")]
        public async Task<IActionResult> CheckPermission([FromQuery] string action, [FromQuery] string resource)
        {
            var userIdClaim = User.FindFirst("sub") ?? User.FindFirst("id");
            if (userIdClaim == null || !Guid.TryParse(userIdClaim.Value, out var userId))
            {
                return Unauthorized();
            }
            var hasPermission = await _authorizationService.CanAccessAsync(userId, action, resource);
            return Ok(new { hasPermission });
        }





    }
}
