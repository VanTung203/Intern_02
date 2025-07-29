using System.ComponentModel.DataAnnotations;

namespace IdentityServerAPI.DTOs.HoSo
{
    public class NguoiNopDonDto
    {
        [Required]
        public string HoTen { get; set; } = string.Empty;
        public int GioiTinh { get; set; }
        public DateTime? NgaySinh { get; set; }
        public int? NamSinh { get; set; }
        [Required]
        public string SoCCCD { get; set; } = string.Empty;
        public string? DiaChi { get; set; }
        [Required]
        public string SoDienThoai { get; set; } = string.Empty;
        // [Required]
        [EmailAddress]
        public string? Email { get; set; }
    }
}