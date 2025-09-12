using CastMe.Domain.Entities;
using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;

namespace CastMe.User.CrossCutting.DTOs
{
    public static class UserDto
    {
        public class Create
        {
            public string UserName { get; set; } = default!;

            public string FirstName { get; set; } = default!;

            public string LastName { get; set; } = default!;

            public string Phone { get; set; } = default!;

            public DateTime DateOfBirth { get; set; }

            public string Email { get; set; } = default!;

            public string Country { get; set; } = default!;

            public string City { get; set; } = default!;

            public Gender Gender { get; set; }

            public int? Height { get; set; }

            public int? Weight { get; set; }

            public string? HairColor { get; set; }

            public string? ClothingSize { get; set; }

            public string? Description { get; set; }

            public string Password { get; set; } = default!;

            public string RoleName { get; set; } = default!;

            public IFormFile[]? Photos { get; set; } = default!;
            public bool AcceptTerms { get; set; }
        }

        public class Read
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

            public int? Height { get; set; }

            public int? Weight { get; set; }

            [MaxLength(50)]
            public string? HairColor { get; set; } = default!;

            [MaxLength(50)]
            public string? ClothingSize { get; set; } = default!;

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
