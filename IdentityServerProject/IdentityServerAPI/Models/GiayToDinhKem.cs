using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace IdentityServerAPI.Models
{
    public class GiayToDinhKem
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }
        
        public string HoSoId { get; set; } = string.Empty; // Liên kết với HoSo
        public string TenLoaiGiayTo { get; set; } = string.Empty;
        public string DuongDanTapTin { get; set; } = string.Empty; // URL hoặc đường dẫn file
    }
}