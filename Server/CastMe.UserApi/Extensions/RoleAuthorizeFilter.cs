using CastMe.UserApi.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using System.Security.Claims;

namespace WebApi.Extensions
{

    public class RoleAuthorizeFilter :  IAsyncActionFilter
    {
        private readonly string[] _roles;
        private readonly UserService _userService;


        public RoleAuthorizeFilter(string[] roles, UserService userService)
        {
            _roles = roles;
            _userService = userService;
        }

        public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
        {
            var httpContext = context.HttpContext;


            //var userIdClaim = httpContext.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var userIdClaim = httpContext.User?.FindFirst("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier")?.Value;

            if (string.IsNullOrWhiteSpace(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
            {
                context.Result = new ForbidResult();
                return;
            }


            var user = await _userService.GetById(Guid.Parse(userIdClaim));
            var userRole = user?.Role?.Name;

            if (userRole == null || !_roles.Contains(userRole))
            {
                context.Result = new ForbidResult();
                return;
            }

            await next();
        }
    }

}
