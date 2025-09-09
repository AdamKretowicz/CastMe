using MediatR;
using Application.Interfaces;
using System.Reflection;

namespace Application.Auth;

public class AuthorizationBehavior<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse>
    where TRequest : IRequest<TResponse>
{
    private readonly IAuthorizationService _authorizationService;
    private readonly ICurrentUserService _currentUserService;

    public AuthorizationBehavior(IAuthorizationService authorizationService, ICurrentUserService currentUserService)
    {
        _authorizationService = authorizationService;
        _currentUserService = currentUserService;
    }

    public async Task<TResponse> Handle(TRequest request, RequestHandlerDelegate<TResponse> next, CancellationToken cancellationToken)
    {
        var authorizeAttributes = request.GetType().GetCustomAttributes<AuthorizeAttribute>();

        if (authorizeAttributes.Any())
        {
            if (!_currentUserService.IsAuthenticated)
                throw new UnauthorizedAccessException("User must be authenticated");

            var userId = _currentUserService.UserId!.Value;

            foreach (var attr in authorizeAttributes)
            {
                var hasPermission = await _authorizationService.CanAccessAsync(userId, attr.Action, attr.Resource);
                if (!hasPermission)
                    throw new UnauthorizedAccessException($"User lacks permission: {attr.Action} on {attr.Resource}");
            }
        }

        return await next();
    }
}