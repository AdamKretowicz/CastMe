using CastMe.UserApi.Services;
using Infrastructure.Context;
using WebApi.Services;

namespace CastMe.UserApi.Extensions
{
    public static class ServiceCollectionExtensions
    {
        public static IServiceCollection AddUserServices(this IServiceCollection services)
        {
            services.AddDbContext<UserDbContext, UserDbContext>();
            services.AddTransient<UserService>();
            services.AddTransient<CastingService>();
            return services;
        }
    }
}
