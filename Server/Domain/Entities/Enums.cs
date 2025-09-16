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
        Cancelled = 3,
        Finished = 4
    }


    [JsonConverter(typeof(StringEnumConverter))]
    public enum UserStatus
    {
        Active = 1,
        Pending = 2,
        Rejected = 3
    }
    

}
