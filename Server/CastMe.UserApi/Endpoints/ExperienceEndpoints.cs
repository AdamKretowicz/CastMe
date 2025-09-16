namespace WebApi.Endpoints
{
    public static class ExperienceEndpoints
    {

        public const string GetExperiencesByUserId = "/{userId}";
        public const string AddExperience = "/{userId}/add";
        public const string UpdateExperience = "/{userId}/update";
        public const string DeleteExperience = "/{userId}/delete/{experienceId}";
    }
}
