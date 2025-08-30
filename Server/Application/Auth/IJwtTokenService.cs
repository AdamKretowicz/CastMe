using System.Security.Claims;


namespace Application.Auth
{
    public interface IJwtTokenService
    {
        (string accessToken, DateTime expiresAtUtc, string refreshToken) CreateTokens(IEnumerable<Claim> claims);
    }
}
