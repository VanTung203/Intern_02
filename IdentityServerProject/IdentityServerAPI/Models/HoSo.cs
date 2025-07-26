using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using IdentityServerAPI.Enums;

namespace IdentityServerAPI.Models
{
    public class HoSo
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        [BsonElement("SoBienNhan")]
        public string SoBienNhan { get; set; } = string.Empty;

        [BsonElement("UserId")] // ID của người dùng đã nộp hồ sơ (liên kết với ApplicationUser)
        public Guid UserId { get; set; }

        [BsonElement("NgayNopHoSo")]
        public DateTime NgayNopHoSo { get; set; } = DateTime.UtcNow;

        [BsonElement("NgayTiepNhan")]
        public DateTime? NgayTiepNhan { get; set; } // Nullable, admin sẽ cập nhật sau

        [BsonElement("NgayHenTra")]
        public DateTime? NgayHenTra { get; set; } // Nullable, admin sẽ cập nhật sau

        [BsonElement("MaThuTucHanhChinh")]
        public string MaThuTucHanhChinh { get; set; } = string.Empty;

        [BsonElement("TrangThaiHoSo")]
        public HoSoStatus TrangThaiHoSo { get; set; } = HoSoStatus.DaNop;
        
        [BsonElement("LyDoTuChoi")]
        public string? LyDoTuChoi { get; set; } // Nullable, chỉ có khi trạng thái là TuChoi
    }
}