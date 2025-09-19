using Application.Dtos;
using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Interfaces
{
    public interface IExperienceService
    {
        public Task<Experience?> GetExperienceByUserId(Guid userId);
        public Task<Experience?> GetExperienceById(Guid experienceId);
        public Task<Experience> AddExperience(Guid userId, Experience experience);
        public Task UpdateExperience(Experience experience, ExperienceDto.Update updatedExperience);
        public Task<bool> DeleteExperience(Guid userId);
        public Task<List<Experience?>> GetAllExperiencesByUserId(Guid userId);








    }
}
