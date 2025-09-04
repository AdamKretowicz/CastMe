using Application.Dtos.Photo;
using Domain.Entities;
using Infrastructure.Context;
using Infrastructure.Storage;
using Microsoft.EntityFrameworkCore;
using WebApi.Services.Photo;

namespace CastMe.Api.Features.Photos
{
    public class PhotoService : IPhotoService
    {
        private readonly UserDbContext _db;
        private readonly IImageStorage _storage;
        private readonly IConfiguration _cfg;

        public PhotoService(UserDbContext db, IImageStorage storage, IConfiguration cfg)
        {
            _db = db;
            _storage = storage;
            _cfg = cfg;
        }

        public async Task<IReadOnlyList<PhotoDto>> GetUserPhotosAsync(Guid userId, CancellationToken ct = default)
        {
            var items = await _db.Photos
                .Where(p => p.UserId == userId)
                .OrderBy(p => p.Order).ThenByDescending(p => p.IsMain)
                .AsNoTracking()
                .ToListAsync(ct);

            return items.Select(Map).ToList();
        }

        public async Task<PhotoDto> UploadAsync(Guid userId, IFormFile file, CancellationToken ct = default)
        {
            if (file == null || file.Length == 0)
                throw new ArgumentException("Empty file.", nameof(file));

            var allowed = _cfg.GetSection("Upload:AllowedContentTypes").Get<string[]>() ?? Array.Empty<string>();
            var maxMb = _cfg.GetValue<int?>("Upload:MaxUploadSizeMB") ?? 10;

            if (!allowed.Contains(file.ContentType))
                throw new InvalidOperationException($"Unsupported content type: {file.ContentType}");

            if (file.Length > maxMb * 1024L * 1024L)
                throw new InvalidOperationException($"File too large. Max {maxMb} MB.");

            var ext = Path.GetExtension(file.FileName);
            var relative = $"{userId}/{Guid.NewGuid():N}{ext}";

            await using var stream = file.OpenReadStream();
            await _storage.SaveAsync(relative, stream);

            var url = _storage.GetPublicUrl(relative);
            var maxOrder = await _db.Photos.Where(p => p.UserId == userId).MaxAsync(p => (int?)p.Order, ct) ?? -1;

            var entity = new Photo
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                FileName = relative,
                OriginalFileName = file.FileName,
                ContentType = file.ContentType,
                SizeBytes = file.Length,
                Url = url,
                Order = maxOrder + 1,
                IsMain = false
            };

            _db.Photos.Add(entity);
            await _db.SaveChangesAsync(ct);

            return Map(entity);
        }

        public async Task DeleteAsync(Guid userId, Guid photoId, CancellationToken ct = default)
        {
            var entity = await _db.Photos.FirstOrDefaultAsync(p => p.Id == photoId && p.UserId == userId, ct);
            if (entity == null) throw new KeyNotFoundException("Photo not found.");

            _db.Photos.Remove(entity);
            await _db.SaveChangesAsync(ct);

            await _storage.DeleteAsync(entity.FileName);
        }

        public async Task SetMainAsync(Guid userId, Guid photoId, CancellationToken ct = default)
        {
            var photos = await _db.Photos.Where(p => p.UserId == userId).ToListAsync(ct);
            if (!photos.Any()) throw new KeyNotFoundException("No photos for user.");

            var target = photos.FirstOrDefault(p => p.Id == photoId);
            if (target == null) throw new KeyNotFoundException("Photo not found.");

            foreach (var p in photos) p.IsMain = p.Id == target.Id;
            await _db.SaveChangesAsync(ct);
        }

        public async Task ReorderAsync(Guid userId, List<Guid> orderedPhotoIds, CancellationToken ct = default)
        {
            var photos = await _db.Photos
                .Where(p => p.UserId == userId && orderedPhotoIds.Contains(p.Id))
                .ToListAsync(ct);

            if (photos.Count != orderedPhotoIds.Count)
                throw new InvalidOperationException("Some photo IDs are invalid.");

            var orderMap = orderedPhotoIds
                .Select((id, idx) => new { id, idx })
                .ToDictionary(x => x.id, x => x.idx);

            foreach (var p in photos) p.Order = orderMap[p.Id];
            await _db.SaveChangesAsync(ct);
        }

        private static PhotoDto Map(Photo p) => new PhotoDto
        {
            Id = p.Id,
            Url = p.Url,
            OriginalFileName = p.OriginalFileName,
            ContentType = p.ContentType,
            SizeBytes = p.SizeBytes,
            Order = p.Order,
            IsMain = p.IsMain,
            CreatedAtUtc = p.CreatedAtUtc
        };
    }
}
