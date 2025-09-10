using CastMe.Domain.Entities;
using CastMe.UserApi.Services;
using Microsoft.AspNetCore.Http;
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
            //var userIdClaim = httpContext.User?.FindFirst("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier")?.Value;
            var userIdClaim = httpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrWhiteSpace(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
            {
                context.Result = new ForbidResult();
                return;
            }


            var user = await _userService.GetById(Guid.Parse(userIdClaim));
            if (user == null)
            {
                context.Result = new ForbidResult();
                return;
            }

            var userRoleId = user?.RoleId;
            var allRoles = await _userService.GetAllRoles();

            var userRole = allRoles.FirstOrDefault(r => r.Id == userRoleId);

            var userRoleName = userRole?.Name;


            if (userRole == null || !_roles.Contains(userRoleName))
            {
                context.Result = new ForbidResult();
                return;
            }

            await next();
        }
    }

}
