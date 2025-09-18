using Application.Dtos;
using Application.Interfaces;
using CastMe.Domain.Entities;
using CastMe.User.CrossCutting.DTOs;
using CastMe.UserApi.Mappers;
using Domain.Entities;
using Infrastructure.Context;
using Microsoft.EntityFrameworkCore;
using WebApi.Services.Photo;

namespace CastMe.UserApi.Services
{
    public class UserService
    {
        private readonly UserDbContext _context;
        private readonly IUserRepository _userRepo;
        private readonly IRoleRepository _roleRepo;

        public UserService(UserDbContext context, IUserRepository userRepo, IRoleRepository roleRepo)
        {
            _context = context;
            _userRepo = userRepo;
            _roleRepo = roleRepo;
        }
        public async Task<IEnumerable<Domain.Entities.User>> GetAllUsers() =>
            await _context.Users
            .Include(u => u.Role)
            .AsNoTracking().ToListAsync();
        public async Task<IEnumerable<Domain.Entities.User>> GetAllUsers(UserStatus status) =>
            await _context.Users.Where(s => s.Status == status).Include(u => u.Role).AsNoTracking().ToListAsync();

        public async Task<Domain.Entities.User?> GetById(Guid id) =>
            await _context.Users.AsNoTracking().Include(u => u.Role).FirstOrDefaultAsync(u => u.Id == id);
        public async Task<Domain.Entities.User?> GetActiveById(Guid id) =>
            await _context.Users.AsNoTracking().Include(u => u.Role).FirstOrDefaultAsync(u => u.Id == id && u.Status == UserStatus.Active);

        public async Task Add(Domain.Entities.User entity)
        {
            _context.Users.Add(entity);
            await _context.SaveChangesAsync();
        }

        public async Task<Domain.Entities.User> Update(Domain.Entities.User entity, UserDto.Update updateUser )
        {
            entity.UpdateEntity(updateUser);

            //_context.Users.Update(entity);
            await _context.SaveChangesAsync();
            return entity;
        }

        public async Task Delete(Guid id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user is null) return;
            _context.Users.Remove(user);
            await _context.SaveChangesAsync();
        }

        public async Task<Domain.Entities.User> UpdateUserStatusAsync(Guid userId, UserStatus newStatus)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null)
            {
                throw new Exception("User not found");
            }
            user.Status = newStatus;
            await _context.SaveChangesAsync();
            return user;
        }

        public async Task<IEnumerable<UserRole>> GetAllRoles()
        {
           var roles = await _roleRepo.GetAllAsync();
            roles = roles.Where(r => r.Name != "Admin");
            return roles;
        }

        public async Task<UserRole?> GetRoleById(Guid id) =>
            await _roleRepo.GetByIdAsync(id);

        public async Task<UserRole?> GetRoleByName(string name) =>
            await _roleRepo.GetByNameAsync(name);

        public async Task<UserRole> GetRoleByUserId(Guid userId)
        {
            var user = await _userRepo.GetByIdAsync(userId);
            if (user == null)
                throw new Exception("User or Role not found");

            var role = await _roleRepo.GetByIdAsync(user.RoleId);
            if (role == null)
                throw new Exception("Role not found");
            return role;
        }
    }
}
