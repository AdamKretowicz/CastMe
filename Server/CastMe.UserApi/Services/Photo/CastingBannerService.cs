using Application.Dtos.Photo;
using Application.Interfaces;
using Application.Mapper;
using Azure.Storage.Blobs;
using CastMe.Domain.Entities;
using Domain.Entities;
using Infrastructure.Context;
using Infrastructure.Storage;
using Microsoft.EntityFrameworkCore;

namespace WebApi.Services.Photo
{
    public class CastingBannerService : ICastingBannerService
    {
        private readonly UserDbContext _db;
        private readonly IConfiguration _cfg;
        private readonly BlobContainerClient _container;

        public CastingBannerService(UserDbContext db, IConfiguration cfg, BlobContainerClient container)
        {
            _db = db;
            _cfg = cfg;
            _container = container;
        }

        public async Task DeleteBannerAsync(Guid castingId, CancellationToken ct = default)
        {
            var entity = await _db.CastingBanners.FirstOrDefaultAsync(p => p.CastingId == castingId, ct);
            if (entity == null) throw new KeyNotFoundException("Photo not found.");

            _db.CastingBanners.Remove(entity);
            await _db.SaveChangesAsync(ct);

            var blobClient = _container.GetBlobClient(entity.FileName);
            await blobClient.DeleteIfExistsAsync(cancellationToken: ct);
        }

        public async Task<CastingBannerDto> GetBannerAsync(Guid castingId, CancellationToken ct = default)
        {
            var casting = await _db.Castings.Where(i => i.Id == castingId).Include(b => b.Banner).FirstOrDefaultAsync();
            if (casting.Banner == null) return null;

            var item = await _db.CastingBanners
                .Where(p => p.CastingId == castingId)
                .AsNoTracking()
                .FirstOrDefaultAsync();

            return item.ToBannerDto();
        }

        public async Task<CastingBannerDto> SaveBanerAsync(Guid castingId, IFormFile file, CancellationToken ct = default)
        {
            if (castingId == Guid.Empty)
                throw new ArgumentException("Invalid casting id.", nameof(castingId));


            var casting = _db.Castings.Include(c=> c.Banner).FirstOrDefault(p => p.Id == castingId);
            
            if (casting == null)
                throw new KeyNotFoundException("Casting not found.");

            if (file == null || file.Length == 0)
                throw new ArgumentException("Empty file.", nameof(file));

            var allowed = _cfg.GetSection("Upload:AllowedContentTypes").Get<string[]>() ?? Array.Empty<string>();
            var maxMb = _cfg.GetValue<int?>("Upload:MaxUploadSizeMB") ?? 10;

            if (!allowed.Contains(file.ContentType))
                throw new InvalidOperationException($"Unsupported content type: {file.ContentType}");

            if (file.Length > maxMb * 1024L * 1024L)
                throw new InvalidOperationException($"File too large. Max {maxMb} MB.");

            //Delete existing banner if any
            if (casting.Banner != null)
                DeleteBannerAsync(castingId, ct).GetAwaiter().GetResult();

            var ext = Path.GetExtension(file.FileName);
            var blobName = $"CastingBanners/{castingId}/{Guid.NewGuid():N}{ext}";
            var blobClient = _container.GetBlobClient(blobName);

            await using var stream = file.OpenReadStream();

            await blobClient.UploadAsync(stream, overwrite: true, cancellationToken: ct);


            var url = blobClient.Uri.ToString();

            var entity = new CastingBanner
            {
                Id = Guid.NewGuid(),
                CastingId = castingId,
                FileName = blobName,
                OriginalFileName = file.FileName,
                ContentType = file.ContentType,
                SizeBytes = file.Length,
                Url = url,
                
            };

            _db.CastingBanners.Add(entity);
            await _db.SaveChangesAsync(ct);

            return entity.ToBannerDto();
        }
    }
}

