using CastMe.Domain.Entities;
using Domain.Entities;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Dtos
{
    public static class CastingDto
    {
        public class Create
        {
            [Required, StringLength(100, MinimumLength = 5)]
            public string Title { get; set; } = default!;

            [Required, StringLength(2000, MinimumLength = 20)]
            public string Description { get; set; } = default!;

            [Required, StringLength(100, MinimumLength = 2)]
            public string Location { get; set; } = default!;

            [Required]
            public DateTimeOffset EventDate { get; set; }

            [StringLength(1000)]
            public string? Requirements { get; set; }

            [StringLength(100)]
            public string? Compensation { get; set; }

            [StringLength(200)]
            public string? BannerPath { get; set; }

            [MinLength(1)]
            public List<CreateRole> Roles { get; set; } = new();

            public List<string> Tags { get; set; } = new();
        }
        public class CreateRole
        {
            [Required]
            public CastingRoleType Role { get; set; }

            [Range(1, 100)]
            public int Capacity { get; set; } = 1;
        }
        public class Update
        {

            [Required, StringLength(100, MinimumLength = 5)]
            public string Title { get; set; } = default!;

            [Required, StringLength(2000, MinimumLength = 20)]
            public string Description { get; set; } = default!;

            [Required, StringLength(100, MinimumLength = 2)]
            public string Location { get; set; } = default!;

            [Required]
            public DateTimeOffset EventDate { get; set; }

            [StringLength(1000)]
            public string? Requirements { get; set; }

            [StringLength(100)]
            public string? Compensation { get; set; }

            [StringLength(200)]
            public string? BannerPath { get; set; }

            [MinLength(1)]
            public List<CreateRole> Roles { get; set; } = new();

            public List<string> Tags { get; set; } = new();

            public CastingStatus Status { get; set; } = CastingStatus.Active;
        }
        public class Read
        {
            public Guid Id { get; set; }
            public string Title { get; set; } = default!;
            public string Description { get; set; } = default!;
            public string Location { get; set; } = default!;
            public DateTimeOffset EventDate { get; set; }
            public string? Requirements { get; set; } = default!;
            public string? Compensation { get; set; } = default!;
            public string? BannerPath { get; set; } = default!;
            public Guid OrganizerId { get; set; }
            public CastingStatus Status { get; set; }
            public DateTime CreatedAt { get; set; }
            public DateTime? UpdatedAt { get; set; }
            public List<ReadRole> Roles { get; set; } = new List<ReadRole>();
            public List<string> Tags { get; set; } = new List<string>();
        }
        public class ReadRole
        {
            public CastingRoleType Role { get; set; }
            public int Capacity { get; set; }
            public int AcceptedCount { get; set; }
        }

    }

}
