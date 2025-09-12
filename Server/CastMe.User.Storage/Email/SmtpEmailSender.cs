using Application.Dtos;
using Application.Interfaces;
using Infrastructure.Settings;
using MailKit.Net.Smtp;
using Microsoft.Extensions.Options;
using MimeKit;


namespace WebApi.Infrastructure.Email
{
    public class SmtpEmailSender : Application.Interfaces.IEmailSender
    {
        private readonly SmtpSettings _settings;

        public SmtpEmailSender(IOptions<SmtpSettings> options)
        {
            _settings = options.Value;
        }


        public async Task SendEmailAsync(EmailDto.Send emailForm)
        {
            try
            {
                var message = new MimeMessage();

                message.From.Add(new MailboxAddress(emailForm.DisplayName, _settings.UserName));

                message.To.Add(MailboxAddress.Parse(emailForm.To));

                message.Subject = emailForm.Subject;
                message.Body = new TextPart("plain")
                {
                    Text = emailForm.Message
                };

                using var smtpClient = new SmtpClient();

                await smtpClient.ConnectAsync(_settings.Host, _settings.Port, MailKit.Security.SecureSocketOptions.StartTls);

                await smtpClient.AuthenticateAsync(_settings.UserName, _settings.Password);

                await smtpClient.SendAsync(message);

                await smtpClient.DisconnectAsync(true);
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }





        }
        public async Task SendFormAsync(EmailDto.Form emailForm)
        {
            var message = new MimeMessage();

            message.From.Add(new MailboxAddress("Portal", _settings.UserName));

            message.To.Add(new MailboxAddress("Właściciel", _settings.UserName));

            message.Subject = $"Formularz kontaktowy od {emailForm.Name}";

            message.ReplyTo.Add(new MailboxAddress(emailForm.Name, emailForm.Email));

            message.Body = new TextPart("plain")
            {
                Text = $"Imię/Nazwa: {emailForm.Name}\nEmail: {emailForm.Email}\n\nWiadomość:\n{emailForm.Message}"
            };

            using var client = new SmtpClient();
            await client.ConnectAsync(_settings.Host, _settings.Port, MailKit.Security.SecureSocketOptions.StartTls);
            await client.AuthenticateAsync(_settings.UserName, _settings.Password);
            await client.SendAsync(message);
            await client.DisconnectAsync(true);

        }


    }

}

