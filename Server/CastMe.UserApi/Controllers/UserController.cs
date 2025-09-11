using Application.Auth;
using CastMe.User.CrossCutting.DTOs;
using CastMe.UserApi.Mappers;
using CastMe.UserApi.Services;
using Domain.Entities;
using Microsoft.AspNetCore.JsonPatch;
using Microsoft.AspNetCore.Mvc;
using WebApi.Extensions;

namespace CastMe.UserApi.Controllers
{
    [ApiController]
    [Route("user")]
    [Tags("Users")]
    [Produces("application/json")]
    public class UserController : ControllerBase
    {
        private readonly UserService _userService;
        private readonly IPasswordHasher _passwordHasher;
        private readonly ILogger<UserController> _logger;

        public UserController(
            UserService userService,
            IPasswordHasher passwordHasher,
            ILogger<UserController> logger)
        {
            _userService = userService;
            _passwordHasher = passwordHasher;
            _logger = logger;
        }

        /// <summary>Get all users.</summary>
        [HttpGet]
        [ProducesResponseType(typeof(IEnumerable<UserDto.Read>), 200)]
        [RoleAuthorize("Admin", "Model", "Photographer", "Designer", "Volunteer", "Guest")]
        public async Task<ActionResult<IEnumerable<UserDto.Read>>> GetAllUsers()
        {
            var users = await _userService.GetAllUsers();
            return Ok(users.Select(u => u.ToReadDto()));
        }

        /// <summary>Get user by Id.</summary>
        [HttpGet("{id:guid}")]
        [ProducesResponseType(typeof(UserDto.Read), 200)]
        [ProducesResponseType(404)]
        [RoleAuthorize("Admin", "Model", "Photographer", "Designer", "Volunteer", "Guest")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var user = await _userService.GetById(id);
            if (user is null) return NotFound();
            return Ok(user.ToReadDto());
        }

        /// <summary>Create new user.</summary>
        [HttpPost]
        [ProducesResponseType(typeof(UserDto.Read), 201)]
        [ProducesResponseType(400)]
        [RoleAuthorize("Admin", "Model", "Photographer", "Designer", "Volunteer", "Guest")]
        public async Task<IActionResult> Create([FromBody] UserDto.Create dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            // Hash hasła w warstwie serwisu bezpieczeństwa – nie w mapperze
            var passwordHash = _passwordHasher.Hash(dto.Password);

            var role = _userService.GetRoleByName(dto.Role);


            var entity = dto.ToEntity(passwordHash, role.Result.Id);
            await _userService.Add(entity);

            return CreatedAtAction(
                nameof(GetById),
                new { id = entity.Id },
                entity.ToReadDto()
            );
        }

        /// <summary>Update existing user (full replace).</summary>
        [HttpPut("{id:guid}")]
        [ProducesResponseType(typeof(UserDto.Read), 200)]
        [ProducesResponseType(400)]
        [ProducesResponseType(404)]
        [RoleAuthorize("Admin", "Model", "Photographer", "Designer", "Volunteer", "Guest")]
        public async Task<IActionResult> Edit(Guid id, [FromBody] UserDto.Update dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var existingUser = await _userService.GetById(id);
            if (existingUser is null) return NotFound();

            existingUser.UpdateEntity(dto);
            await _userService.Update(existingUser);

            return Ok(existingUser.ToReadDto());
        }

        /// <summary>Partially update user (JSON Patch).</summary>
        [HttpPatch("{id:guid}")]
        [ProducesResponseType(typeof(UserDto.Read), 200)]
        [ProducesResponseType(400)]
        [ProducesResponseType(404)]
        [RoleAuthorize("Admin", "Model", "Photographer", "Designer", "Volunteer", "Guest")]
        public async Task<IActionResult> Patch(Guid id, [FromBody] JsonPatchDocument<UserDto.Update> patchDoc)
        {
            if (patchDoc is null) return BadRequest();

            var user = await _userService.GetById(id);
            if (user is null) return NotFound();

            // map encja -> DTO Update (stan bieżący)
            var updateDto = new UserDto.Update
            {
                UserName = user.UserName,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Phone = user.Phone,                 
                DateOfBirth = user.DateOfBirth,
                Height = user.Height,
                Weight = user.Weight,
                Email = user.Email,
                Country = user.Country,
                City = user.City,
                Description = user.Description,
                Gender = user.Gender,
                HairColor = user.HairColor,
                ClothingSize = user.ClothingSize
            };

            patchDoc.ApplyTo(updateDto, ModelState);
            if (!ModelState.IsValid) return BadRequest(ModelState);

            user.UpdateEntity(updateDto);
            await _userService.Update(user);

            return Ok(user.ToReadDto());
        }

        /// <summary>Delete user by Id.</summary>
        [HttpDelete("{id:guid}")]
        [ProducesResponseType(204)]
        [ProducesResponseType(404)]
        [RoleAuthorize("Admin", "Model", "Photographer", "Designer", "Volunteer", "Guest")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var user = await _userService.GetById(id);
            if (user is null) return NotFound();

            var currentUserId = User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            if (currentUserId is null)
                return Forbid(); 

            if (!User.IsInRole("Admin") && currentUserId != id.ToString())
                return Forbid();

            await _userService.Delete(id);
            return NoContent();
        }
        //<summary>Update user status (Admin only).</summary>
        [HttpPut("{id}/status")]
        [ProducesResponseType(typeof(UserDto.Read), 200)]
        [ProducesResponseType(400)]
        [ProducesResponseType(404)]
        [RoleAuthorize("Admin")]
        public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] UserDto.StatusUpdate dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var existingUser = await _userService.GetById(id);
            if (existingUser is null) return NotFound();

            var resultUser = await _userService.UpdateUserStatusAsync(id,dto.Status);

            return Ok(existingUser.ToReadDto());
            
        }


        /// <summary>Get All Roles</summary>
        [HttpGet("roles")]
        [ProducesResponseType(typeof(IEnumerable<object>), 200)]
        public async Task<IActionResult> GetAllRoles()
        {
            var roles = await _userService.GetAllRoles();
            var rolesDto = roles.Select(r => new { r.Name });

            return Ok(rolesDto);
        }
    }
}
