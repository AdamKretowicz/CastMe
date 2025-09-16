using CastMe.UserApi.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using System.Security.Claims;

namespace WebApi.Extensions
{
    public class CurrentUserFilter : IAsyncActionFilter
    {
        private readonly UserService _userService;

        public CurrentUserFilter(UserService userService)
        {
            _userService = userService;
        }

        public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
        {
            var httpContext = context.HttpContext;
            var userIdClaim = httpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrWhiteSpace(userIdClaim) || !Guid.TryParse(userIdClaim, out var loggedUserId))
            {
                context.Result = new UnauthorizedResult();
                return;
            }

            var user = await _userService.GetById(loggedUserId);
            if (user == null)
            {
                context.Result = new UnauthorizedResult();
                return;
            }

            // Sprawdzenie roli
            var role = await _userService.GetRoleById(user.RoleId);
            var isAdmin = role?.Name?.Equals("Admin", StringComparison.OrdinalIgnoreCase) == true;

            // Pobranie parametru userId z akcji
            if (context.ActionArguments.TryGetValue("userId", out var arg) && arg is Guid targetUserId)
            {
                if (!isAdmin && loggedUserId != targetUserId)
                {
                    context.Result = new ForbidResult();
                    return;
                }
            }
            else
            {
                // Jeśli akcja wymaga userId, a go nie ma → blokada
                context.Result = new BadRequestObjectResult("Brak parametru userId w akcji.");
                return;
            }

            await next();
        }
    }

    public class CurrentUserAttribute : TypeFilterAttribute
    {
        public CurrentUserAttribute() : base(typeof(CurrentUserFilter)) { }
    }
}

