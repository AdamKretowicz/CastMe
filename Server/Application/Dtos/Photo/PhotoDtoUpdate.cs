using CastMe.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Dtos.Photo
{
    public class PhotoDtoUpdate
    {
        public Guid Id { get; set; }
        public bool IsActive { get; set;} = false;

        public PhotoStatus PhotoStatus { get; set; } = PhotoStatus.Pending;


    }
}
