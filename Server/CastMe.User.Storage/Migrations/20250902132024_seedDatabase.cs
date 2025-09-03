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
            migrationBuilder.InsertData(
                schema: "User",
                table: "Users",
                columns: new[] { "Id", "UserName", "PasswordHash", "FirstName", "LastName", "Phone", "DateOfBirth", "Height", "Weight", "Email", "Country", "City", "Description", "Gender", "HairColor", "ClothingSize" },
                values: new object[,]
                {
                    { "6e2882a0-4c3e-46a2-a63e-63f5b042a220", "john.doe", "hashed_password_1", "John", "Doe", "123-456-7890", new DateTime(1990, 5, 15, 0, 0, 0, 0, DateTimeKind.Unspecified), 180, 75, "john.doe@example.com", "USA", "New York", "Experienced actor with a focus on dramatic roles.", 0, "Brown", "M" },
                    { "4e8f17a9-2e11-47c3-8a3c-58c3f7e5d233", "jane.smith", "hashed_password_2", "Jane", "Smith", "987-654-3210", new DateTime(1992, 8, 20, 0, 0, 0, 0, DateTimeKind.Unspecified), 165, 60, "jane.smith@example.com", "Canada", "Toronto", "Versatile model and actress.", 1, "Blonde", "S" },
                    { "8f22e8a1-7d1c-4b5f-a4d3-8c4d21e3f945", "alex.jones", "hashed_password_3", "Alex", "Jones", "555-123-4567", new DateTime(1988, 11, 25, 0, 0, 0, 0, DateTimeKind.Unspecified), 175, 70, "alex.jones@example.com", "UK", "London", "Professional photographer and casting director.", 0, "Black", "L" },
                    { "1c7b39f4-0e5a-4f81-a67b-1c5c4f2e9d22", "emily.white", "hashed_password_4", "Emily", "White", "111-222-3333", new DateTime(1995, 3, 10, 0, 0, 0, 0, DateTimeKind.Unspecified), 170, 63, "emily.white@example.com", "Australia", "Sydney", "Aspiring musician and voice-over artist.", 1, "Red", "S" },
                    { "5a3f2d1e-8a2c-4f7b-9c4a-8e2c4f1e9d21", "david.lee", "hashed_password_5", "David", "Lee", "444-555-6666", new DateTime(1985, 7, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), 190, 85, "david.lee@example.com", "Germany", "Berlin", "Commercial model and brand ambassador.", 0, "Brown", "XL" },
                    { "9b8d2a1f-3e4b-5c6d-7e8f-1a2b3c4d5e6f", "sarah.brown", "hashed_password_6", "Sarah", "Brown", "777-888-9999", new DateTime(1998, 12, 30, 0, 0, 0, 0, DateTimeKind.Unspecified), 168, 58, "sarah.brown@example.com", "USA", "Los Angeles", "Freelance graphic designer with a passion for film.", 1, "Blonde", "M" },
                    { "3c4e5f6a-7b8c-9d0e-1f2a-3b4c5d6e7f8a", "michael.chen", "hashed_password_7", "Michael", "Chen", "222-333-4444", new DateTime(1993, 2, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), 182, 78, "michael.chen@example.com", "China", "Shanghai", "Dancer and choreographer.", 0, "Black", "M" },
                    { "6d7e8f9a-0b1c-2d3e-4f5a-6b7c8d9e0f1a", "olivia.green", "hashed_password_8", "Olivia", "Green", "888-999-0000", new DateTime(1996, 6, 22, 0, 0, 0, 0, DateTimeKind.Unspecified), 173, 65, "olivia.green@example.com", "France", "Paris", "Fashion stylist and creative director.", 1, "Red", "S" },
                    { "8e9f0a1b-2c3d-4e5f-6a7b-8c9d0e1f2a3b", "robert.hall", "hashed_password_9", "Robert", "Hall", "999-000-1111", new DateTime(1980, 9, 5, 0, 0, 0, 0, DateTimeKind.Unspecified), 185, 90, "robert.hall@example.com", "USA", "Chicago", "Experienced director and producer.", 0, "Gray", "L" },
                    { "1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d", "jessica.clark", "hashed_password_10", "Jessica", "Clark", "333-444-5555", new DateTime(2000, 4, 18, 0, 0, 0, 0, DateTimeKind.Unspecified), 160, 55, "jessica.clark@example.com", "Italy", "Rome", "Student and part-time model.", 1, "Brown", "S" }
                });

            migrationBuilder.InsertData(
                schema: "Casting",
                table: "Castings",
                columns: new[] { "Id", "Title", "Description", "Location", "EventDate", "Requirements", "Compensation", "OrganizerId", "Status", "CreatedAt" },
                values: new object[,]
                {
                    { "06b0d9f4-183e-4d6f-9f7a-8f4b2a3c5d6e", "Short Film: The Last Stand", "We are casting for a dramatic short film about a post-apocalyptic world. We need lead and supporting actors with strong improvisation skills.", "Los Angeles, CA", new DateTime(2025, 10, 15, 10, 0, 0, 0, DateTimeKind.Unspecified), "Must be available for weekend shoots. Experience in stunt work is a plus.", "$500 per day", "6e2882a0-4c3e-46a2-a63e-63f5b042a220", 0, new DateTime(2025, 9, 1, 10, 0, 0, 0, DateTimeKind.Unspecified) },
                    { "1f9c8d5a-6b7c-4e8f-9d2a-1b3c4d5e6f7a", "Commercial Shoot: Tech Gadget", "Casting for a commercial for a new smart gadget. We need a diverse cast of all ages and backgrounds to represent a wide audience.", "New York, NY", new DateTime(2025, 10, 20, 14, 30, 0, 0, DateTimeKind.Unspecified), "Must have a clean, professional appearance and be comfortable on camera.", "$1000 flat rate", "8f22e8a1-7d1c-4b5f-a4d3-8c4d21e3f945", 0, new DateTime(2025, 9, 2, 12, 0, 0, 0, DateTimeKind.Unspecified) },
                    { "2a4b6c8d-0e1f-2a3b-4c5d-6e7f8a9b0c1d", "Fashion Show: Spring Collection", "Looking for male and female models to walk the runway for our upcoming spring collection. Experience in runway modeling is preferred.", "Paris, France", new DateTime(2025, 11, 5, 18, 0, 0, 0, DateTimeKind.Unspecified), "Height requirements: Female 5''9\" and up, Male 6''0\" and up. Must provide a portfolio.", "Complimentary clothing and professional photos", "6d7e8f9a-0b1c-2d3e-4f5a-6b7c8d9e0f1a", 0, new DateTime(2025, 9, 3, 14, 0, 0, 0, DateTimeKind.Unspecified) },
                    { "3d5e7f9a-1b2c-3d4e-5f6a-7b8c9d0e1f2a", "Music Video: Indie Band", "Casting for actors to be featured in an indie band music video. The video has a surreal, artistic theme and requires expressive performers.", "London, UK", new DateTime(2025, 11, 10, 11, 0, 0, 0, DateTimeKind.Unspecified), "Must be comfortable with abstract concepts and non-linear storytelling. No dialogue.", "Negotiable", "1c7b39f4-0e5a-4f81-a67b-1c5c4f2e9d22", 0, new DateTime(2025, 9, 4, 16, 0, 0, 0, DateTimeKind.Unspecified) },
                    { "4a5b6c7d-8e9f-0a1b-2c3d-4e5f6a7b8c9d", "Voice-over: Animated Series", "Seeking talented voice actors for a new animated series. We need a range of voices for various characters, from heroes to villains.", "Remote", new DateTime(2025, 11, 25, 9, 0, 0, 0, DateTimeKind.Unspecified), "Must have a professional recording setup and provide a demo reel. Experience in animation voice work is a plus.", "$250 per hour", "4e8f17a9-2e11-47c3-8a3c-58c3f7e5d233", 0, new DateTime(2025, 9, 5, 9, 0, 0, 0, DateTimeKind.Unspecified) },
                    { "5c6d7e8f-9a0b-1c2d-3e4f-5a6b7c8d9e0f", "Event Host: Corporate Gala", "Casting a charismatic and professional event host for a corporate gala. The host will be responsible for introducing speakers and engaging with the audience.", "Chicago, IL", new DateTime(2025, 12, 1, 19, 0, 0, 0, DateTimeKind.Unspecified), "Excellent public speaking skills and a polished appearance. Must be able to ad-lib and handle unexpected situations gracefully.", "$750 flat rate", "8e9f0a1b-2c3d-4e5f-6a7b-8c9d0e1f2a3b", 0, new DateTime(2025, 9, 6, 11, 0, 0, 0, DateTimeKind.Unspecified) },
                    { "6b7c8d9e-0f1a-2b3c-4d5e-6f7a8b9c0d1e", "Student Film: Drama", "Casting for a student-produced drama film. The story follows a group of friends navigating college life and relationships.", "Toronto, Canada", new DateTime(2025, 12, 15, 13, 0, 0, 0, DateTimeKind.Unspecified), "We need actors aged 18-25. No prior experience required, we are looking for raw talent.", "Food and film credit only", "9b8d2a1f-3e4b-5c6d-7e8f-1a2b3c4d5e6f", 0, new DateTime(2025, 9, 7, 13, 0, 0, 0, DateTimeKind.Unspecified) },
                    { "7c8d9e0f-1a2b-3c4d-5e6f-7a8b9c0d1e2f", "Print Ad: Fitness Brand", "Seeking fit and athletic models for a new print advertising campaign for a fitness apparel brand. The photos will be used in magazines and online.", "Sydney, Australia", new DateTime(2026, 1, 10, 8, 0, 0, 0, DateTimeKind.Unspecified), "Must have a toned physique and be comfortable wearing athletic wear. All genders welcome.", "$1500 per day", "3c4e5f6a-7b8c-9d0e-1f2a-3b4c5d6e7f8a", 0, new DateTime(2025, 9, 8, 15, 0, 0, 0, DateTimeKind.Unspecified) },
                    { "8d9e0f1a-2b3c-4d5e-6f7a-8b9c0d1e2f3g", "Web Series: Sci-Fi", "Casting for a low-budget sci-fi web series. We need actors who are comfortable with green screen technology and futuristic props.", "Berlin, Germany", new DateTime(2026, 1, 20, 10, 0, 0, 0, DateTimeKind.Unspecified), "Must be available for multiple sessions. Knowledge of sci-fi genres is a plus.", "$100 per episode", "5a3f2d1e-8a2c-4f7b-9c4a-8e2c4f1e9d21", 0, new DateTime(2025, 9, 9, 17, 0, 0, 0, DateTimeKind.Unspecified) },
                    { "9e0f1a2b-3c4d-5e6f-7a8b-9c0d1e2f3a4b", "Commercial: Holiday Theme", "Casting for a festive holiday commercial. We need families, children, and individuals to portray happy holiday moments.", "Rome, Italy", new DateTime(2026, 2, 5, 15, 0, 0, 0, DateTimeKind.Unspecified), "Must have a cheerful and energetic personality. All ethnicities and ages are encouraged to apply.", "$750 flat rate per person", "1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d", 0, new DateTime(2025, 9, 10, 19, 0, 0, 0, DateTimeKind.Unspecified) }
                });

            migrationBuilder.InsertData(
                schema: "Casting",
                table: "CastingRoles",
                columns: new[] { "Id", "CastingId", "Role", "Capacity" },
                values: new object[,]
                {
                    { "1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c7e", "06b0d9f4-183e-4d6f-9f7a-8f4b2a3c5d6e", 0, 1 },
                    { "2b3c4d5e-6f7a-8b9c-0d1e-2f3a4b5c6d7e", "06b0d9f4-183e-4d6f-9f7a-8f4b2a3c5d6e", 1, 2 },
                    { "3c4d5e6f-7a8b-9c0d-1e2f-3a4b5c6d7e8f", "1f9c8d5a-6b7c-4e8f-9d2a-1b3c4d5e6f7a", 0, 5 },
                    { "4d5e6f7a-8b9c-0d1e-2f3a-4b5c6d7e8f9a", "2a4b6c8d-0e1f-2a3b-4c5d-6e7f8a9b0c1d", 3, 10 },
                    { "5e6f7a8b-9c0d-1e2f-3a4b-5c6d7e8f9a0b", "2a4b6c8d-0e1f-2a3b-4c5d-6e7f8a9b0c1d", 4, 10 },
                    { "6f7a8b9c-0d1e-2f3a-4b5c-6d7e8f9a0b1c", "3d5e7f9a-1b2c-3d4e-5f6a-7b8c9d0e1f2a", 0, 3 },
                    { "7a8b9c0d-1e2f-3a4b-5c6d-7e8f9a0b1c2d", "4a5b6c7d-8e9f-0a1b-2c3d-4e5f6a7b8c9d", 2, 8 },
                    { "8b9c0d1e-2f3a-4b5c-6d7e-8f9a0b1c2d3e", "5c6d7e8f-9a0b-1c2d-3e4f-5a6b7c8d9e0f", 5, 1 },
                    { "9c0d1e2f-3a4b-5c6d-7e8f-9a0b1c2d3e4f", "6b7c8d9e-0f1a-2b3c-4d5e-6f7a8b9c0d1e", 0, 4 },
                    { "0d1e2f3a-4b5c-6d7e-8f9a-0b1c2d3e4f5a", "7c8d9e0f-1a2b-3c4d-5e6f-7a8b9c0d1e2f", 6, 2 }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            
        }
    }
}