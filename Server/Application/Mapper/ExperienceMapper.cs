using Application.Dtos;
using CastMe.User.CrossCutting.DTOs;
using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Mapper
{
    public static class ExperienceMapper
    {

        //READ ENTITY -> DTO
        public static ExperienceDto.Read ToReadDto(this Experience experience)
        {
            return new ExperienceDto.Read
            {
                Id = experience.Id,
                ProjectName = experience.ProjectName,
                Role = experience.Role,
                Description = experience.Description,
                StartDate = experience.StartDate.Date,
                EndDate = experience.EndDate?.Date,
                Link = experience.Link,
                CreatedAt = experience.CreatedAt.Date
            };
        }
        //CREATE DTO -> ENTITY
        public static Experience ToEntity(this ExperienceDto.Create dto,Guid userId)
        {
            return new Experience
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                ProjectName = dto.ProjectName,
                Role = dto.Role,
                Description = dto.Description,
                StartDate = dto.StartDate,
                EndDate = dto.EndDate,
                Link = dto.Link,
                CreatedAt = DateTime.UtcNow.Date,
            };
        }
        //UPDATE DTO -> ENTITY
        public static void UpdateEntity(this Experience experience, ExperienceDto.Update dto)
        {
            experience.ProjectName = dto.ProjectName;
            experience.Role = dto.Role;
            experience.Description = dto.Description;
            experience.StartDate = dto.StartDate;
            experience.EndDate = dto.EndDate;
            experience.Link = dto.Link;
        }



    }
}
