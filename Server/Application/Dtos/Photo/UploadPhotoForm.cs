using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace Application.Dtos.Photo
{
    public class UploadPhotoForm
    {
        [Required]
        public IFormFile File { get; set; } = default!;
    }
}
