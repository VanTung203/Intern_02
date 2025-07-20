using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace IdentityServerAPI.Models
{
    public class ThongTinThuaDat
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        public string HoSoId { get; set; } = string.Empty; // Liên kết với HoSo
        public string SoThuTuThua { get; set; } = string.Empty;
        public string SoHieuToBanDo { get; set; } = string.Empty;
        public string DiaChi { get; set; } = string.Empty;
    }
}