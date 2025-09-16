using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class Seed : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {// Generate GUIDs for UserRoles
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
    columns: new[] { "Id", "UserName", "PasswordHash", "FirstName", "LastName", "Phone", "DateOfBirth", "Height", "Weight", "Email", "Country", "City", "Description", "Gender", "HairColor", "ClothingSize", "Status", "RoleId", "AcceptedTerms" },
    values: new object[,]
    {
        {
            user1Id,
            "admin",
            BCrypt.Net.BCrypt.HashPassword("password123"),
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
            1, // Active,
            adminRoleId,
            true,

        },
        {
            user2Id,
            "alex_photographer",
            BCrypt.Net.BCrypt.HashPassword("password123"),
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
            1, // Active
            photographerRoleId,
            true,
        },
        {
            user3Id,
            "emma_admin",
            BCrypt.Net.BCrypt.HashPassword("password123"),
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
            1, // Active
            designerRoleId,
            true,
        }
    });
            migrationBuilder.InsertData(
    schema: "User",
    table: "Experiences",
    columns: new[] { "Id", "UserId", "ProjectName", "Role", "Description", "StartDate", "EndDate", "Link", "CreatedAt" },
    values: new object[,]
    {
        {
            Guid.NewGuid(), // lub stałe Id np. exp1Id
            user1Id,
            "Fashion Week Paris 2022",
            "Runway Model",
            "Participated in Paris Fashion Week, modeling for several international designers.",
            new DateTime(2022, 9, 15),
            new DateTime(2022, 9, 20),
            "https://example.com/fashionweek2022",
            DateTime.UtcNow
        },
        {
            Guid.NewGuid(),
            user1Id,
            "Commercial Shoot for XYZ Brand",
            "Model",
            "Worked on a commercial shoot for XYZ brand, featured in national campaign.",
            new DateTime(2021, 6, 5),
            new DateTime(2021, 6, 10),
            "https://example.com/xyzshoot",
            DateTime.UtcNow
        },
        {
            Guid.NewGuid(),
            user2Id,
            "Editorial Photoshoot for Vogue",
            "Photographer",
            "Captured editorial photos for Vogue magazine's summer edition.",
            new DateTime(2023, 4, 1),
            new DateTime(2023, 4, 5),
            "https://example.com/vogueeditorial",
            DateTime.UtcNow
        },
        {
            Guid.NewGuid(),
            user3Id,
            "Casting for ABC Commercial",
            "Casting Director",
            "Managed casting process for ABC commercial, selecting models and coordinating shoots.",
            new DateTime(2022, 11, 10),
            new DateTime(2022, 11, 15),
            null,
            DateTime.UtcNow
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
            // Seed CastingAssignments
            migrationBuilder.InsertData(
                schema: "Casting",
                table: "CastingAssignments",
                columns: new[] { "Id", "CastingId", "RoleId", "UserId" },
                values: new object[,]
                {
        // Summer Fashion Campaign 2025 assignments
        {
            Guid.NewGuid(), // assignment1Id
            casting1Id,
            modelRoleId,    // UserRole: Model
            user1Id         // Sophia
        },
        {
            Guid.NewGuid(), // assignment2Id
            casting1Id,
            photographerRoleId, // UserRole: Photographer
            user2Id             // Alex
        },
        {
            Guid.NewGuid(), // assignment3Id
            casting1Id,
            designerRoleId, // UserRole: Designer or volunteerRoleId if needed
            user3Id
        },

        // Independent Film Production assignments
        {
            Guid.NewGuid(), // assignment4Id
            casting2Id,
            modelRoleId,    // UserRole: Model
            user1Id
        },
        {
            Guid.NewGuid(), // assignment5Id
            casting2Id,
            designerRoleId, // UserRole: Designer
            user3Id
        },

        // Commercial Photography Workshop assignments
        {
            Guid.NewGuid(), // assignment6Id
            casting3Id,
            photographerRoleId, // UserRole: Photographer
            user2Id
        },
        {
            Guid.NewGuid(), // assignment7Id
            casting3Id,
            modelRoleId,    // UserRole: Model
            user1Id
        }
                });

        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {

        }
    }
}
