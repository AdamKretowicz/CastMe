using Application.Interfaces;
using CastMe.Domain.Entities;
using Infrastructure.Context;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure.Repositories
{
    public class UserRepository : IUserRepository
    {
        private readonly UserDbContext _context;

        public UserRepository(UserDbContext context) => _context = context;

        public async Task<User?> GetByIdAsync(Guid id) =>
            await _context.Users.Include(u => u.UserName)
                                .FirstOrDefaultAsync(u => u.Id == id);

        public async Task AddAsync(User user) => await _context.Users.AddAsync(user);

        public async Task SaveChangesAsync() => await _context.SaveChangesAsync();

        public async Task<IEnumerable<User>> GetAllAsync() =>
            await _context.Users
                          .Include(u => u.UserName).ToListAsync();

    }
}