using Infrastructure.Context;
using Microsoft.EntityFrameworkCore;

namespace WebApi.Services
{
    public class CastingService
    {
        private readonly UserDbContext _context;

        public CastingService(UserDbContext context) => _context = context;


        public async Task<IEnumerable<Domain.Entities.Casting>> GetAllCastings() =>
            await _context.Castings.AsNoTracking().ToListAsync();

        public async Task<Domain.Entities.Casting?> GetById(Guid id) =>
            await _context.Castings.AsNoTracking().FirstOrDefaultAsync(c => c.Id == id);

        public async Task Add(Domain.Entities.Casting entity)
        {
            _context.Castings.Add(entity);
            await _context.SaveChangesAsync();
        }

        public async Task Update(Domain.Entities.Casting entity)
        {
            _context.Castings.Update(entity);
            await _context.SaveChangesAsync();
        }

        public async Task Delete(Guid id)
        {
            var casting = await _context.Castings.FindAsync(id);
            if (casting is null) return;
            _context.Castings.Remove(casting);
            await _context.SaveChangesAsync();
        }

        public async Task<IEnumerable<Domain.Entities.Casting>> GetCastingsByOrganiserId(Guid userId) =>
            await _context.Castings.AsNoTracking().Where(c => c.OrganizerId == userId).ToListAsync();






    }
}
