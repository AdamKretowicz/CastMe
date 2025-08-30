namespace Application.Dtos
{
    public sealed class LoginDto
    {
        public string UserName { get; init; } = default!;
        public string Password { get; init; } = default!;
    }
}
