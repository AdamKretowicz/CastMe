// CastMe.Api/Controllers/PhotosController.cs
using Application.Dtos.Photo;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using WebApi.Extensions;
using WebApi.Services.Photo;

namespace CastMe.Api.Controllers
{
    [ApiController]
    [Route("api/users/{userId:guid}/photos")]
    public class PhotosController : ControllerBase
    {
        private readonly IPhotoService _service;

        public PhotosController(IPhotoService service) => _service = service;

        /// <summary>Lista zdjęć użytkownika (publiczna, zwraca URL-e do statycznych plików).</summary>
        [HttpGet]
        [AllowAnonymous]
        [ProducesResponseType(typeof(IReadOnlyList<PhotoDto>), StatusCodes.Status200OK)]
        [RoleAuthorize("Admin", "Model", "Photographer","Designer", "Guest")]
        public async Task<IActionResult> GetUserPhotos([FromRoute] Guid userId, CancellationToken ct)
        {
            var items = await _service.GetUserPhotosAsync(userId, ct);
            return Ok(items);
        }

        /// <summary>Upload jednego zdjęcia (multipart/form-data, pole "file").</summary>
        [HttpPost]
        [Authorize]
        [Consumes("multipart/form-data")]
        [RequestSizeLimit(50_000_000)]
        [ProducesResponseType(typeof(PhotoDto), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [RoleAuthorize("Admin", "Model", "Photographer", "Designer", "Guest")]
        [CurrentUser]
        public async Task<IActionResult> Uploaad(
            [FromRoute] Guid userId,
            [FromForm] UploadPhotoForm form,   // <- DTO z IFormFile
            CancellationToken ct)
        {
            if (form.File is null || form.File.Length == 0)
                return BadRequest("No file provided.");

            var dto = await _service.UploadAsync(userId, form.File, ct);
            // Zwracamy 201 + body; Location wskazuje na listę zasobów
            return CreatedAtAction(nameof(GetUserPhotos), new { userId }, dto);
        }

        /// <summary>Usuń zdjęcie z galerii użytkownika.</summary>
        [HttpDelete("{photoId:guid}")]
        [Authorize]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [RoleAuthorize("Admin", "Model", "Photographer", "Designer", "Guest")]
        [CurrentUser]
        public async Task<IActionResult> Delete([FromRoute] Guid userId, [FromRoute] Guid photoId, CancellationToken ct)
        {
            var currentUserId = User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            if (currentUserId is null)
                return Forbid();

            if (!User.IsInRole("Admin") && currentUserId != userId.ToString())
                return Forbid();


            await _service.DeleteAsync(userId, photoId, ct);
            return NoContent();
        }

        /// <summary>Ustaw wskazane zdjęcie jako główne (IsMain=true).</summary>
        [HttpPut("{photoId:guid}/main")]
        [Authorize]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [RoleAuthorize("Admin", "Model", "Photographer", "Designer", "Guest")]
        [CurrentUser]
        public async Task<IActionResult> SetMain([FromRoute] Guid userId, [FromRoute] Guid photoId, CancellationToken ct)
        {
            await _service.SetMainAsync(userId, photoId, ct);
            return NoContent();
        }

        /// <summary>Zmień kolejność zdjęć (przekaż listę ID w docelowej kolejności).</summary>
        [HttpPatch("reorder")]
        [Authorize]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [RoleAuthorize("Admin", "Model", "Photographer", "Designer", "Guest")]
        [CurrentUser]
        public async Task<IActionResult> Reorder(
            [FromRoute] Guid userId,
            [FromBody] ReorderPhotosRequest body,
            CancellationToken ct)
        {
            if (body?.OrderedPhotoIds is null || body.OrderedPhotoIds.Count == 0)
                return BadRequest("OrderedPhotoIds is required.");

            await _service.ReorderAsync(userId, body.OrderedPhotoIds, ct);
            return NoContent();
        }
    }
}
