using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure.Security
{
    public static class UserOwnership
    {
        public static bool IsOwner(ClaimsPrincipal user, Guid routeUserId)
        {
            var sub = user.FindFirstValue(ClaimTypes.NameIdentifier) ?? user.FindFirstValue("sub");
            return Guid.TryParse(sub, out var current) && current == routeUserId;
        }
    }
}
