using Application.Dtos;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Domain.Entities;
using Application.Dtos.Photo;
using Application.Mapper;
using CastMe.Domain.Entities;

namespace Application.Mapper
{
    public static class ProfileMapper
    {
        public static ProfileDto.Read ToReadDto(this User user, IReadOnlyList<Application.Dtos.Photo.PhotoDto> photos)
        {
            return new ProfileDto.Read
            {
                Id = user.Id,
                UserName = user.UserName,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Phone = user.Phone ?? "000000000",
                DateOfBirth = user.DateOfBirth,
                Email = user.Email,
                Country = user.Country,
                City = user.City,
                Weight = user.Weight,
                Height = user.Height,
                ClothingSize= user.ClothingSize,
                HairColor = user.HairColor,
                Description = user.Description ?? string.Empty,
                Gender = user.Gender,
                Role = user.Role.Name,
                Photos = photos.ToList(),
                Experiences = user.Experiences?.Select(e => e.ToReadDto()).ToList() ?? new List<ExperienceDto.Read>()

            };
        }
    }
}
