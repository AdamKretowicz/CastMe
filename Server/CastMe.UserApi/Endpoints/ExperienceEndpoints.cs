namespace WebApi.Endpoints
{
    public static class ExperienceEndpoints
    {
        public const string basePath = "/experience";

        public const string GetExperiencesByUserId = basePath + "/{userId}";
        public const string GetAllExperiencesByUserId = basePath + "all/{userId}";
        public const string AddExperience = basePath + "/{userId}/add";
        public const string UpdateExperience = basePath + "/{userId}/update/{experienceId}";
        public const string DeleteExperience = basePath + "/{userId}/delete/{experienceId}";
    }
}
