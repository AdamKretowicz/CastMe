using Application.Dtos.Photo;

namespace WebApi.Services.Photo
{
    public interface IPhotoService
    {
        Task<IReadOnlyList<PhotoDto>> GetUserPhotosAsync(Guid userId, CancellationToken ct = default);
        Task<PhotoDto> UploadAsync(Guid userId, IFormFile file, CancellationToken ct = default);
        Task DeleteAsync(Guid userId, Guid photoId, CancellationToken ct = default);
        Task SetMainAsync(Guid userId, Guid photoId, CancellationToken ct = default);
        Task ReorderAsync(Guid userId, List<Guid> orderedPhotoIds, CancellationToken ct = default);
    }
}
