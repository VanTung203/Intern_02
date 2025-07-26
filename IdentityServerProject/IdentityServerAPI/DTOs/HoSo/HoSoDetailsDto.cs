// File: IdentityServerProject/IdentityServerAPI/DTOs/HoSo/HoSoDetailsDto.cs
// Mục đích: Định nghĩa cấu trúc dữ liệu trả về khi tra cứu chi tiết hồ sơ.

using IdentityServerAPI.Enums;

namespace IdentityServerAPI.DTOs.HoSo
{
    // DTO này kế thừa từ các DTO đã có để tái sử dụng
    public class HoSoDetailsDto
    {
        public string SoBienNhan { get; set; } = string.Empty;
        public DateTime NgayNopHoSo { get; set; }
        public DateTime? NgayTiepNhan { get; set; }
        public DateTime? NgayHenTra { get; set; }
        public HoSoStatus TrangThaiHoSo { get; set; }
        public string TenTrangThaiHoSo { get; set; } = string.Empty; // Thêm tên trạng thái cho dễ hiển thị
        public string? LyDoTuChoi { get; set; }
        public string TenThuTucHanhChinh { get; set; } = string.Empty; // Thêm tên thủ tục

        public NguoiNopDonDto NguoiNopDon { get; set; } = new();
        public ThongTinThuaDatDto ThongTinThuaDat { get; set; } = new();
        public List<GiayToDinhKemDto> GiayToDinhKem { get; set; } = new();
    }
}