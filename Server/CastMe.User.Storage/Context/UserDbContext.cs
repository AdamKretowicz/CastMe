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
    public DbSet<CastingAssignment> Assignments { get; set; } = null!;
    public DbSet<Experience> Experiences { get; set; } = null!;


    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>()
            .HasOne(u => u.Role)
            .WithMany(r => r.Users)
            .HasForeignKey(u => u.RoleId);

        modelBuilder.Entity<CastingAssignment>(entity =>
        {
            entity.HasKey(e => e.Id);

            entity.HasOne(e => e.Casting)
                .WithMany(c => c.Assignments)
                .HasForeignKey(e => e.CastingId)
                .OnDelete(DeleteBehavior.Cascade); // tylko tu CASCADE

            entity.HasOne(e => e.Role)
                .WithMany(r => r.Assignments)
                .HasForeignKey(e => e.RoleId)
                .OnDelete(DeleteBehavior.NoAction); // brak kaskady

            entity.HasOne(e => e.User)
                .WithMany(u => u.Assignments)
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.NoAction); // brak kaskady
        });
    }


}