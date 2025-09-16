using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Dtos
{
    public class EmailDto
    {
        public class Send
        {
            [Required]
            [EmailAddress]
            public string To { get; set; } = default!;
            [Required]
            [MinLength(2), MaxLength(20)]
            public string Subject { get; set; } = default!;
            [Required]
            [MinLength(10), MaxLength(500)]
            public string Message { get; set; } = default!;
            [Required]
            [MinLength(2), MaxLength(20)]
            public string DisplayName { get; set; } = "CastMe";

        }
        public class Form
        {
            [Required]
            [EmailAddress]
            public string Email { get; set; } = default!;
            [Required]
            [MinLength(2), MaxLength(20)]
            public string Subject { get; set; } = default!;
            [Required]
            [MinLength(10), MaxLength(500)]
            public string Message { get; set; } = default!;
            [Required]
            [MinLength(2), MaxLength(20)]
            public string Name { get; set; } = default!;

        }


    }
}
