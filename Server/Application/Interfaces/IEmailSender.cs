using Application.Dtos;


namespace Application.Interfaces
{
    public interface IEmailSender
    {
        Task SendEmailAsync(EmailDto.Send dto);

        Task SendFormAsync(EmailDto.Form dto);
    }
}

