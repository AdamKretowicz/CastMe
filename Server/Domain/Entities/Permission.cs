using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Domain.Entities;
[Table("Permissions", Schema = "User")]

public class Permission
{
    [Key]
    public Guid Id { get; set; }
    
    [Required]
    public string Action { get; set; } = string.Empty;
    
    [Required]
    public string Resource { get; set; } = string.Empty;
    
    // Navigation property
    public ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();
}