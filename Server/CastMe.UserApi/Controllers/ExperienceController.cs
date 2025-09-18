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

        private readonly IExperienceService _experienceService;

        public ExperienceController(IExperienceService experienceService)
        {
            _experienceService = experienceService;
        }

        ///<summary> Retrieves the experience details for a specific user by their ID. </summary>
        [HttpGet(ExperienceEndpoints.GetExperiencesByUserId)]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [RoleAuthorize("Admin", "Model", "Photographer", "Designer")]
        [CurrentUser]
        public async Task<IActionResult> GetByUserId([FromRoute] Guid userId)
        {
            var experience = await _experienceService.GetExperienceByUserId(userId);
            if (experience is null) return NotFound();

            return Ok(experience.ToReadDto());
        }

        /// <summary>
        /// Adds a new experience entry for a specific user.
        /// </summary>
        /// <param name="userId"></param>
        /// <param name="experienceDto"></param>
        /// <returns></returns>
        [HttpPost(ExperienceEndpoints.AddExperience)]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [RoleAuthorize("Admin", "Model", "Photographer", "Designer")]
        [CurrentUser]
        public async Task<IActionResult> AddExperience([FromRoute] Guid userId, [FromBody] Application.Dtos.ExperienceDto.Create experienceDto)
        {
            var experience = experienceDto.ToEntity(userId);
            var createdExperience = await _experienceService.AddExperience(userId, experience);
            return CreatedAtAction(nameof(GetByUserId), new { userId = userId }, createdExperience.ToReadDto());
        }


        /// <summary>
        /// Updates an existing experience entry for a specific user.
        /// </summary>
        /// <param name="userId"></param>
        /// <param name="experienceDto"></param>
        /// <returns></returns>
        [HttpPut(ExperienceEndpoints.UpdateExperience)]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [RoleAuthorize("Admin", "Model", "Photographer", "Designer")]
        [CurrentUser]
        public async Task<IActionResult> UpdateExperience([FromRoute] Guid userId, Guid experienceId, [FromBody] Application.Dtos.ExperienceDto.Update experienceDto)
        {
            var existingExperience = await _experienceService.GetExperienceById(experienceId);
            if (existingExperience is null) return NotFound();

            await _experienceService.UpdateExperience(existingExperience, experienceDto);
            return NoContent();
        }

        /// <summary>
        /// Deletes the experience entry for a specific user.
        /// </summary>
        /// <param name="userId"></param>
        /// <returns></returns>
        [HttpDelete(ExperienceEndpoints.DeleteExperience)]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [RoleAuthorize("Admin", "Model", "Photographer", "Designer")]
        [CurrentUser]
        public async Task<IActionResult> DeleteExperience([FromRoute] Guid userId, Guid experienceId)
        {
            var existingExperience = await _experienceService.GetExperienceByUserId(userId);
            if (existingExperience is null) return NotFound();
            await _experienceService.DeleteExperience(experienceId);
            return NoContent();
        }

        /// <summary>
        /// Retrieves all experience entries for a specific user by their ID.
        /// </summary>
        /// <param name="userId"></param>
        /// <returns></returns>
        [HttpGet(ExperienceEndpoints.GetAllExperiencesByUserId)]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [RoleAuthorize("Admin", "Model", "Photographer", "Designer")]
        [CurrentUser]
        public async Task<IActionResult> GetAllByUserId([FromRoute] Guid userId)
        {
            var experiences = await _experienceService.GetAllExperiencesByUserId(userId);
            if (experiences is null) return NotFound();
            var experienceDtos = experiences.Select(e => e?.ToReadDto()).ToList();
            return Ok(experienceDtos);
        }





    }
}
