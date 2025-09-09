using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace WebApi.Extensions
{

    [AttributeUsage(AttributeTargets.Method | AttributeTargets.Class, AllowMultiple = true)]
    public class RoleAuthorizeAttribute : Attribute, IAsyncActionFilter
    {
        private readonly string[] _roles;

        public RoleAuthorizeAttribute(params string[] roles)
        {
            _roles = roles;
        }

        public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
        {
            var httpContext = context.HttpContext;
            var userRoles = httpContext.Items["UserRoles"] as List<string>;

            if (userRoles == null || !_roles.Any(r => userRoles.Contains(r)))
            {
                context.Result = new ForbidResult();
                return;
            }

            await next();
        }
    }

}
