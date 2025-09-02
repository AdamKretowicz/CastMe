using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace Domain.Entities
{
    [Table("CastingTags", Schema = "Casting")]
    public class CastingTag
    {
        [Key]
        public Guid Id { get; set; }

        [Required]
        public Guid CastingId { get; set; }

        [ForeignKey(nameof(CastingId))]
        [JsonIgnore]
        public Casting Casting { get; set; } = default!;

        [Required, StringLength(20)]
        public string Value { get; set; } = default!;
    }

}
