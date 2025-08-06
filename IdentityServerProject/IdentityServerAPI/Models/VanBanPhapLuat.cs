using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace IdentityServerAPI.Models
{
    public class VanBanPhapLuat
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        [BsonElement("TieuDe")]
        public string TieuDe { get; set; } = string.Empty;

        [BsonElement("NoiDungVanBan")]
        public string NoiDungVanBan { get; set; } = string.Empty;

        [BsonElement("SoHieuVanBan")]
        public string SoHieuVanBan { get; set; } = string.Empty;

        [BsonElement("NgayBanHanh")]
        public DateTime NgayBanHanh { get; set; }

        // [BsonElement("LinkTaiVe")]
        // public string? LinkTaiVe { get; set; }
    }
}