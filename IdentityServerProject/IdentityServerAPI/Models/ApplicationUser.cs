using Microsoft.AspNetCore.Identity;
using System;

namespace IdentityServerAPI.Models
{
    public class ApplicationUser : IdentityUser<Guid>
    {
        public string FullName { get; set; } = string.Empty;
    }
}
