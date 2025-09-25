using Application.Dtos;
using Application.Dtos.Photo;
using CastMe.Domain.Entities;
using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Mapper
{
    public static class PhotoMapper
    {
        public static PhotoDto ToReadDto(this Photo photo)
        {
            return new PhotoDto
            {
                Id = photo.Id,
                Url = photo.Url,
                IsMain = photo.IsMain,
                OriginalFileName = photo.OriginalFileName,
                ContentType = photo.ContentType,
                SizeBytes = photo.SizeBytes,
                CreatedAtUtc = photo.CreatedAtUtc,
                Order = photo.Order
            };




        }
    }
}
