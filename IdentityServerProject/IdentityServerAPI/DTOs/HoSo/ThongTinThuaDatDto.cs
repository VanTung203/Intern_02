using System.ComponentModel.DataAnnotations;

namespace IdentityServerAPI.DTOs.HoSo
{
    public class ThongTinThuaDatDto
    {
        [Required]
        public string SoThuTuThua { get; set; } = string.Empty;
        [Required]
        public string SoHieuToBanDo { get; set; } = string.Empty;
        public string? DiaChi { get; set; } 
    }
}