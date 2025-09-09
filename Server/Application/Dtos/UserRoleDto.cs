using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Dtos
{
    public class UserRoleDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public List<PermissionDto> Permissions { get; set; } = new();
    }
}
