using Application.Dtos;


namespace Application.Interfaces
{
    public interface IEmailSender
    {
        Task SendEmailAsync(EmailForm dto);
    }
}

