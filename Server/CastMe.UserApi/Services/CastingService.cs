﻿﻿using Application.Dtos;
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
            .Include(c => c.Roles)
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

        public async Task<CastingDto.Read> Update(CastingDto.Update dto, Guid castingId)
        {
            var casting = await _context.Castings
                .Include(c => c.Roles)
                .Include(c => c.Tags)
                .FirstOrDefaultAsync(c => c.Id == castingId);

            if (casting == null)
                throw new Exception("Casting not found");
            
            casting.UpdateEntity(dto);


            await _context.SaveChangesAsync();
            return casting.ToReadDto();
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
                .AsNoTracking()
                .Include(a => a.User)
                .Include(a => a.Role)
                .Where(a => a.CastingId == castingId && a.UserAcceptanceStatus == CastingUserStatus.Active)
                .ToListAsync();

        public async Task AddParticipant(Guid castingId, Guid userId)
        {
            var casting = await _context.Castings
                .Include(c => c.Roles)
                .Include(c => c.Assignments)
                .FirstOrDefaultAsync(c => c.Id == castingId)
                ?? throw new KeyNotFoundException("Casting not found");

            var user = await _context.Users
                .Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.Id == userId)
                ?? throw new KeyNotFoundException("User not found");

            // Czy już przypisany do tego castingu?
            if (casting.Assignments.Any(a => a.UserId == userId))
                throw new InvalidOperationException("User is already assigned to this casting.");

            // Czy casting rekrutuje dla roli użytkownika?
            var userRoleName = user.Role?.Name?.ToString();
            var castingRole = casting.Roles.FirstOrDefault(r => r.Role.ToString() == userRoleName);
            if (castingRole is null || castingRole.Capacity <= 0)
                throw new InvalidOperationException("Casting nie przyjmuje zgłoszeń dla Twojej roli.");

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
                .AsNoTracking()
                .Where(c => c.Assignments.Any(a => a.UserId == userId))
                .ToListAsync();

        /// <summary>
        /// Zwraca listę assignmentów (udziałów) użytkownika wraz z powiązanym Casting i Role.
        /// Wykorzystywane do endpointu /casting/casting/participations/{userId}.
        /// </summary>
        public async Task<List<CastingAssignment>> GetParticipationsByUserId(Guid userId)
        {
            return await _context.Assignments
                .AsNoTracking()
                .Include(a => a.Casting)
                .Include(a => a.Role)
                .Where(a => a.UserId == userId)
                .ToListAsync();
        }

        public async Task<Casting> ChangeCastingStatus(Guid castingId, CastingStatus status)
        {
            await _context.Castings
                .Where(c => c.Id == castingId)
                .ExecuteUpdateAsync(c => c.SetProperty(x => x.Status, status));

            return await GetById(castingId) ?? throw new KeyNotFoundException("Casting not found");
        }

        public async Task<IEnumerable<CastingAssignment>> GetCastingPendingUsersByCastingId(Guid castingId)
        {
            var assignments = await _context.Assignments
                .AsNoTracking()
                .Include(u => u.User)
                .ThenInclude(u => u.Photos)
                .Include(r => r.Role)
                .Where(a => a.CastingId == castingId && a.UserAcceptanceStatus == CastingUserStatus.Pending)
                .ToListAsync();

            return assignments;
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
                .Include(a => a.Role)
                .Include(a => a.Casting)
                    .ThenInclude(c => c.Roles)
                .FirstOrDefaultAsync(a => a.Id == assignmentId)
                ?? throw new KeyNotFoundException("Assignment not found");

            // Jeśli przełączamy na Active – egzekwuj limit per rola w tym castingu
            if (status == CastingUserStatus.Active)
            {
                var roleName = assignment.Role?.Name?.ToString();
                var roleInCasting = assignment.Casting.Roles.FirstOrDefault(r => r.Role.ToString() == roleName);

                if (roleInCasting is null)
                    throw new InvalidOperationException($"Casting nie rekrutuje dla roli '{roleName}'.");

                // policz ilu jest już aktywnych w tej roli
                var activeInRole = await _context.Assignments.CountAsync(a =>
                    a.CastingId == assignment.CastingId &&
                    a.UserAcceptanceStatus == CastingUserStatus.Active &&
                    a.RoleId == assignment.RoleId
                );

                if (activeInRole >= roleInCasting.Capacity)
                    throw new InvalidOperationException($"Limit roli '{roleName}' został osiągnięty ({activeInRole}/{roleInCasting.Capacity}).");
            }

            // Po walidacji ustaw status i zapisz
            assignment.UserAcceptanceStatus = status;
            await _context.SaveChangesAsync();

            // Zwróć z załadowanymi nawigacjami (mamy je już w pamięci)
            return assignment;
        }

        public async Task<IEnumerable<CastingAssignment>> GetCastingUsersByStatus(Guid castingId, CastingUserStatus status)
        {
            var assigments = await _context.Assignments
                .AsNoTracking()
                .Include(u => u.User)
                .ThenInclude(u => u.Photos)
                .Include(r => r.Role)
                .Where(a => a.CastingId == castingId && a.UserAcceptanceStatus == status)
                .ToListAsync()
                ?? throw new KeyNotFoundException("Casting not found");
            return assigments;


        }
    }
}
