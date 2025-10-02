using Application.Dtos.Photo;
using CastMe.Domain.Entities;

namespace WebApi.Services.Photo
{
    public interface IPhotoService
    {
        Task<IReadOnlyList<PhotoDto>> GetUserPhotosAsync(Guid userId, CancellationToken ct = default);
        Task<IReadOnlyList<PhotoDto>> GetPendingUserPhotosAsync(Guid userId, CancellationToken ct = default);
        Task<PhotoDto> UploadAsync(Guid userId, IFormFile file, CancellationToken ct = default);
        Task DeleteAsync(Guid userId, Guid photoId, CancellationToken ct = default);
        Task SetMainAsync(Guid userId, Guid photoId, CancellationToken ct = default);
        Task ReorderAsync(Guid userId, List<Guid> orderedPhotoIds, CancellationToken ct = default);
        Task UpdatePhotoStatus(List<PhotoDtoUpdate> photos, CancellationToken ct = default);
        Task<IReadOnlyList<PhotoDto>> GetAllPendingPhotos(CancellationToken ct = default);
    }
}
