using Application.Dtos;
using Application.Mapper;
using CastMe.UserApi.Services;
using Microsoft.AspNetCore.Mvc;
using System.Data;
using System.Security.Claims;
using WebApi.Endpoints;
using WebApi.Extensions;
using WebApi.Services;

namespace WebApi.Controllers
{
    [ApiController]
    [Route("casting")]
    [Tags("Castings")]
    [Produces("application/json")]
    public class CastingController : ControllerBase
    {
        private readonly CastingService _castingService;
        private readonly UserService _userService;
        private readonly ILogger<CastingController> _logger;

        public CastingController(CastingService castingService, UserService userService, ILogger<CastingController> logger)
        {
            _castingService = castingService;
            _userService = userService;
            _logger = logger;
        }




        //<summary>Get all castings.</summary>
        [HttpGet(Endpoints.CastingEndpoints.GetAll)]
        [ProducesResponseType(typeof(IEnumerable<CastingDto.Read>), 200)]
        [RoleAuthorize("Admin", "Model", "Photographer", "Designer", "Volunteer", "Guest")]
        public async Task<ActionResult<IEnumerable<CastingDto.Read>>> GetAllUsers()
        {
            var castings = await _castingService.GetAllCastings();
            return Ok(castings.Select(c => c.ToReadDto()));
        }

        //<summary>Get casting by Id.</summary>
        [HttpGet(Endpoints.CastingEndpoints.GetById)]
        [ProducesResponseType(typeof(CastingDto.Read), 200)]
        [ProducesResponseType(404)]
        [RoleAuthorize("Admin", "Model", "Photographer", "Designer", "Volunteer", "Guest")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var casting = await _castingService.GetById(id);
            if (casting is null) return NotFound();
            return Ok(casting.ToReadDto());
        }

        //<summary>Get castings by organiser Id.</summary>
        [HttpGet(Endpoints.CastingEndpoints.GetByOrganiserId)]
        [ProducesResponseType(typeof(IEnumerable<CastingDto.Read>), 200)]
        [ProducesResponseType(404)]
        [RoleAuthorize("Admin", "Model", "Photographer", "Designer", "Volunteer", "Guest")]
        public async Task<ActionResult<IEnumerable<CastingDto.Read>>> GetByOrganiserId([FromRoute] Guid userId)
        {
            var castings = await _castingService.GetCastingsByOrganiserId(userId);
            return Ok(castings.Select(c => c.ToReadDto()));
        }

        //<summary>Create new casting.</summary>
        [HttpPost(Endpoints.CastingEndpoints.Create)]
        [ProducesResponseType(typeof(CastingDto.Read), 201)]
        [ProducesResponseType(400)]
        [RoleAuthorize("Admin")]
        public async Task<IActionResult> Create([FromBody] CastingDto.Create dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var casting = dto.ToEntity();
            await _castingService.Add(casting);
            return CreatedAtAction(nameof(GetById), new { id = casting.Id }, casting.ToReadDto());
        }

        //<summary>Update existing casting.</summary>
        [HttpPut(Endpoints.CastingEndpoints.Update)]
        [ProducesResponseType(204)]
        [ProducesResponseType(400)]
        [ProducesResponseType(404)]
        [RoleAuthorize("Admin")]
        public async Task<IActionResult> Update(Guid id, [FromBody] CastingDto.Update dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var existingCasting = await _castingService.GetById(id);
            if (existingCasting is null) return NotFound();

            existingCasting.UpdateEntity(dto);
            await _castingService.Update(existingCasting);
            return Ok(existingCasting.ToReadDto());
        }
        ///<summary>Delete casting by Id.</summary>
        [HttpDelete(Endpoints.CastingEndpoints.Delete)]
        [ProducesResponseType(204)]
        [ProducesResponseType(404)]
        [RoleAuthorize("Admin")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var existingCasting = await _castingService.GetById(id);
            if (existingCasting is null) return NotFound();
            await _castingService.Delete(id);
            return NoContent();
        }
        //<summary>Get participants by casting Id.</summary>
        [HttpGet(Endpoints.CastingEndpoints.GetParticipantsByCastingId)]
        [ProducesResponseType(typeof(CastingDto.ReadParticipants), 200)]
        [ProducesResponseType(404)]
        [RoleAuthorize("Admin")]
        public async Task<IActionResult> GetParticipantsByCastingId(Guid id)
        {
            try
            {
                var casting = await _castingService.GetParticipantsByCastingId(id);

                return Ok(casting.ToParticipantReadDto());
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }

        }

        //<summary> Add participant to casting by casting Id. </summary>
        [HttpPost(Endpoints.CastingEndpoints.AddParticipant)]
        [ProducesResponseType(204)]
        [ProducesResponseType(404)]
        [RoleAuthorize("Admin", "Model", "Photographer", "Designer", "Volunteer")]
        public async Task<IActionResult> AddParticipant(Guid castingId, Guid userId)
        {
            var loggedUserIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (loggedUserIdString == null) return Unauthorized();

            var loggedUserId = Guid.Parse(loggedUserIdString);

            var roles = await _userService.GetAllRoles();
            var adminRole = roles.FirstOrDefault(r => r.Name.Equals("Admin", StringComparison.OrdinalIgnoreCase));
            var adminRoleId = adminRole?.Id;

            var user = _userService.GetById(loggedUserId);

            var isAdmin = user.Result?.RoleId == adminRoleId;

            if (!isAdmin && loggedUserId != userId)
                return Forbid("You cannot add another user to the casting.");

            try
            {
                await _castingService.AddParticipant(castingId, userId);
                return NoContent();
            }
            catch (KeyNotFoundException ex)
            {
                _logger.LogWarning(ex, "Failed to add participant. {Message}", ex.Message);
                return NotFound(new { message = ex.Message });
            }
        }

        //<summary> Remove participant from casting by casting Id. </summary>
        [HttpDelete(Endpoints.CastingEndpoints.RemoveParticipant)]
        [ProducesResponseType(204)]
        [ProducesResponseType(404)]
        [RoleAuthorize("Admin", "Model", "Photographer", "Designer", "Volunteer")]
        public async Task<IActionResult> RemoveParticipant(Guid castingId, Guid userId)
        {
            var loggedUserIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (loggedUserIdString == null) return Unauthorized();

            var loggedUserId = Guid.Parse(loggedUserIdString);

            var roles = await _userService.GetAllRoles();
            var adminRole = roles.FirstOrDefault(r => r.Name.Equals("Admin", StringComparison.OrdinalIgnoreCase));
            var adminRoleId = adminRole?.Id;

            var user = _userService.GetById(loggedUserId);

            var isAdmin = user.Result?.RoleId == adminRoleId;

            if (!isAdmin && loggedUserId != userId)
                return Forbid("You cannot add another user to the casting.");

            try
            {
                await _castingService.RemoveParticipant(castingId, userId);
                return NoContent();
            }
            catch (KeyNotFoundException ex)
            {
                _logger.LogWarning(ex, "Failed to remove participant. {Message}", ex.Message);
                return NotFound(new { message = ex.Message });
            }
        }


    }
}
