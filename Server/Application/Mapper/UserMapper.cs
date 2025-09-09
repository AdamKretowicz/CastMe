using CastMe.User.CrossCutting.DTOs;

namespace CastMe.UserApi.Mappers
{
    public static class UserMapper
    {
        // ENTITY -> READ DTO
        public static UserDto.Read ToReadDto(this Domain.Entities.User user) => new UserDto.Read
        {
            Id = user.Id,
            UserName = user.UserName,
            FirstName = user.FirstName,
            LastName = user.LastName,
            Phone = user.Phone,
            DateOfBirth = user.DateOfBirth,
            Height = user.Height,
            Weight = user.Weight,
            Email = user.Email,
            Country = user.Country,
            City = user.City,
            Description = user.Description,
            Gender = user.Gender,
            HairColor = user.HairColor,
            ClothingSize = user.ClothingSize,
            Roles = user.Roles.Select(r => r.Name).ToList()
        };

        // CREATE DTO -> ENTITY 
        public static Domain.Entities.User ToEntity(this UserDto.Create dto, string passwordHash)
        {
            return new Domain.Entities.User
            {
                Id = Guid.NewGuid(),
                UserName = dto.UserName,
                FirstName = dto.FirstName,
                LastName = dto.LastName,
                Phone = dto.Phone,
                DateOfBirth = dto.DateOfBirth,
                Height = dto.Height,
                Weight = dto.Weight,
                Email = dto.Email,
                Country = dto.Country,
                City = dto.City,
                Description = dto.Description ?? string.Empty,
                Gender = dto.Gender,
                HairColor = dto.HairColor,
                ClothingSize = dto.ClothingSize,
                PasswordHash = passwordHash
            };
        }

        // UPDATE DTO -> aktualizacja ENTITY
        public static void UpdateEntity(this Domain.Entities.User user, UserDto.Update dto)
        {
            user.FirstName = dto.FirstName;
            user.LastName = dto.LastName;
            user.Phone = dto.Phone;
            user.DateOfBirth = dto.DateOfBirth;
            user.Height = dto.Height;
            user.Weight = dto.Weight;
            user.Email = dto.Email;
            user.Country = dto.Country;
            user.City = dto.City;
            user.Description = dto.Description ?? string.Empty;
            user.Gender = dto.Gender;
            user.HairColor = dto.HairColor;
            user.ClothingSize = dto.ClothingSize;
        }
    }
}
