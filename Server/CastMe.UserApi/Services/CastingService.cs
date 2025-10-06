using Application.Dtos;
using CastMe.Domain.Entities;
using Domain.Entities;
using Infrastructure.Context;
using Microsoft.EntityFrameworkCore;
using Application.Mapper;

namespace WebApi.Services
{
    public class CastingService
    {
        private readonly UserDbContext _context;

        public CastingService(UserDbContext context) => _context = context;


        public async Task<IEnumerable<Domain.Entities.Casting>> GetAllCastings() =>
            await _context.Castings
            .Include(c=> c.Roles)
            .Include(c => c.Tags)
            .Include(c => c.Assignments)
            .ThenInclude(a => a.Role)
            .AsNoTracking()
            .ToListAsync();

        public async Task<Domain.Entities.Casting?> GetById(Guid id) =>
            await _context.Castings
            .Include(c => c.Roles)
            .Include(c => c.Tags)
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.Id == id);

        public async Task Add(Domain.Entities.Casting entity)
        {
            _context.Castings.Add(entity);
            await _context.SaveChangesAsync();
        }

        public async Task Update(CastingDto.Update dto, Guid castingId)
        {
            var casting = await _context.Castings
                .Where(c => c.Id == castingId)
                .FirstOrDefaultAsync();

            if (casting == null)
            {
                throw new Exception("Casting not found");
            }

                casting.UpdateEntity(dto);


            //_context.Castings.Update(entity);
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
            await _context.Castings
            .Include(c => c.Roles)
            .Include(c => c.Tags)
            .AsNoTracking()
            .Where(c => c.OrganizerId == userId)
            .ToListAsync();


        public async Task<List<CastingAssignment>> GetParticipantsByCastingId(Guid castingId) =>

            await _context.Assignments
                .Include(a => a.User)
                .Include(a => a.Role)
                .Where(a => a.CastingId == castingId && a.UserAcceptanceStatus == CastingUserStatus.Active)
                .ToListAsync()
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
                RoleId = user.RoleId,
                UserAcceptanceStatus = CastingUserStatus.Pending
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

        public async Task<IEnumerable<Domain.Entities.Casting>> GetAllCastingsByUserId(Guid userId) =>
            await _context.Castings
            .Include(c => c.Roles)
            .Include(c => c.Tags)
            .Where(c => c.Assignments.Any(a => a.UserId == userId))
            .ToListAsync();

        public async Task<Casting> ChangeCastingStatus(Guid castingId, CastingStatus status)
        {
            var casting = await _context.Castings
                .Where(c => c.Id == castingId)
                .ExecuteUpdateAsync(c => c.SetProperty(c => c.Status, c => status));
            return await GetById(castingId) ?? throw new KeyNotFoundException("Casting not found");
        }

        public async Task<IEnumerable<CastingAssignment>> GetCastingPendingUsersByCastingId(Guid castingId)
        {

            var assigments = await _context.Assignments
                .Include(u => u.User)
                .ThenInclude(u => u.Photos)
                .Include(r => r.Role)
                .Where(a => a.CastingId == castingId && a.UserAcceptanceStatus == CastingUserStatus.Pending)
                .ToListAsync()
                ?? throw new KeyNotFoundException("Casting not found");

            return assigments;


        }

        public async Task<IEnumerable<CastingAssignment>> GetCastingAllUsersByCastingId(Guid castingId)
        {

            var assigments = await _context.Assignments
                .Include(u => u.User)
                .ThenInclude(u => u.Photos)
                .Include(r => r.Role)
                .Where(a => a.CastingId == castingId)
                .ToListAsync()
                ?? throw new KeyNotFoundException("Casting not found");

            return assigments;


        }


        public async Task<CastingAssignment> ChangeUserCastingStatus(Guid assignmentId, CastingUserStatus status)
            {
            var assignment = await _context.Assignments
                .Where(a => a.Id == assignmentId)
                .ExecuteUpdateAsync(a => a.SetProperty(a => a.UserAcceptanceStatus, a => status));
            return await _context.Assignments
                .Include(a => a.User)
                .Include(a => a.Casting)
                .FirstOrDefaultAsync(a => a.Id == assignmentId)
                ?? throw new KeyNotFoundException("Assignment not found");
        }



    }
}
