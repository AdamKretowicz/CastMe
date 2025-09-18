using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WebApi.Services;

namespace WebApi.Controllers
{
    [ApiController]
    [Route("favourites")]
    [Tags("Favourite")]
    [Produces("application/json")]
    [Authorize(Roles = "Admin")]
    public class FavouriteController : ControllerBase
    {
        private readonly FavouriteService _service;
        private readonly ILogger<FavouriteController> _logger;

        public FavouriteController(FavouriteService service, ILogger<FavouriteController> logger)
        {
            _service = service;
            _logger = logger;
        }

        /// <summary>Pobranie listy ulubionych modeli.</summary>
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var items = await _service.GetAllAsync(User);
            return Ok(items);
        }

        /// <summary>Dodanie modela do ulubionych.</summary>
        [HttpPost("{modelId:guid}")]
        public async Task<IActionResult> Add([FromRoute] Guid modelId)
        {
            try
            {
                await _service.AddAsync(User, modelId);
                return NoContent();
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>Usunięcie modela z ulubionych.</summary>
        [HttpDelete("{modelId:guid}")]
        public async Task<IActionResult> Remove([FromRoute] Guid modelId)
        {
            await _service.RemoveAsync(User, modelId);
            return NoContent();
        }

        
    }
}
