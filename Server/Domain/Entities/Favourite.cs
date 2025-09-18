using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;


namespace Domain.Entities
{
    [Table("Favourites", Schema = "User")]
    public class Favourite
    {
        [Key]
        public Guid Id { get; set; }

        [Required]
        public Guid OrganizerId { get; set; }
        [Required]
        public Guid ModelId { get; set; }

        [Required]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [ForeignKey(nameof(OrganizerId))]
        public CastMe.Domain.Entities.User Organizer { get; set; } = default!;

        [ForeignKey(nameof(ModelId))]
        public CastMe.Domain.Entities.User Model { get; set; } = default!;
    }
}
