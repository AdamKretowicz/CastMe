namespace WebApi.Endpoints
{
    public static class CastingEndpoints
    {
        public const string basePath = "casting";

        public const string Create = basePath;
        public const string GetAll = basePath;
        public const string GetById = basePath + "/{id:guid}";
        public const string Update = basePath + "/{id:guid}";
        public const string Delete = basePath + "/{id:guid}";
        public const string GetByOrganiserId = basePath + "/organiser/{userId:guid}";
    }
}
