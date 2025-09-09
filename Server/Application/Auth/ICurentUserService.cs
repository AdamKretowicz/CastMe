using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Auth
{
    public interface ICurrentUserService
    {
        Guid? UserId { get; }
        IEnumerable<string> Roles { get; }
        string? UserName { get; }
        bool IsAuthenticated { get; }
    }
    
}
