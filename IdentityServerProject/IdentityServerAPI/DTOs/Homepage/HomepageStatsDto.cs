// IdentityServerProject/IdentityServerAPI/DTOs/Homepage/HomepageStatsDto.cs
// Mục đích: Chứa 4 chỉ số thống kê mới cho trang chủ.
namespace IdentityServerAPI.DTOs.Homepage
{
    public class HomepageStatsDto
    {
        public long TongSoHoSo { get; set; }
        public long SoHoSoChoTiepNhan { get; set; }
        public long SoHoSoDangThuLy { get; set; }
        public long SoHoSoDaTra { get; set; }
    }
}