using AspNetCore.Identity.Mongo.Model;
using System;

namespace IdentityServerAPI.Models
{
    public class ApplicationUser : MongoUser<Guid>
    {
        public string FullName { get; set; } = string.Empty;
        public bool Is2FAEnabled { get; set; } = false;
    }
}
