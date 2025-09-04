namespace Infrastructure.Settings
{
    public class SmtpSettings
    {
        public string Host { get; set; } = default!;
        public int Port { get; set; } = 587;
        public string UserName { get; set; } = default!;
        public string Password { get; set; } = default!;
    }
}
