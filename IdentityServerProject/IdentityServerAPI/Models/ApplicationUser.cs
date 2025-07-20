// IdentityServerAPI/Models/ApplicationUser.cs
using AspNetCore.Identity.MongoDbCore.Models;

namespace IdentityServerAPI.Models
{
    // Kế thừa từ MongoIdentityUser và sử dụng Guid làm kiểu khóa
    public class ApplicationUser : MongoIdentityUser<Guid>
    {
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string? AvatarUrl { get; set; }
        public string? Province { get; set; }
        public string? District { get; set; }
        public string? Ward { get; set; }
        public string? StreetAddress { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}