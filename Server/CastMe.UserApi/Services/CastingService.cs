using CastMe.Domain.Entities;
using Domain.Entities;
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


        public async Task<Casting> GetParticipantsByCastingId(Guid castingId) =>
            await _context.Castings
                .Include(c => c.Assignments)
                .ThenInclude(a => a.User)
                .FirstOrDefaultAsync(c => c.Id == castingId) 
                ?? throw new KeyNotFoundException("Casting not found");

        public async Task AddParticipant(Guid castingId, Guid userId)
        {
            var casting = await _context.Castings
                .Include(c => c.Assignments)
                .FirstOrDefaultAsync(c => c.Id == castingId)
                ?? throw new KeyNotFoundException("Casting not found");

            var user = await _context.Users
                .Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.Id == userId)
                ?? throw new KeyNotFoundException("User not found");


            // Sprawdzenie czy użytkownik już jest przypisany
            if (casting.Assignments.Any(a => a.UserId == userId))
                throw new InvalidOperationException("User is already assigned to this casting.");

            var assignment = new CastingAssignment
            {
                Id = Guid.NewGuid(),
                CastingId = castingId,
                UserId = userId,
                RoleId = user.RoleId
            };

            _context.Assignments.Add(assignment);
            await _context.SaveChangesAsync();
        }

        public async Task RemoveParticipant(Guid castingId, Guid userId)
        {
            var assignment = await _context.Assignments
                .FirstOrDefaultAsync(a => a.CastingId == castingId && a.UserId == userId);

            if (assignment == null)
                throw new KeyNotFoundException("Assignment not found.");

            _context.Assignments.Remove(assignment);
            await _context.SaveChangesAsync();
        }



    }
}
