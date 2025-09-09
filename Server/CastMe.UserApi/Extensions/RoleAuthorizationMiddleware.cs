using Application.Interfaces;

namespace WebApi.Extensions
{
    public class RoleAuthorizationMiddleware
    {
        private readonly RequestDelegate _next;

        public RoleAuthorizationMiddleware(RequestDelegate next) => _next = next;

        public async Task InvokeAsync(HttpContext context, IUserRepository userRepo)
        {
            var userIdClaim = context.User?.Claims.FirstOrDefault(c => c.Type == "sub")?.Value;
            if (userIdClaim != null)
            {
                var user = await userRepo.GetByIdAsync(Guid.Parse(userIdClaim));
                context.Items["UserRoles"] = user?.Roles.Select(r => r.Name).ToList();
            }

            await _next(context);
        }
    }

}
