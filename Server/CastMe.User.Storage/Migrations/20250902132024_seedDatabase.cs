using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class seedDatabase : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // --- Seed Users ---
            migrationBuilder.InsertData(
                schema: "User",
                table: "Users",
                columns: new[] { "Id", "UserName", "PasswordHash", "FirstName", "LastName", "Phone", "DateOfBirth", "Height", "Weight", "Email", "Country", "City", "Description", "Gender", "HairColor", "ClothingSize" },
                values: new object[,]
                {
                    { Guid.NewGuid(), "jdoe", "hash123", "John", "Doe", "123456789", new DateTime(1990,1,1), 180, 75, "john.doe@example.com", "USA", "New York", "Actor", 1, "Brown", "M" },
                    { Guid.NewGuid(), "asmith", "hash456", "Alice", "Smith", "987654321", new DateTime(1992,2,2), 170, 60, "alice.smith@example.com", "UK", "London", "Model", 2, "Blonde", "S" },
                    { Guid.NewGuid(), "bwong", "hash789", "Bob", "Wong", "555111222", new DateTime(1985,3,3), 175, 80, "bob.wong@example.com", "Canada", "Toronto", "Photographer", 1, "Black", "L" },
                    { Guid.NewGuid(), "mgarcia", "hash321", "Maria", "Garcia", "444555666", new DateTime(1995,4,4), 165, 55, "maria.garcia@example.com", "Spain", "Madrid", "Designer", 2, "Red", "XS" }
                });

            // --- Seed Castings ---
            var casting1Id = Guid.NewGuid();
            var casting2Id = Guid.NewGuid();
            var casting3Id = Guid.NewGuid();
            var casting4Id = Guid.NewGuid();

            migrationBuilder.InsertData(
                schema: "Casting",
                table: "Castings",
                columns: new[] { "Id", "Title", "Description", "Location", "EventDate", "Requirements", "Compensation", "BannerPath", "OrganizerId", "Status", "CreatedAt" },
                values: new object[,]
                {
                    { casting1Id, "Short Film", "Casting actors for a short indie film.", "Los Angeles", DateTime.UtcNow.AddMonths(1), "Acting experience preferred", "$200/day", null, Guid.NewGuid(), 1, DateTime.UtcNow },
                    { casting2Id, "Fashion Show", "Runway models for fashion week.", "Paris", DateTime.UtcNow.AddMonths(2), "Height 5'9+ for women", "Travel & lodging", null, Guid.NewGuid(), 1, DateTime.UtcNow },
                    { casting3Id, "Music Video", "Casting dancers for a music video.", "London", DateTime.UtcNow.AddMonths(1), "Dance background required", "$150/day", null, Guid.NewGuid(), 1, DateTime.UtcNow },
                    { casting4Id, "Commercial", "Casting families for a TV commercial.", "New York", DateTime.UtcNow.AddMonths(3), "Comfortable on camera", "$1000 flat", null, Guid.NewGuid(), 1, DateTime.UtcNow }
                });

            // --- Seed CastingRoles ---
            migrationBuilder.InsertData(
                schema: "Casting",
                table: "CastingRoles",
                columns: new[] { "Id", "CastingId", "Role", "Capacity", "AcceptedCount" },
                values: new object[,]
                {
                    { Guid.NewGuid(), casting1Id, 1, 2, 0 },
                    { Guid.NewGuid(), casting2Id, 1, 4, 0 },
                    { Guid.NewGuid(), casting3Id, 2, 1, 0 },
                    { Guid.NewGuid(), casting4Id, 3, 3, 0 }
                });

            // --- Seed CastingTags ---
            migrationBuilder.InsertData(
                schema: "Casting",
                table: "CastingTags",
                columns: new[] { "Id", "CastingId", "Value" },
                values: new object[,]
                {
                    { Guid.NewGuid(), casting1Id, "Film" },
                    { Guid.NewGuid(), casting2Id, "Fashion" },
                    { Guid.NewGuid(), casting3Id, "Music" },
                    { Guid.NewGuid(), casting4Id, "Commercial" }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("DELETE FROM [Casting].[CastingTags]");
            migrationBuilder.Sql("DELETE FROM [Casting].[CastingRoles]");
            migrationBuilder.Sql("DELETE FROM [Casting].[Castings]");
            migrationBuilder.Sql("DELETE FROM [User].[Users]");
        }
    }
}
