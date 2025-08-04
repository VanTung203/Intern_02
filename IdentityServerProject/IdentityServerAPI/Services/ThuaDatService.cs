// File: IdentityServerProject/IdentityServerAPI/Services/ThuaDatService.cs

using IdentityServerAPI.DTOs.ThuaDat;
using IdentityServerAPI.Models;
using IdentityServerAPI.Services.Interfaces;
using MongoDB.Driver;
using System.Threading.Tasks;

namespace IdentityServerAPI.Services
{
    public class ThuaDatService : IThuaDatService
    {
        private readonly IMongoCollection<ThongTinThuaDat> _thuaDatCollection;

        public ThuaDatService(IMongoDatabase database)
        {
            _thuaDatCollection = database.GetCollection<ThongTinThuaDat>("ThongTinThuaDat");
        }

        public async Task<ThuaDatLookupResultDto?> GetThuaDatAsync(string soTo, string soThua)
        {
            var filter = Builders<ThongTinThuaDat>.Filter.And(
                Builders<ThongTinThuaDat>.Filter.Eq(x => x.SoHieuToBanDo, soTo),
                Builders<ThongTinThuaDat>.Filter.Eq(x => x.SoThuTuThua, soThua)
            );

            // Tìm kiếm thửa đất đầu tiên khớp
            var thuaDat = await _thuaDatCollection.Find(filter).FirstOrDefaultAsync();

            if (thuaDat == null)
            {
                return null;
            }

            // Map từ Model sang DTO
            return new ThuaDatLookupResultDto
            {
                SoHieuToBanDo = thuaDat.SoHieuToBanDo,
                SoThuTuThua = thuaDat.SoThuTuThua,
                DiaChi = thuaDat.DiaChi,
                Geometry = thuaDat.Geometry // Trả về đối tượng geometry nguyên bản
            };
        }
    }
}