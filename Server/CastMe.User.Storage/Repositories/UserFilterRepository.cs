using Application.Dtos;
using Application.Interfaces;
using CastMe.Domain.Entities;
using Infrastructure.Context;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Quic;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure.Repositories
{
    public class UserFilterRepository : IUserFilterRepository
    {
        private readonly UserDbContext _context;

        public UserFilterRepository(UserDbContext context) => _context = context;

        public async Task<List<User>> GetFilteredAsync(ModelFilterDto filter,int pagenumber = 1, int pageSize = 10, CancellationToken ct = default)
        {
            IQueryable<User> query = _context.Users.AsNoTracking();

            // --- Filtrowanie liczbowe ---
            if (filter.MinAge.HasValue)
                query = query.Where(p => DateTime.Now.Year - p.DateOfBirth.Year >= filter.MinAge.Value);

            if (filter.MaxAge.HasValue)
                query = query.Where(p => DateTime.Now.Year - p.DateOfBirth.Year <= filter.MaxAge.Value);

            if (filter.MinHeight.HasValue)
                query = query.Where(p => p.Height >= filter.MinHeight.Value);

            if (filter.MaxHeight.HasValue)
                query = query.Where(p => p.Height <= filter.MaxHeight.Value);

            if (filter.MinWeight.HasValue)
                query = query.Where(p => p.Weight >= filter.MinWeight.Value);

            if (filter.MaxWeight.HasValue)
                query = query.Where(p => p.Weight <= filter.MaxWeight.Value);

            if (filter.HairColor is { } hairColors && hairColors.Any())
            {
                query = query.Where(p => hairColors.Contains(p.HairColor));
            }

            if (filter.ClothingSize is { } clothingSizes && clothingSizes.Any())
            {
                query = query.Where(p => clothingSizes.Contains(p.ClothingSize));
            }

            if (filter.City is { } cities && cities.Any())
            {
                query = query.Where(p => cities.Contains(p.City));
            }

            query = query.Skip((pagenumber - 1) * pageSize).Take(pageSize);

            return await query.ToListAsync(ct);
        }
    }
}
