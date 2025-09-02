using CastMe.Domain.Entities;
using Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Context;
public class UserDbContext : DbContext
{
    public UserDbContext(DbContextOptions<UserDbContext> options) : base(options) { }

    public DbSet<User> Users { get; set; } = null!;


    public DbSet<Casting> Castings { get; set; } = null!;
    public DbSet<CastingRole> Roles { get; set; } = null!;
    public DbSet<CastingTag> Tags { get; set; } = null!;
}