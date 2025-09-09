using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure.Storage
{
    public interface IImageStorage
    {
        Task<string> SaveAsync(string relativePath, Stream content);
        Task<bool> DeleteAsync(string relativePath);
        string GetPublicUrl(string relativePath);
    }
}
