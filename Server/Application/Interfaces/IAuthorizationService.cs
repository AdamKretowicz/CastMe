using Application.Dtos;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Interfaces
{
    public interface IAuthorizationService
    {
        Task<bool> CanAccessAsync(Guid userId, string action, string resource);
        Task<IEnumerable<PermissionDto>> GetUserPermissionsAsync(Guid userId);
        Task<bool> HasRoleAsync(Guid userId, string roleName);
        Task<bool> IsInRoleAsync(Guid userId, params string[] roles);
    }
}
