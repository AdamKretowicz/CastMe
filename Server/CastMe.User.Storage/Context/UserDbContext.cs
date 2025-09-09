using CastMe.Domain.Entities;
using Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Context;
public class UserDbContext : DbContext
{
    public UserDbContext(DbContextOptions<UserDbContext> options) : base(options) { }

    public DbSet<User> Users { get; set; } = null!;

    public DbSet<Photo> Photos { get; set; } = null!;
    public DbSet<Casting> Castings { get; set; } = null!;
    public DbSet<CastingRole> Roles { get; set; } = null!;
    public DbSet<CastingTag> Tags { get; set; } = null!;
    public DbSet<UserRole> UserRoles { get; set; } = null!;
    public DbSet<Permission> Permissions { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>()
            .HasOne(u => u.Role)
            .WithMany(r => r.Users)
            .HasForeignKey(u => u.RoleId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<UserRole>()
            .HasMany(ur => ur.Permissions)
            .WithMany(p => p.UserRoles)
            .UsingEntity(j => j.ToTable("UserRolePermissions"));

    }


}