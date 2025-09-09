namespace WebApi.Extensions
{
    public static class HttpContextExtensions
    {
        public static bool UserHasRole(this HttpContext context, string role)
        {
            var roles = context.Items["UserRoles"] as List<string>;
            return roles != null && roles.Contains(role);
        }
    }

}
