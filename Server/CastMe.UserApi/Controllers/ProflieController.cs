using Microsoft.AspNetCore.Mvc;
using WebApi.Extensions;
using WebApi.Services;

namespace WebApi.Controllers
{
    [ApiController]
    [Route("user/profile")]
    [Tags("Profiles")]
    [Produces("application/json")]
    public class ProflieController : ControllerBase
    {
        private readonly ProfileService _profileService;

        public ProflieController(ProfileService profileService)
        {
            _profileService = profileService;
        }

        /// <summary>
        /// Retrieves the profile details for a specific user by their ID.
        /// </summary>
        /// <param name="userId"></param>
        /// <returns></returns>
        [HttpGet("{userId:guid}")]
        [ProducesResponseType(typeof(Application.Dtos.ProfileDto.Read), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [RoleAuthorize("Admin", "Model", "Photographer", "Designer", "Volunteer", "Guest")]
        [CurrentUser]
        public async Task<IActionResult> GetProfileByIdAsync(Guid userId)
        {
            var profile = await _profileService.GetProfileByIdAsync(userId);

            if (profile == null)
                return NotFound();

            return Ok(profile);

        }
    }
}
