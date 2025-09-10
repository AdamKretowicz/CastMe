using Domain.Entities;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Data;

namespace CastMe.Domain.Entities
{
    [Table("Users", Schema = "User")]
    public class User
    {
        [Key]
        public Guid Id { get; set; }

        [Required, MaxLength(50)]
        public string UserName { get; set; } = default!;

        [Required]
        public string PasswordHash { get; set; } = default!;

        [Required, MaxLength(100)]
        public string FirstName { get; set; } = default!;

        [Required, MaxLength(100)]
        public string LastName { get; set; } = default!;

        [Phone]
        public string Phone { get; set; } = default!;

        public DateTime DateOfBirth { get; set; }
        public int Height { get; set; }
        public int Weight { get; set; }
        public string Email { get; set; } = default!;
        public string Country { get; set; } = default!;
        public string City { get; set; } = default!;
        public string? Description { get; set; }

        public Gender Gender { get; set; }

        public string HairColor { get; set; } = default!;
        public string ClothingSize { get; set; } = default!;



        public ICollection<Photo> Photos { get; set; } = new List<Photo>();


        public Guid RoleId { get; set; }
        public UserRole Role { get; set; } = default!;


        public UserStatus Status { get; set; } = UserStatus.Pending;
            
    }
}
