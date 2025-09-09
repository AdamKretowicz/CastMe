using Newtonsoft.Json;
using Newtonsoft.Json.Converters;

namespace CastMe.Domain.Entities
{
    public enum Gender
    {
        Male = 1,
        Female = 2,
        Other = 3
    }

    [JsonConverter(typeof(StringEnumConverter))]
    public enum CastingRoleType
    {
        Model = 1,
        Photographer = 2,
        Designer = 3,
        Volunteer = 4
    }


    [JsonConverter(typeof(StringEnumConverter))]
    public enum CastingStatus
    {
        Active = 1,
        Closed = 2,
        Cancelled = 3
    }


    [JsonConverter(typeof(StringEnumConverter))]
    public enum UserStatus
    {
        Active = 1,
        Pending = 2,
        Rejected = 3
    }
    [JsonConverter(typeof(StringEnumConverter))]
    public enum PermissionAction
    {
        Create = 1,
        Read = 2,
        Update = 3,
        Delete = 4,
        View  = 5,
        Apply = 6,
        Manage = 7,
        Export = 8,
        Upload = 9,
        Assist = 10
    }

    public enum ResourceType
    {
        Casting = 1 ,
        Profile = 2,
        Photo = 3,
        User = 4,
        Project = 5,
        Event = 6,
        Data = 7
    }


}
