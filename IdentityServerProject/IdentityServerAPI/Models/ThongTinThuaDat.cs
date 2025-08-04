// File: IdentityServerProject/IdentityServerAPI/Models/ThongTinThuaDat.cs

using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
// Thêm namespace này để làm việc với các kiểu dữ liệu GeoJSON của MongoDB
using MongoDB.Driver.GeoJsonObjectModel; 

namespace IdentityServerAPI.Models
{
    public class ThongTinThuaDat
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        public string HoSoId { get; set; } = string.Empty;
        public string SoThuTuThua { get; set; } = string.Empty;
        public string SoHieuToBanDo { get; set; } = string.Empty;
        public string DiaChi { get; set; } = string.Empty;
        
        // --- THÊM TRƯỜNG MỚI ---
        // Sử dụng kiểu GeoJsonPolygon<GeoJson2DCoordinates> để map chính xác
        // với cấu trúc Polygon GeoJSON trong MongoDB.
        public GeoJsonPolygon<GeoJson2DCoordinates>? Geometry { get; set; }
    }
}