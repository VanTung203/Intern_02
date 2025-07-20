using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace IdentityServerAPI.Models
{
    public class NguoiNopDon
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        public string HoSoId { get; set; } = string.Empty; // Liên kết với HoSo
        public string HoTen { get; set; } = string.Empty;
        public int GioiTinh { get; set; } // 1: Nam, 2: Nữ, 0: Khác
        public DateTime? NgaySinh { get; set; }
        public int? NamSinh { get; set; }
        public string SoCCCD { get; set; } = string.Empty;
        public string DiaChi { get; set; } = string.Empty;
        public string SoDienThoai { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
    }
}