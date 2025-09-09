using Application.Auth;
using Application.Interfaces;
using CastMe.UserApi.Services;
using Infrastructure.Auth;
using Infrastructure.Context;
using MediatR;
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

            services.AddScoped<IAuthorizationService, AuthorizationService>();
            services.AddScoped<ICurrentUserService, CurrentUserService>();
            services.AddTransient(typeof(IPipelineBehavior<,>), typeof(AuthorizationBehavior<,>));

            return services;
        }
    }
}
