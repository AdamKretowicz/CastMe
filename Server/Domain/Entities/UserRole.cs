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
    [Table("UserRoles", Schema = "User")]
    public class UserRole
    {
        [Key]
        public Guid Id { get; set; }
        [Required]
        public string Name { get; set; } = default!;   

        [Required]
        public ICollection<User> Users { get; set; } = new List<User>();
        public ICollection<CastingAssignment> Assignments { get; set; } = new List<CastingAssignment>();
    }
}

