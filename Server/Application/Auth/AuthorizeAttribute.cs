using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Auth
{
    [AttributeUsage(AttributeTargets.Class | AttributeTargets.Method, AllowMultiple = true)]
    public class AuthorizeAttribute : Attribute
    {
        public string Action { get; }
        public string Resource { get; }

        public AuthorizeAttribute(string action, string resource)
        {
            Action = action;
            Resource = resource;
        }
    }
}
