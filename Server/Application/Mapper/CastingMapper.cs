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
    public static class CastingMapper
    {


        // ENTITY -> READ DTO
        public static CastingDto.Read ToReadDto(this Casting casting) => new CastingDto.Read
        {
            Id = casting.Id,
            Title = casting.Title,
            Description = casting.Description,
            Location = casting.Location,
            EventDate = casting.EventDate,
            Requirements = casting.Requirements,
            Compensation = casting.Compensation,
            OrganizerId = casting.OrganizerId,
            Status = casting.Status,
            CreatedAt = casting.CreatedAt,
            UpdatedAt = casting.UpdatedAt,
            Roles = casting.Roles.Select(r => new CastingDto.ReadRole
            {
                Role = r.Role,
                Capacity = r.Capacity,
                AcceptedCount = casting.Assignments.Count(a => a.UserAcceptanceStatus == CastingUserStatus.Active && a.Role.Name == r.Role.ToString())
            }).ToList(),
            Tags = casting.Tags.Select(t => t.Value).ToList(),

        };


        // CREATE DTO -> ENTITY
        public static Casting ToEntity(this CastingDto.Create dto, Guid organiserId)
        {
            var casting = new Casting
            {
                Title = dto.Title,
                Description = dto.Description,
                Location = dto.Location,
                EventDate = dto.EventDate,
                Requirements = dto.Requirements,
                Compensation = dto.Compensation,
                UpdatedAt = DateTime.UtcNow.Date,
                OrganizerId = organiserId,
            };
            // Mapowanie ról
            casting.Roles = dto.Roles.Select(r => new CastingRole
            {
                Role = r.Role,
                Capacity = r.Capacity
            }).ToList();
            // Mapowanie tagów
            casting.Tags = dto.Tags.Select(t => new CastingTag
            {
                Value = t
            }).ToList();
            return casting;
        }

        // UPDATE DTO -> ENTITY
        public static void UpdateEntity(this Casting casting, CastingDto.Update dto)
        {

            casting.Title = dto.Title;
            casting.Description = dto.Description;
            casting.Location = dto.Location;
            casting.EventDate = dto.EventDate;
            casting.Requirements = dto.Requirements;
            casting.Compensation = dto.Compensation;
            casting.Status = dto.Status;
            casting.UpdatedAt = DateTime.UtcNow.Date;
            // Aktualizacja ról
            casting.Roles.Clear();
            foreach (var roleDto in dto.Roles)
            {
                casting.Roles.Add(new CastingRole
                {
                    Role = roleDto.Role,
                    Capacity = roleDto.Capacity
                });
            }
            // Aktualizacja tagów
            casting.Tags.Clear();
            foreach (var tag in dto.Tags)
            {
                casting.Tags.Add(new CastingTag
                {
                    Value = tag
                });
            }
        }
        //ENTITY -> READ DTO (PARTICIPANT VIEW)
        public static CastingDto.ReadParticipants ToParticipantReadDto(this List<CastingAssignment> assignments)
            {
                if (assignments == null || !assignments.Any())
                {
                    return new CastingDto.ReadParticipants
                    {
                        CastingId = Guid.Empty,
                        Participants = new Dictionary<string, string>()
                    };
                }

                return new CastingDto.ReadParticipants
                {

                    CastingId = assignments.FirstOrDefault()!.CastingId,
                    Participants = assignments.ToDictionary(a => a.UserId.ToString(), a => a.Role.Name.ToString())
                };

        }



        // ENTITY -> READ DTO CastingBanner

        public static CastingBannerDto ToBannerDto(this CastingBanner banner) => new CastingBannerDto
        {
            Id = banner.Id,
            Url = banner.Url,
            ContentType = banner.ContentType,
            SizeBytes = banner.SizeBytes,
            FileName = banner.FileName,
            OriginalFileName = banner.OriginalFileName,
            CreatedAtUtc = banner.CreatedAtUtc


        };




    }
}
