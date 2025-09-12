using Application.Dtos;
using CastMe.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Interfaces
{
    public interface IUserFilterRepository
    {
        Task<List<User>> GetFilteredAsync(ModelFilterDto filter, CancellationToken ct = default);
    }
}
