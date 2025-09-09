using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Dtos
{
    public class PermissionDto
    {
        public Guid Id { get; set; }
        public string Action { get; set; } = string.Empty;
        public string Resource { get; set; } = string.Empty;
    }
}
