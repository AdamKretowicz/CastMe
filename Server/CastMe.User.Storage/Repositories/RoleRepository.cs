using Application.Interfaces;
using Domain.Entities;
using Infrastructure.Context;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure.Repositories
{
    public class RoleRepository : IRoleRepository
    {
        private readonly UserDbContext _context;

        public RoleRepository(UserDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<UserRole>> GetAllAsync() =>
            await _context.UserRoles
                .Include(r => r.Users)
                .ToListAsync();

        public async Task<UserRole?> GetByNameAsync(string roleName)=>
                        await _context.UserRoles
                          .Include(r => r.Users)
                          .FirstOrDefaultAsync(r => r.Name == roleName);
    }
}
