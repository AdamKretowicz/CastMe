using Infrastructure.Context;
using Microsoft.EntityFrameworkCore;

namespace CastMe.UserApi.Services
{
    public class UserService
    {
        private readonly UserDbContext _context;
        public UserService(UserDbContext context) => _context = context;

        public async Task<IEnumerable<Domain.Entities.User>> GetAllUsers() =>
            await _context.Users.AsNoTracking().ToListAsync();

        public async Task<Domain.Entities.User?> GetById(Guid id) =>
            await _context.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Id == id);

        public async Task Add(Domain.Entities.User entity)
        {
            _context.Users.Add(entity);
            await _context.SaveChangesAsync();
        }

        public async Task Update(Domain.Entities.User entity)
        {
            _context.Users.Update(entity);
            await _context.SaveChangesAsync();
        }

        public async Task Delete(Guid id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user is null) return;
            _context.Users.Remove(user);
            await _context.SaveChangesAsync();
        }
    }
}
