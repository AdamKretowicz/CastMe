using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Interfaces
{
    public interface IRoleRepository
    {
        Task<UserRole?> GetByNameAsync(string roleName);
        Task<IEnumerable<UserRole>> GetAllAsync();
    }
}
