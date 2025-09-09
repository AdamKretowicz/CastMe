using Application.Dtos;
using Application.Interfaces;
using Infrastructure.Context;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure.Auth
{
    public class AuthorizationService : IAuthorizationService
    {
        private readonly UserDbContext _context;

        public AuthorizationService(UserDbContext context)
        {
            _context = context;
        }

        public async Task<bool> CanAccessAsync(Guid userId, string action, string resource)
        {
            var userHasPermission = await _context.Users
                .Where(u => u.Id == userId)
                .SelectMany(u => u.Role.Permissions)
                .AnyAsync(p => p.Action == action && p.Resource == resource);

            return userHasPermission;
        }

        public async Task<IEnumerable<PermissionDto>> GetUserPermissionsAsync(Guid userId)
        {
            var permissions = await _context.Users
                .Where(u => u.Id == userId)
                .SelectMany(u => u.Role.Permissions)
                .Select(p => new PermissionDto
                {
                    Id = p.Id,
                    Action = p.Action,
                    Resource = p.Resource
                })
                .ToListAsync();

            return permissions;
        }

        public async Task<bool> HasRoleAsync(Guid userId, string roleName)
        {
            return await _context.Users
                .Where(u => u.Id == userId)
                .AnyAsync(u => u.Role.Name == roleName);
        }

        public async Task<bool> IsInRoleAsync(Guid userId, params string[] roles)
        {
            return await _context.Users
                .Where(u => u.Id == userId)
                .AnyAsync(u => roles.Contains(u.Role.Name));
        }
    }
}
