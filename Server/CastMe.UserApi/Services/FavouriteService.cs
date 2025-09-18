using CastMe.User.CrossCutting.DTOs;
using CastMe.UserApi.Mappers;
using Domain.Entities;
using Infrastructure.Context;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace WebApi.Services
{
    public class FavouriteService
    {
        private readonly UserDbContext _db;

        public FavouriteService(UserDbContext db)
        {
            _db = db;
        }

        private static Guid GetUserId(ClaimsPrincipal user)
        {
            var id = user.FindFirst(ClaimTypes.NameIdentifier)?.Value
                     ?? throw new UnauthorizedAccessException("Brak identyfikatora użytkownika.");
            return Guid.Parse(id);
        }


        public async Task AddAsync(ClaimsPrincipal user, Guid modelId)
        {
            var organizerId = GetUserId(user);

            var model = await _db.Users.Include(u => u.Role).FirstOrDefaultAsync(u => u.Id == modelId);
            if (model == null)
                throw new KeyNotFoundException("Model nie istnieje.");

            if (!string.Equals(model.Role?.Name, "Model", StringComparison.OrdinalIgnoreCase))
                throw new InvalidOperationException("Podany użytkownik nie jest modelem.");

            var exists = await _db.Favourites.AnyAsync(f => f.OrganizerId == organizerId && f.ModelId == modelId);
            if (exists) return;

            _db.Favourites.Add(new Favourite
            {
                Id = Guid.NewGuid(),
                OrganizerId = organizerId,
                ModelId = modelId
            });

            await _db.SaveChangesAsync();
        }
        public async Task RemoveAsync(ClaimsPrincipal user, Guid modelId)
        {
            var organizerId = GetUserId(user);
            var fav = await _db.Favourites
                .FirstOrDefaultAsync(f => f.OrganizerId == organizerId && f.ModelId == modelId);

            if (fav == null) return;

            _db.Favourites.Remove(fav);
            await _db.SaveChangesAsync();
        }
        public async Task<IEnumerable<UserDto.Read>> GetAllAsync(ClaimsPrincipal user)
        {
            var organizerId = GetUserId(user);

            var models = await _db.Favourites
                .Where(f => f.OrganizerId == organizerId)
                .Join(_db.Users.Include(u => u.Role),
                      f => f.ModelId,
                      u => u.Id,
                      (f, u) => u)
                .AsNoTracking()
                .ToListAsync();

            return models.Select(m => m.ToReadDto());
        }
    }
}
