using Application.Dtos;
using Application.Interfaces;
using Application.Mapper;
using Domain.Entities;
using Infrastructure.Context;
using Microsoft.EntityFrameworkCore;


namespace WebApi.Services
{
    public class ExperienceService : IExperienceService
    {

        UserDbContext _context;

        public ExperienceService(UserDbContext context)
        {
            _context = context;
        }

        public async Task<Experience> AddExperience(Guid userId, Experience experience)
        {
            _context.Add(experience);
            await _context.SaveChangesAsync();
            return experience;
        }

        public async Task<bool> DeleteExperience(Guid experienceId)
        {
            var experience = await _context.Experiences.FindAsync(experienceId);
            if (experience is null) return false;

            _context.Experiences.Remove(experience);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<Experience?> GetExperienceById(Guid experienceId)
        {
            return await _context.Experiences.Include(e => e.User).FirstOrDefaultAsync(e => e.Id == experienceId);
        }

        public async Task<Experience?> GetExperienceByUserId(Guid userId)
        {
            var experience = await _context.Experiences.Include(e => e.User).FirstOrDefaultAsync(e => e.UserId == userId);

            return experience;
        }

        public async Task<List<Experience?>> GetAllExperiencesByUserId(Guid userId)
        {
            var experience = await _context.Experiences.Include(e => e.User).Where(e => e.UserId == userId).DefaultIfEmpty().ToListAsync();

            return experience;
        }

        public async Task UpdateExperience(Experience experience, ExperienceDto.Update updateExperience)
        {
            experience.UpdateEntity(updateExperience);
            await _context.SaveChangesAsync();
        }
    }
}

