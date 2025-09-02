using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Entities
{
    [Table("CastingRoles", Schema = "Casting")]
    public class CastingRole
    {
        [Key]
        public Guid Id { get; set; }

        [Required]
        public Guid CastingId { get; set; }

        [ForeignKey(nameof(CastingId))]
        public Casting Casting { get; set; } = default!;

        [Required]
        public CastingRoleType Role { get; set; }

        [Required]
        public int Capacity { get; set; }

        public int AcceptedCount { get; set; } = 0;
    }
}
