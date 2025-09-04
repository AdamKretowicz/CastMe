using CastMe.Domain.Entities;
using System.ComponentModel.DataAnnotations;

namespace CastMe.User.CrossCutting.DTOs
{
    public static class UserDto
    {
        public class Create
        {
            [Required]
            public string UserName { get; set; } = default!;

            [Required, MaxLength(100)]
            public string FirstName { get; set; } = default!;

            [Required, MaxLength(100)]
            public string LastName { get; set; } = default!;

            [Required]
            [Phone]
            public string Phone { get; set; } = default!;


            [Required]
            public DateTime DateOfBirth { get; set; }

            [Required, EmailAddress]
            public string Email { get; set; } = default!;

            [Required, MaxLength(50)]
            public string Country { get; set; } = default!;

            [Required, MaxLength(50)]
            public string City { get; set; } = default!;

            [Required]
            public Gender Gender { get; set; }

            [Required]
            public int Height { get; set; }

            [Required]
            public int Weight { get; set; }

            [Required, MaxLength(50)]
            public string HairColor { get; set; } = default!;

            [Required, MaxLength(50)]
            public string ClothingSize { get; set; } = default!;

            [MinLength(8), MaxLength(250)]
            public string? Description { get; set; }

            [Required, MinLength(6)]
            public string Password { get; set; } = default!;
        }

        public class Read
        {
            public Guid Id { get; set; }
            public string UserName { get; set; } = default!;
            public string FirstName { get; set; } = default!;
            public string LastName { get; set; } = default!;

            public string Phone { get; set; }
            public DateTime DateOfBirth { get; set; }

            public string Email { get; set; } = default!;
            public string Country { get; set; } = default!;
            public string City { get; set; } = default!;
            public Gender Gender { get; set; }

            public int Height { get; set; }
            public int Weight { get; set; }
            public string HairColor { get; set; } = default!;
            public string ClothingSize { get; set; } = default!;

            public string? Description { get; set; }
        }

        public class Update
        {
            [Required]
            public string UserName { get; set; } = default!;

            [Required, MaxLength(100)]
            public string FirstName { get; set; } = default!;

            [Required, MaxLength(100)]
            public string LastName { get; set; } = default!;

            [Required]
            [Phone]
            public string Phone { get; set; } = default!;


            [Required]
            public DateTime DateOfBirth { get; set; }

            [Required, EmailAddress]
            public string Email { get; set; } = default!;

            [Required, MaxLength(50)]
            public string Country { get; set; } = default!;

            [Required, MaxLength(50)]
            public string City { get; set; } = default!;

            [Required]
            public Gender Gender { get; set; }

            [Required]
            public int Height { get; set; }

            [Required]
            public int Weight { get; set; }

            [Required, MaxLength(50)]
            public string HairColor { get; set; } = default!;

            [Required, MaxLength(50)]
            public string ClothingSize { get; set; } = default!;

            [MinLength(8), MaxLength(250)]
            public string? Description { get; set; }
        }

        public class StatusUpdate
        {
            [Required]
            public UserStatus Status { get; set; }
        }

    }
}
