using Application.Interfaces;
using Application.Mapper;
using CastMe.UserApi.Services;
using Microsoft.AspNetCore.Mvc;
using WebApi.Endpoints;
using WebApi.Extensions;
using WebApi.Services.Photo;

namespace WebApi.Controllers
{
    [ApiController]
    [Route("experience")]
    [Tags("Experience")]
    [Produces("application/json")]
    public class ExperienceController : ControllerBase
    {
        private readonly UserService _userService;
        private readonly ILogger<ExperienceController> _logger;
        private readonly IEmailSender _emailSender;
        private readonly IPhotoService _photoService;
        private readonly IUserFilterRepository _userFilter;
        private readonly IExperienceService _experienceService;

        public ExperienceController(UserService userService, ILogger<ExperienceController> logger, IEmailSender emailSender, IPhotoService photoService, IUserFilterRepository userFilter, IExperienceService experienceService)
        {
            _userService = userService;
            _logger = logger;
            _emailSender = emailSender;
            _photoService = photoService;
            _userFilter = userFilter;
            _experienceService = experienceService;
        }

        [HttpGet(ExperienceEndpoints.GetExperiencesByUserId)]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [RoleAuthorize("Admin", "Model")]
        [CurrentUser]
        public async Task<IActionResult> GetByUserId([FromRoute] Guid userId)
        {
            var experience = await _experienceService.GetExperienceByUserId(userId);
            if (experience is null) return NotFound();

            return Ok(experience.ToReadDto());
        }

        [HttpPost(ExperienceEndpoints.AddExperience)]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [RoleAuthorize("Admin", "Model")]
        [CurrentUser]
        public async Task<IActionResult> AddExperience([FromRoute] Guid userId, [FromBody] Application.Dtos.ExperienceDto.Create experienceDto)
        {
            var experience = experienceDto.ToEntity(userId);
            var createdExperience = await _experienceService.AddExperience(userId, experience);
            return CreatedAtAction(nameof(GetByUserId), new { userId = userId }, createdExperience.ToReadDto());
        }
        [HttpPut(ExperienceEndpoints.UpdateExperience)]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [RoleAuthorize("Admin", "Model")]
        [CurrentUser]
        public async Task<IActionResult> UpdateExperience([FromRoute] Guid userId, [FromBody] Application.Dtos.ExperienceDto.Update experienceDto)
        {
            var existingExperience = await _experienceService.GetExperienceByUserId(userId);
            if (existingExperience is null) return NotFound();
            existingExperience.UpdateEntity(experienceDto);

            await _experienceService.UpdateExperience(existingExperience);
            return NoContent();
        }

        [HttpDelete(ExperienceEndpoints.DeleteExperience)]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [RoleAuthorize("Admin", "Model")]
        [CurrentUser]
        public async Task<IActionResult> DeleteExperience([FromRoute] Guid userId)
        {
            var existingExperience = await _experienceService.GetExperienceByUserId(userId);
            if (existingExperience is null) return NotFound();
            await _experienceService.DeleteExperience(userId);
            return NoContent();
        }





    }
}
