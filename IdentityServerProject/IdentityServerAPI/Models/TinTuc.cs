using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace IdentityServerAPI.Models
{
    public class TinTuc
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        [BsonElement("TieuDe")]
        public string TieuDe { get; set; } = string.Empty;

        [BsonElement("MoTaNgan")]
        public string MoTaNgan { get; set; } = string.Empty;

        [BsonElement("NoiDung")]
        public string NoiDung { get; set; } = string.Empty;

        [BsonElement("AnhDaiDienUrl")]
        public string? AnhDaiDienUrl { get; set; }

        [BsonElement("NgayDang")]
        public DateTime NgayDang { get; set; } = DateTime.UtcNow;
    }
}