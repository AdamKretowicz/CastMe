using Application.Dtos;
using Application.Dtos.Photo;
using Application.Interfaces;
using Application.Mapper;
using CastMe.Domain.Entities;
using CastMe.User.CrossCutting.DTOs;
using CastMe.UserApi.Mappers;
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
        private readonly ICastingBannerService _castingBannerService;

        public CastingController(CastingService castingService, UserService userService, ILogger<CastingController> logger, ICastingBannerService castingBannerService)
        {
            _castingService = castingService;
            _userService = userService;
            _logger = logger;
            _castingBannerService = castingBannerService;
        }

        ///<summary>Get all castings.</summary>
        [HttpGet(Endpoints.CastingEndpoints.GetAll)]
        [ProducesResponseType(typeof(IEnumerable<CastingDto.Read>), 200)]
        [RoleAuthorize("Admin", "Model", "Photographer", "Designer", "Volunteer", "Guest")]
        public async Task<ActionResult<IEnumerable<CastingDto.Read>>> GetAllUsers()
        {
            var castings = await _castingService.GetAllCastings();
            return Ok(castings.Select(c => c.ToReadDto()));
        }

        ///<summary>Get casting by Id.</summary>
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

        ///<summary>Get castings by organiser Id.</summary>
        [HttpGet(Endpoints.CastingEndpoints.GetByOrganiserId)]
        [ProducesResponseType(typeof(IEnumerable<CastingDto.Read>), 200)]
        [ProducesResponseType(404)]
        [RoleAuthorize("Admin", "Model", "Photographer", "Designer", "Volunteer", "Guest")]
        public async Task<ActionResult<IEnumerable<CastingDto.Read>>> GetByOrganiserId([FromRoute] Guid userId)
        {
            var castings = await _castingService.GetCastingsByOrganiserId(userId);
            return Ok(castings.Select(c => c.ToReadDto()));
        }

        ///<summary>Create new casting.</summary>
        [HttpPost(Endpoints.CastingEndpoints.Create)]
        [ProducesResponseType(typeof(CastingDto.Read), 201)]
        [ProducesResponseType(400)]
        [RoleAuthorize("Admin")]
        public async Task<IActionResult> Create([FromBody] CastingDto.Create dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            string? userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("sub")?.Value;

            if (string.IsNullOrEmpty(userIdClaim))
            {
                throw new Exception("User ID not found in token.");
            }

            if (!Guid.TryParse(userIdClaim, out Guid organiserId))
            {
                throw new Exception("Invalid user ID in token.");
            }
            ;

            var casting = dto.ToEntity(organiserId);
            await _castingService.Add(casting);
            return CreatedAtAction(nameof(GetById), new { id = casting.Id }, casting.ToReadDto());
        }

        ///<summary>Update existing casting.</summary>
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
            await _castingService.Update(dto, id);
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
        ///<summary>Get participants by casting Id.</summary>
        [HttpGet(Endpoints.CastingEndpoints.GetParticipantsByCastingId)]
        [ProducesResponseType(typeof(CastingDto.ReadParticipants), 200)]
        [ProducesResponseType(404)]
        [RoleAuthorize("Admin")]
        public async Task<IActionResult> GetParticipantsByCastingId(Guid id)
        {
            try
            {
                var assigments = await _castingService.GetParticipantsByCastingId(id);

                return Ok(assigments.ToParticipantReadDto());
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }

        }

        ///<summary> Add participant to casting by casting Id. </summary>
        [HttpPost(Endpoints.CastingEndpoints.AddParticipant)]
        [ProducesResponseType(204)]
        [ProducesResponseType(404)]
        [RoleAuthorize("Admin", "Model", "Photographer", "Designer", "Volunteer")]
        [CurrentUser]
        public async Task<IActionResult> AddParticipant(Guid castingId, Guid userId)
        {


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

        ///<summary> Remove participant from casting by casting Id. </summary>
        [HttpDelete(Endpoints.CastingEndpoints.RemoveParticipant)]
        [ProducesResponseType(204)]
        [ProducesResponseType(404)]
        [RoleAuthorize("Admin", "Model", "Photographer", "Designer", "Volunteer")]
        [CurrentUser]
        public async Task<IActionResult> RemoveParticipant(Guid castingId, Guid userId)
        {
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

        ///<summary> Get Castings By Participant Id</summary>
        [HttpGet(Endpoints.CastingEndpoints.GetCastingsByParticipantId)]
        [ProducesResponseType(typeof(IEnumerable<CastingDto.Read>), 200)]
        [ProducesResponseType(404)]
        [RoleAuthorize("Admin", "Model", "Photographer", "Designer", "Volunteer")]
        [CurrentUser]
        public async Task<ActionResult<IEnumerable<CastingDto.Read>>> GetCastingsByParticipantId([FromRoute] Guid userId)
        {
            var castings = await _castingService.GetAllCastingsByUserId(userId);
            return Ok(castings.Select(c => c.ToReadDto()));
        }

        /// <summary>
        /// Changes the status of a casting.
        /// </summary>
        /// <param name="castingId"></param>
        /// <param name="status">Options: Active, Closed, Cancelled, Finished </param>
        /// <returns></returns>
        [HttpGet(Endpoints.CastingEndpoints.ChangeCastingStatus)]
        [ProducesResponseType(204)]
        [ProducesResponseType(404)]
        [RoleAuthorize("Admin")]
        public async Task<IActionResult> ChangeCastingStatus(Guid castingId, string status)
        {
            try
            {
                CastingStatus castingStatus;
                if (!Enum.TryParse<CastingStatus>(status, true, out castingStatus))
                {
                    return BadRequest(new { message = "Invalid status value. Allowed values are: Active, Closed, Cancelled, Finished." });
                }



                await _castingService.ChangeCastingStatus(castingId, castingStatus);
                return NoContent();
            }
            catch (KeyNotFoundException ex)
            {
                _logger.LogWarning(ex, "Failed to change casting status. {Message}", ex.Message);
                return NotFound(new { message = ex.Message });
            }


        }
        /// <summary>
        /// Get casting banner by casting Id.
        /// </summary>
        /// <param name="castingId"></param>
        /// <returns></returns>
        [HttpGet(Endpoints.CastingEndpoints.GetCastingBanner)]
        [ProducesResponseType(typeof(CastingBannerDto), 200)]
        [ProducesResponseType(404)]
        [RoleAuthorize("Admin", "Model", "Photographer", "Designer", "Volunteer")]
        public async Task<IActionResult> GetCastingBanner(Guid castingId)
        {


            try
            {
                var banner = await _castingBannerService.GetBannerAsync(castingId);
                if (banner == null)
                {
                    return NotFound(new { message = "No banner found for this casting." });
                }
                return Ok(banner);
            }
            catch (KeyNotFoundException ex)
            {
                _logger.LogWarning(ex, "Failed to get casting banner. {Message}", ex.Message);
                return NotFound(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Upload casting banner by casting Id.
        /// </summary>
        /// <param name="castingId"></param>
        /// <param name="form"></param>
        /// <returns></returns>
        [HttpPost(Endpoints.CastingEndpoints.UploadCastingBanner)]
        [ProducesResponseType(typeof(CastingBannerDto), 201)]
        [ProducesResponseType(400)]
        [ProducesResponseType(404)]
        [Consumes("multipart/form-data")]
        [RoleAuthorize("Admin")]

        public async Task<IActionResult> UploadCastingBanner([FromRoute] Guid castingId, [FromForm] UploadPhotoForm form)
        {
            if (form.File is null || form.File.Length == 0)
                return BadRequest("No file provided.");
            try
            {
                var banner = await _castingBannerService.SaveBanerAsync(castingId, form.File);
                return CreatedAtAction(nameof(GetCastingBanner), new { castingId }, banner);
            }
            catch (KeyNotFoundException ex)
            {
                _logger.LogWarning(ex, "Failed to upload casting banner. {Message}", ex.Message);
                return NotFound(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Delete casting banner by casting Id.
        /// </summary>
        /// <param name="castingId"></param>
        /// <returns></returns>
        [HttpDelete(Endpoints.CastingEndpoints.DeleteCastingBanner)]
        [ProducesResponseType(204)]
        [ProducesResponseType(404)]
        [RoleAuthorize("Admin")]
        public async Task<IActionResult> DeleteCastingBanner([FromRoute] Guid castingId)
        {
            try
            {
                await _castingBannerService.DeleteBannerAsync(castingId);
                return NoContent();
            }
            catch (KeyNotFoundException ex)
            {
                _logger.LogWarning(ex, "Failed to delete casting banner. {Message}", ex.Message);
                return NotFound(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Get pending users by casting Id.
        /// </summary>
        /// <param name="castingId"></param>
        /// <returns></returns>
        [HttpGet(Endpoints.CastingEndpoints.GetPendingUsersByCastingId)]
        [ProducesResponseType(typeof(IEnumerable<UserDto.Read>), 200)]
        [ProducesResponseType(404)]
        [RoleAuthorize("Admin")]
        public async Task<IActionResult> GetPendingUsersByCastingId([FromRoute] Guid castingId)
        {
            try
            {
                var assignments = await _castingService.GetCastingPendingUsersByCastingId(castingId);
                if (assignments == null || !assignments.Any())
                {
                    string[] result = [];
                    return Ok(result);
                }

                return Ok(assignments.Select(a => new
                {
                    AssignmentId = a.Id,
                    User = a.User.ToReadDto()
                }));
            }
            catch (KeyNotFoundException ex)
            {
                _logger.LogWarning(ex, "Failed to get pending users. {Message}", ex.Message);
                return NotFound(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Get all users by casting Id.
        /// </summary>
        /// <param name="castingId"></param>
        /// <returns></returns>
        [HttpGet(Endpoints.CastingEndpoints.GetAllUsersByCastingId)]
        [ProducesResponseType(typeof(IEnumerable<UserDto.Read>), 200)]
        [ProducesResponseType(404)]
        [RoleAuthorize("Admin")]
        public async Task<IActionResult> GetAllUsersByCastingId([FromRoute] Guid castingId)
        {
            try
            {
                if (castingId == Guid.Empty)
                {
                    return BadRequest(new { message = "Invalid casting ID." });
                }
                else if (await _castingService.GetById(castingId) == null)
                {
                    return NotFound(new { message = "Casting not found." });
                }

                var assignments = await _castingService.GetCastingAllUsersByCastingId(castingId);
                if (assignments == null || !assignments.Any())
                {
                    string[] result = [];
                    return Ok(result);
                }


                return Ok(new
                {
                    Statistics = new
                    {
                        Pending = assignments.Count(a => a.UserAcceptanceStatus == CastingUserStatus.Pending),
                        Active = assignments.Count(a => a.UserAcceptanceStatus == CastingUserStatus.Active),
                        Rejected = assignments.Count(a => a.UserAcceptanceStatus == CastingUserStatus.Rejected),
                        TotalApplicants = assignments.Count()
                    },
                    Users = assignments.Select(a => new
                    {
                        AssignmentId = a.Id,
                        AssignmentStatus = a.UserAcceptanceStatus.ToString(),
                        User = a.User.ToReadDto()
                    }
                    )
                });
            }
            catch (KeyNotFoundException ex)
            {
                _logger.LogWarning(ex, "Failed to get pending users. {Message}", ex.Message);
                return NotFound(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Change user casting assignment status.
        /// </summary>
        /// <param name="assigmentId"></param>
        /// <param name="AssignmentStatus"></param>
        /// <returns></returns>
        [HttpPost(Endpoints.CastingEndpoints.ChangeUserAssignmentStatus)]
        [ProducesResponseType(204)]
        [ProducesResponseType(400)]
        [ProducesResponseType(404)]
        [RoleAuthorize("Admin")]
        public async Task<IActionResult> ChangeUserAssignmentStatus([FromRoute] Guid assigmentId, [FromQuery] string AssignmentStatus)
        {
            try
            {
                CastingUserStatus parsedAssignmentStatus;
                if (!Enum.TryParse<CastingUserStatus>(AssignmentStatus, true, out parsedAssignmentStatus))
                {
                    return BadRequest(new { message = "Invalid status value. Allowed values are: Active, Rejected." });
                }
                await _castingService.ChangeUserCastingStatus(assigmentId, parsedAssignmentStatus);
                return NoContent();
            }
            catch (KeyNotFoundException ex)
            {
                _logger.LogWarning(ex, "Failed to change user assignment status. {Message}", ex.Message);
                return NotFound(new { message = ex.Message });
            }



        }

        [HttpGet(Endpoints.CastingEndpoints.GettActiveUsersByCastingId)]
        [ProducesResponseType(typeof(IEnumerable<UserDto.Read>), 200)]
        [ProducesResponseType(404)]
        [RoleAuthorize("Admin")]
        public async Task<IActionResult> GetActiveUsersByCastingId([FromRoute] Guid castingId)
        {
            try
            {
                var assignments = await _castingService.GetCastingUsersByStatus(castingId, CastingUserStatus.Active);
                if (assignments == null || !assignments.Any())
                {
                    string[] result = [];
                    return Ok(result);
                }
                return Ok(assignments.Select(a => new
                {
                    AssignmentId = a.Id,
                    AssignmentStatus = a.UserAcceptanceStatus.ToString(),
                    User = a.User.ToReadDto()
                }));
            }
            catch (KeyNotFoundException ex)
            {
                _logger.LogWarning(ex, "Failed to get active users. {Message}", ex.Message);
                return NotFound(new { message = ex.Message });
            }




        }
    }
}
