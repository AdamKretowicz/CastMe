using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Dtos
{
    public record ModelFilterDto
    (
        int? MinAge = null,
        int? MaxAge = null,

        double? MinHeight = null,
        double? MaxHeight = null,

        double? MinWeight = null,
        double? MaxWeight = null,

        IEnumerable<string>? HairColor = null,
        IEnumerable<string>? ClothingSize = null,

        IEnumerable<string>? City = null
        );





}
