using System;

namespace Application.Dtos.Photo
{
    public class PhotoDto
    {
        public Guid Id { get; set; }
        public string Url { get; set; } = default!;
        public string OriginalFileName { get; set; } = default!;
        public string ContentType { get; set; } = default!;
        public long SizeBytes { get; set; }
        public bool IsMain { get; set; }
        public int Order { get; set; }
        public DateTime CreatedAtUtc { get; set; }
        
    }
}
