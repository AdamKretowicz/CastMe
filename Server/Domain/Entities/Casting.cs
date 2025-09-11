using CastMe.Domain.Entities;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace Domain.Entities
{
    [Table("Castings", Schema = "Casting")]
    public class Casting
    {
        [Key]
        public Guid Id { get; set; }

        [Required, StringLength(100, MinimumLength = 5)]
        public string Title { get; set; } = default!;

        [Required, StringLength(2000, MinimumLength = 20)]
        public string Description { get; set; } = default!;

        [Required, StringLength(100, MinimumLength = 2)]
        public string Location { get; set; } = default!;

        [Required]
        public DateTime EventDate { get; set; }

        [StringLength(1000)]
        public string? Requirements { get; set; }

        [StringLength(100)]
        public string? Compensation { get; set; }

        [StringLength(200)]
        public string? BannerUrl { get; set; }

        [Required]
        public Guid OrganizerId { get; set; }

        [Required]
        public CastingStatus Status { get; set; } = CastingStatus.Active;

        [Required]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }

        public ICollection<CastingRole> Roles { get; set; } = new List<CastingRole>();
        public ICollection<CastingTag> Tags { get; set; } = new List<CastingTag>();
        // Relacja do przypisanych użytkowników w rolach
        public ICollection<CastingAssignment> Assignments { get; set; } = new List<CastingAssignment>();

    }





}
