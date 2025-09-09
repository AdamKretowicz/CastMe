using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Options;

namespace Infrastructure.Storage
{
    public class LocalStorageOptions
    {
        public string UploadsRoot { get; set; } = "wwwroot/uploads";
        public string PublicBasePath { get; set; } = "/uploads";
    }

    public class LocalImageStorage : IImageStorage
    {
        private readonly string _uploadsRoot;
        private readonly string _publicBasePath;

        public LocalImageStorage(IOptions<LocalStorageOptions> options, IWebHostEnvironment env)
        {
            _uploadsRoot = Path.IsPathRooted(options.Value.UploadsRoot)
                ? options.Value.UploadsRoot
                : Path.Combine(env.ContentRootPath, options.Value.UploadsRoot);

            _publicBasePath = options.Value.PublicBasePath.TrimEnd('/');

            Directory.CreateDirectory(_uploadsRoot);
        }

        public async Task<string> SaveAsync(string relativePath, Stream content)
        {
            var physicalPath = Path.Combine(_uploadsRoot, relativePath.Replace('/', Path.DirectorySeparatorChar));
            Directory.CreateDirectory(Path.GetDirectoryName(physicalPath)!);

            using var fs = new FileStream(physicalPath, FileMode.Create, FileAccess.Write, FileShare.None);
            await content.CopyToAsync(fs);
            return relativePath;
        }

        public async Task<bool> DeleteAsync(string relativePath)
        {
            var physicalPath = Path.Combine(_uploadsRoot, relativePath.Replace('/', Path.DirectorySeparatorChar));
            if (!File.Exists(physicalPath)) return false;
            await Task.Run(() => File.Delete(physicalPath));
            return true;
        }

        public string GetPublicUrl(string relativePath)
            => $"{_publicBasePath}/{relativePath.Replace('\\', '/')}".Replace("//", "/");
    }
}
