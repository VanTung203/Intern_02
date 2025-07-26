// IdentityServerProject/IdentityServerAPI/DTOs/HoSo/HoSoLookupResultDto.cs
// Mục đích: Định nghĩa cấu trúc dữ liệu trả về cho chức năng tra cứu nhanh.

namespace IdentityServerAPI.DTOs.HoSo
{
    public class HoSoLookupResultDto
    {
        public string SoBienNhan { get; set; } = string.Empty;
        public string TenTrangThaiHoSo { get; set; } = string.Empty; // Trạng thái dạng chữ
        public DateTime NgayNopHoSo { get; set; }
    }
}