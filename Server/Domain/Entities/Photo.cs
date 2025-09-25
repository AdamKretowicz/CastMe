using CastMe.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Entities
{
    public class Photo
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }

        public string FileName { get; set; } = default!;        
        public string OriginalFileName { get; set; } = default!;  
        public string ContentType { get; set; } = default!;
        public long SizeBytes { get; set; }
        public string Url { get; set; } = default!;              
        public bool IsMain { get; set; }
        public int Order { get; set; }                           
        public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;

        public User? User { get; set; }

        public bool IsActive { get; set; } = false;
    }
}
