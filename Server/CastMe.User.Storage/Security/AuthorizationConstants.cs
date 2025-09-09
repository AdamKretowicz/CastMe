using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure.Security
{
    public static class Actions
    {
        public const string Create = "Create";
        public const string Read = "Read";
        public const string Update = "Update";
        public const string Delete = "Delete";
        public const string View = "View";
        public const string Apply = "Apply";
        public const string Manage = "Manage";
        public const string Export = "Export";
        public const string Upload = "Upload";
        public const string Assist = "Assist";
    }

    public static class Resources
    {
        public const string Casting = "Casting";
        public const string AllCastings = "AllCastings";
        public const string PublicCastings = "PublicCastings";
        public const string Profile = "Profile";
        public const string OwnProfile = "OwnProfile";
        public const string AllProfiles = "AllProfiles";
        public const string ModelProfiles = "ModelProfiles";
        public const string PublicProfiles = "PublicProfiles";
        public const string Photo = "Photo";
        public const string OwnPhotos = "OwnPhotos";
        public const string Users = "Users";
        public const string Project = "Project";
        public const string OwnProject = "OwnProject";
        public const string Events = "Events";
        public const string Data = "Data";
    }

    public static class Roles
    {
        public const string Organizer = "Organizer";
        public const string Model = "Model";
        public const string Designer = "Designer";
        public const string Volunteer = "Volunteer";
        public const string Guest = "Guest";
    }
}
