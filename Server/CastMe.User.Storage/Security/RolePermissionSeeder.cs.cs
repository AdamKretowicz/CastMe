using Domain.Entities;
using Infrastructure.Context;
using Domain.Entities;
using Infrastructure.Security;

namespace Infrastructure.Security;

public class RolePermissionSeeder
{
    public static async Task SeedAsync(UserDbContext context)
    {
        if (context.Permissions.Any()) return;

        var permissions = new List<Permission>();
        var roles = new List<UserRole>();

        // Tworzenie uprawnień
        var createCasting = new Permission { Id = Guid.NewGuid(), Action = Actions.Create, Resource = Resources.Casting };
        var viewAllCastings = new Permission { Id = Guid.NewGuid(), Action = Actions.View, Resource = Resources.AllCastings };
        var viewPublicCastings = new Permission { Id = Guid.NewGuid(), Action = Actions.View, Resource = Resources.PublicCastings };
        var updateOwnProfile = new Permission { Id = Guid.NewGuid(), Action = Actions.Update, Resource = Resources.OwnProfile };
        var viewAllProfiles = new Permission { Id = Guid.NewGuid(), Action = Actions.View, Resource = Resources.AllProfiles };
        var manageUsers = new Permission { Id = Guid.NewGuid(), Action = Actions.Manage, Resource = Resources.Users };
        var applyCasting = new Permission { Id = Guid.NewGuid(), Action = Actions.Apply, Resource = Resources.Casting };

        permissions.AddRange(new[] { createCasting, viewAllCastings, viewPublicCastings, updateOwnProfile, viewAllProfiles, manageUsers, applyCasting });

        // Tworzenie ról z uprawnieniami
        var organizerRole = new UserRole
        {
            Id = Guid.NewGuid(),
            Name = Roles.Organizer,
            Permissions = new[] { createCasting, viewAllCastings, viewAllProfiles, manageUsers }
        };

        var modelRole = new UserRole
        {
            Id = Guid.NewGuid(),
            Name = Roles.Model,
            Permissions = new[] { viewPublicCastings, applyCasting, updateOwnProfile }
        };

        var guestRole = new UserRole
        {
            Id = Guid.NewGuid(),
            Name = Roles.Guest,
            Permissions = new[] { viewPublicCastings }
        };

        roles.AddRange(new[] { organizerRole, modelRole, guestRole });

        context.Permissions.AddRange(permissions);
        context.UserRoles.AddRange(roles);

        await context.SaveChangesAsync();
    }
}