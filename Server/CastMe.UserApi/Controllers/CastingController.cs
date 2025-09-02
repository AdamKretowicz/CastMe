using Application.Dtos;
using Application.Mapper;
using Microsoft.AspNetCore.Mvc;
using WebApi.Services;

namespace WebApi.Controllers
{
    [ApiController]
    public class CastingController : ControllerBase
    {
        private readonly CastingService _castingService;
        private readonly ILogger<CastingController> _logger;

        public CastingController(CastingService castingService, ILogger<CastingController> logger)
        {
            _castingService = castingService;
            _logger = logger;
        }



        [HttpGet(Endpoints.CastingEndpoints.GetAll)]
        [ProducesResponseType(typeof(CastingDto.Read), 201)]
        public async Task<ActionResult<IEnumerable<CastingDto.Read>>> GetAllUsers()
        {
            var castings = await _castingService.GetAllCastings();
            return Ok(castings.Select(c => c.ToReadDto()));
        }

        [HttpGet(Endpoints.CastingEndpoints.GetById)]
        [ProducesResponseType(typeof(CastingDto.Read), 200)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> GetById(Guid id)
        {
            var casting = await _castingService.GetById(id);
            if (casting is null) return NotFound();
            return Ok(casting.ToReadDto());
        }


        [HttpGet(Endpoints.CastingEndpoints.GetByOrganiserId)]
        [ProducesResponseType(typeof(IEnumerable<CastingDto.Read>), 200)]
        [ProducesResponseType(404)]
        public async Task<ActionResult<IEnumerable<CastingDto.Read>>> GetByOrganiserId([FromBody] Guid userId)
        {
            var castings = await _castingService.GetCastingsByOrganiserId(userId);
            return Ok(castings.Select(c => c.ToReadDto()));
        }

        [HttpPost(Endpoints.CastingEndpoints.Create)]
        [ProducesResponseType(typeof(CastingDto.Read), 201)]
        [ProducesResponseType(400)]
        public async Task<IActionResult> Create([FromBody] CastingDto.Create dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var casting = dto.ToEntity();
            await _castingService.Add(casting);
            return CreatedAtAction(nameof(GetById), new { id = casting.Id }, casting.ToReadDto());
        }

        [HttpPut(Endpoints.CastingEndpoints.Update)]
        [ProducesResponseType(204)]
        [ProducesResponseType(400)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> Update(Guid id, [FromBody] CastingDto.Update dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var existingCasting = await _castingService.GetById(id);
            if (existingCasting is null) return NotFound();

            existingCasting.UpdateEntity(dto);
            await _castingService.Update(existingCasting);
            return Ok(existingCasting.ToReadDto());
        }

        [HttpDelete(Endpoints.CastingEndpoints.Delete)]
        [ProducesResponseType(204)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> Delete(Guid id)
        {
            var existingCasting = await _castingService.GetById(id);
            if (existingCasting is null) return NotFound();
            await _castingService.Delete(id);
            return NoContent();
        }









    }
}
