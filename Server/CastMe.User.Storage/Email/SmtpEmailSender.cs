using Application.Dtos;
using Application.Interfaces;
using Infrastructure.Settings;
using Microsoft.Extensions.Options;
using System.Net;
using System.Net.Mail;

namespace WebApi.Infrastructure.Email
{
    public class SmtpEmailSender : IEmailSender
    {
        private readonly SmtpSettings _settings;

        public SmtpEmailSender(IOptions<SmtpSettings> options)
        {
            _settings = options.Value;
        }


        public async Task SendEmailAsync(EmailForm emailForm)
        {
            //System.Net.ServicePointManager.SecurityProtocol = SecurityProtocolType.Tls12;

            using var smtpClient = new SmtpClient(_settings.Host, _settings.Port)
            {
                EnableSsl = true,
                UseDefaultCredentials = false,
                Credentials = new NetworkCredential(_settings.UserName, _settings.Password),
                //DeliveryMethod = SmtpDeliveryMethod.Network
            };

            try
            {
                var mail = new MailMessage
                {
                    From = new MailAddress(_settings.UserName, emailForm.DisplayName),
                    Subject = emailForm.Subject,
                    Body = emailForm.Message
                };
                mail.To.Add(emailForm.To);

                await smtpClient.SendMailAsync(mail);

            }
            catch (Exception ex)
            {
                var msg = ex.Message;
            }




        }





    }
}
