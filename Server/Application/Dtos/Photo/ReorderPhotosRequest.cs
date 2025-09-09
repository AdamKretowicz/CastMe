using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Application.Dtos.Photo
{
    public class ReorderPhotosRequest
    {
        [Required]
        public List<Guid> OrderedPhotoIds { get; set; } = new();
    }
}
