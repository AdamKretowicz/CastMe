using Microsoft.AspNetCore.Mvc;

namespace WebApi.Extensions
{
    public class RoleAuthorizeAttribute : TypeFilterAttribute
    {
        public RoleAuthorizeAttribute(params string[] roles) : base(typeof(RoleAuthorizeFilter))
        {
            Arguments = new object[] { roles };
        }
    }

}
