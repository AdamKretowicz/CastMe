using Application.Dtos;
using Application.Dtos.Photo;
using Domain.Entities;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Interfaces
{
    public interface ICastingBannerService
    {
        Task<CastingBannerDto> SaveBanerAsync(Guid castingId, IFormFile file, CancellationToken ct = default);
        Task<CastingBannerDto> GetBannerAsync(Guid castingId, CancellationToken ct = default);
        Task DeleteBannerAsync(Guid castingId, CancellationToken ct = default);




    }
}
