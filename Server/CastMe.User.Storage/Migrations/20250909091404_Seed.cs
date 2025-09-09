using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class Seed : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Generate GUIDs for UserRoles
            var modelRoleId = Guid.NewGuid();
            var adminRoleId = Guid.NewGuid();
            var photographerRoleId = Guid.NewGuid();
            var designerRoleId = Guid.NewGuid();
            var volunteerRoleId = Guid.NewGuid();

            // Generate GUIDs for Users
            var user1Id = Guid.NewGuid();
            var user2Id = Guid.NewGuid();
            var user3Id = Guid.NewGuid();

            // Generate GUIDs for Castings
            var casting1Id = Guid.NewGuid();
            var casting2Id = Guid.NewGuid();
            var casting3Id = Guid.NewGuid();

            // Generate GUIDs for CastingRoles
            var castingRole1Id = Guid.NewGuid();
            var castingRole2Id = Guid.NewGuid();
            var castingRole3Id = Guid.NewGuid();
            var castingRole4Id = Guid.NewGuid();
            var castingRole5Id = Guid.NewGuid();
            var castingRole6Id = Guid.NewGuid();
            var castingRole7Id = Guid.NewGuid();
            var castingRole8Id = Guid.NewGuid();
            var castingRole9Id = Guid.NewGuid();

            // Generate GUIDs for CastingTags
            var tag1Id = Guid.NewGuid();
            var tag2Id = Guid.NewGuid();
            var tag3Id = Guid.NewGuid();
            var tag4Id = Guid.NewGuid();
            var tag5Id = Guid.NewGuid();
            var tag6Id = Guid.NewGuid();
            var tag7Id = Guid.NewGuid();
            var tag8Id = Guid.NewGuid();
            var tag9Id = Guid.NewGuid();

            // Seed UserRoles
            migrationBuilder.InsertData(
                schema: "User",
                table: "UserRoles",
                columns: new[] { "Id", "Name" },
                values: new object[,]
                {
                    { modelRoleId, "Model" },
                    { adminRoleId, "Admin" },
                    { photographerRoleId, "Photographer" },
                    { designerRoleId, "Designer" },
                    { volunteerRoleId, "Volunteer" }
                });

            // Seed Users
            migrationBuilder.InsertData(
                schema: "User",
                table: "Users",
                columns: new[] { "Id", "UserName", "PasswordHash", "FirstName", "LastName", "Phone", "DateOfBirth", "Height", "Weight", "Email", "Country", "City", "Description", "Gender", "HairColor", "ClothingSize", "RoleId", "Status" },
                values: new object[,]
                {
                    {
                        user1Id,
                        "sophia_model",
                        "$2a$11$K2x4Z9.ZVL7JJ8KwP2eqrO7yX1nB3mF4wE5qC6aH8vI9gT2pL0xYm", // bcrypt hash for "password123"
                        "Sophia",
                        "Martinez",
                        "+1-555-0101",
                        new DateTime(1995, 6, 15),
                        170,
                        55,
                        "sophia.martinez@email.com",
                        "USA",
                        "Los Angeles",
                        "Professional fashion model with 5+ years experience in runway and commercial photography.",
                        0, // Female
                        "Blonde",
                        "S",
                        modelRoleId, // Model role
                        1 // Active
                    },
                    {
                        user2Id,
                        "alex_photographer",
                        "$2a$11$K2x4Z9.ZVL7JJ8KwP2eqrO7yX1nB3mF4wE5qC6aH8vI9gT2pL0xYm",
                        "Alex",
                        "Johnson",
                        "+1-555-0202",
                        new DateTime(1988, 3, 22),
                        178,
                        72,
                        "alex.johnson@email.com",
                        "USA",
                        "New York",
                        "Creative photographer specializing in fashion and portrait photography with modern techniques.",
                        1, // Male
                        "Brown",
                        "M",
                        photographerRoleId, // Photographer role
                        1 // Active
                    },
                    {
                        user3Id,
                        "emma_admin",
                        "$2a$11$K2x4Z9.ZVL7JJ8KwP2eqrO7yX1nB3mF4wE5qC6aH8vI9gT2pL0xYm",
                        "Emma",
                        "Davis",
                        "+1-555-0303",
                        new DateTime(1990, 11, 8),
                        165,
                        60,
                        "emma.davis@email.com",
                        "USA",
                        "Chicago",
                        "Experienced casting director and event coordinator with expertise in talent management.",
                        0, // Female
                        "Red",
                        "M",
                        adminRoleId, // Admin role
                        1 // Active
                    }
                });

            // Seed Castings
            migrationBuilder.InsertData(
                schema: "Casting",
                table: "Castings",
                columns: new[] { "Id", "Title", "Description", "Location", "EventDate", "Requirements", "Compensation", "BannerUrl", "OrganizerId", "Status", "CreatedAt", "UpdatedAt" },
                values: new object[,]
                {
                    {
                        casting1Id,
                        "Summer Fashion Campaign 2025",
                        "We are looking for dynamic models for our upcoming summer fashion campaign featuring the latest beachwear and casual collections. This exciting project will showcase contemporary designs across multiple platforms including digital advertising and print media.",
                        "Miami Beach, Florida",
                        new DateTime(2025, 7, 15, 10, 0, 0),
                        "Must be comfortable with beachwear and swimwear modeling. Previous modeling experience preferred. Must be available for full day shoot. Professional attitude required.",
                        "$500-800 per day",
                        "https://example.com/banners/summer-campaign.jpg",
                        user3Id, // Emma Admin
                        0, // Active
                        new DateTime(2025, 4, 1, 9, 0, 0),
                        null
                    },
                    {
                        casting2Id,
                        "Independent Film Production",
                        "Seeking talented actors and crew members for an independent drama film exploring themes of family and resilience. This project offers great opportunities for portfolio building and networking within the film industry community.",
                        "Austin, Texas",
                        new DateTime(2025, 8, 20, 8, 0, 0),
                        "Acting experience required for lead roles. Background actors welcome with no experience. Must be reliable and committed to the full production schedule spanning 3 weeks.",
                        "$200-1500 depending on role",
                        "https://example.com/banners/indie-film.jpg",
                        user3Id, // Emma Admin
                        0, // Active
                        new DateTime(2025, 5, 10, 14, 30, 0),
                        null
                    },
                    {
                        casting3Id,
                        "Commercial Photography Workshop",
                        "Join our intensive commercial photography workshop designed for emerging photographers. Learn advanced lighting techniques, composition, and post-processing skills while working with professional models in a studio environment.",
                        "Portland, Oregon",
                        new DateTime(2025, 6, 5, 9, 0, 0),
                        "Basic photography knowledge required. Must bring own camera equipment (DSLR or mirrorless). Laptop with Lightroom/Photoshop recommended for editing sessions.",
                        "$150 workshop fee",
                        "https://example.com/banners/photo-workshop.jpg",
                        user3Id, // Emma Admin
                        0, // Active
                        new DateTime(2025, 3, 20, 11, 15, 0),
                        null
                    }
                });

            // Seed CastingRoles
            migrationBuilder.InsertData(
                schema: "Casting",
                table: "CastingRoles",
                columns: new[] { "Id", "CastingId", "Role", "Capacity", "AcceptedCount" },
                values: new object[,]
                {
                    // Summer Fashion Campaign roles
                    {
                        castingRole1Id,
                        casting1Id,
                        0, // Model
                        8,
                        3
                    },
                    {
                        castingRole2Id,
                        casting1Id,
                        2, // Photographer
                        2,
                        1
                    },
                    {
                        castingRole3Id,
                        casting1Id,
                        4, // Volunteer
                        5,
                        2
                    },
                    // Independent Film roles
                    {
                        castingRole4Id,
                        casting2Id,
                        0, // Model (actors)
                        15,
                        7
                    },
                    {
                        castingRole5Id,
                        casting2Id,
                        3, // Designer
                        3,
                        1
                    },
                    {
                        castingRole6Id,
                        casting2Id,
                        4, // Volunteer
                        10,
                        4
                    },
                    // Photography Workshop roles
                    {
                        castingRole7Id,
                        casting3Id,
                        2, // Photographer
                        20,
                        12
                    },
                    {
                        castingRole8Id,
                        casting3Id,
                        0, // Model
                        6,
                        3
                    },
                    {
                        castingRole9Id,
                        casting3Id,
                        4, // Volunteer
                        4,
                        2
                    }
                });

            // Seed CastingTags
            migrationBuilder.InsertData(
                schema: "Casting",
                table: "CastingTags",
                columns: new[] { "Id", "CastingId", "Value" },
                values: new object[,]
                {
                    // Summer Fashion Campaign tags
                    {
                        tag1Id,
                        casting1Id,
                        "Fashion"
                    },
                    {
                        tag2Id,
                        casting1Id,
                        "Summer"
                    },
                    {
                        tag3Id,
                        casting1Id,
                        "Beachwear"
                    },
                    // Independent Film tags
                    {
                        tag4Id,
                        casting2Id,
                        "Film"
                    },
                    {
                        tag5Id,
                        casting2Id,
                        "Acting"
                    },
                    {
                        tag6Id,
                        casting2Id,
                        "Independent"
                    },
                    // Photography Workshop tags
                    {
                        tag7Id,
                        casting3Id,
                        "Photography"
                    },
                    {
                        tag8Id,
                        casting3Id,
                        "Workshop"
                    },
                    {
                        tag9Id,
                        casting3Id,
                        "Commercial"
                    }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {

        }
    }
}
