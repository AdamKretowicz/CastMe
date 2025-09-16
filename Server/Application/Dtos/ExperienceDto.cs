using CastMe.Domain.Entities;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Dtos
{
    public class ExperienceDto
    {
        public class Create
        {
            public string ProjectName { get; set; } = default!;
            public string Role { get; set; } = default!;
            public string? Description { get; set; }
            public DateTime StartDate { get; set; }
            public DateTime? EndDate { get; set; }
            public string? Link { get; set; }
        }

        public class Update
        {
            public string ProjectName { get; set; } = default!;
            public string Role { get; set; } = default!;
            public string? Description { get; set; }
            public DateTime StartDate { get; set; }
            public DateTime? EndDate { get; set; }
            public string? Link { get; set; }
        }

        public class Read
        {
            public Guid Id { get; set; }
            public string ProjectName { get; set; } = default!;
            public string Role { get; set; } = default!;
            public string? Description { get; set; }
            public DateTime StartDate { get; set; }
            public DateTime? EndDate { get; set; }
            public string? Link { get; set; }
            public DateTime CreatedAt { get; set; }
        }
    }

    
}
