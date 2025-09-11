using CastMe.Domain.Entities;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Entities
{
    [Table("CastingAssignments", Schema = "Casting")]
    public class CastingAssignment
    {
        [Key]
        public Guid Id { get; set; }

        [Required]
        public Guid CastingId { get; set; }
        public Casting Casting { get; set; } = default!;

        [Required]
        public Guid RoleId { get; set; }
        public UserRole Role { get; set; } = default!;

        [Required]
        public Guid UserId { get; set; }
        public User User { get; set; } = default!;
    }

}
