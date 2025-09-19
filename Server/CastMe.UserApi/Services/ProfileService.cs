using Application.Dtos;
using CastMe.Api.Features.Photos;
using CastMe.UserApi.Services;
using Infrastructure.Context;
using Microsoft.EntityFrameworkCore;
using WebApi.Services.Photo;
using Application.Mapper;

namespace WebApi.Services
{
    public class ProfileService
    {
        private readonly UserDbContext _context;
        private readonly IPhotoService _photoService ;

        public ProfileService(UserDbContext context, IPhotoService photoService)
        {
            _context = context;
            _photoService = photoService;
        }

        public async Task<ProfileDto.Read?> GetProfileByIdAsync(Guid userId)
        {
            var user = await _context.Users
                .AsNoTracking()
                .Include(u => u.Experiences)
                .Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.Id == userId);
            if (user == null) return null;

            IReadOnlyList<Application.Dtos.Photo.PhotoDto> photos = await _photoService.GetUserPhotosAsync(userId);

            return user.ToReadDto(photos);


        }






    }
}
