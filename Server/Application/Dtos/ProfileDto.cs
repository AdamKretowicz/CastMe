using CastMe.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Dtos
{
    public class ProfileDto
    {
        public class Read()
        {
            public Guid Id { get; set; }
            public string UserName { get; set; } = default!;
            public string FirstName { get; set; } = default!;
            public string LastName { get; set; } = default!;

            public string Phone { get; set; } = "000000000";
            public DateTime DateOfBirth { get; set; }

            public string Email { get; set; } = default!;
            public string Country { get; set; } = default!;
            public string City { get; set; } = default!;
            public Gender Gender { get; set; }

            public int? Height { get; set; }
            public int? Weight { get; set; }
            public string? HairColor { get; set; } = default!;
            public string? ClothingSize { get; set; } = default!;

            public string? Description { get; set; }

            public string Role { get; set; } = default!;
            public ICollection<Photo.PhotoDto>? Photos { get; set; } = new List<Photo.PhotoDto>();
            public ICollection<ExperienceDto.Read>? Experiences { get; set; } = new List<ExperienceDto.Read>();
        }
    }
}
