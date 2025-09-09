using Application.Dtos;
using Application.Interfaces;
using CastMe.Domain.Entities;
using CastMe.User.CrossCutting.DTOs;
using Infrastructure.Context;
using Microsoft.EntityFrameworkCore;

namespace CastMe.UserApi.Services
{
    public class UserService
    {
        private readonly UserDbContext _context;
        private readonly IEmailSender _emailSender;

        public UserService(UserDbContext context, IEmailSender emailSender)
        {
            _context = context;
            _emailSender = emailSender;
        }

        public async Task<IEnumerable<Domain.Entities.User>> GetAllUsers() =>
            await _context.Users.AsNoTracking().ToListAsync();

        public async Task<Domain.Entities.User?> GetById(Guid id) =>
            await _context.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Id == id);

        public async Task Add(Domain.Entities.User entity)
        {
            _context.Users.Add(entity);
            await _context.SaveChangesAsync();
        }

        public async Task Update(Domain.Entities.User entity)
        {
            _context.Users.Update(entity);
            await _context.SaveChangesAsync();
        }

        public async Task Delete(Guid id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user is null) return;
            _context.Users.Remove(user);
            await _context.SaveChangesAsync();
        }

        public async Task<Domain.Entities.User> UpdateUserStatusAsync(Guid userId, UserStatus newStatus)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null)
            {
                throw new Exception("User not found");
            }
            user.Status = newStatus;
            await _context.SaveChangesAsync();
            try
            {
                var emailMessage = newStatus switch
                {
                    UserStatus.Active => "Twoje konto zostało aktywowane.",
                    UserStatus.Rejected => "Twoje konto nie zostało zaakceptowane. Dziękujemy za zainteresowanie",
                    _ => "Status Twojego konta został zaktualizowany."
                };


                var email = new EmailForm
                {
                    To = user.Email,
                    Subject = "Aktualizacja Statusu",
                    Message = emailMessage,
                };

                await _emailSender.SendEmailAsync(email);
                return user; // Status updated successfully
            }
            catch(Exception e)
            {
                throw new Exception(e.Message);

            }
            


        }




    }
}
