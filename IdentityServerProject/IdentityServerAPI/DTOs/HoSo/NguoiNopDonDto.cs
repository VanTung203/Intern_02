// IdentityServerProject/IdentityServerAPI/DTOs/HoSo/NguoiNopDonDto.cs

using System.ComponentModel.DataAnnotations;

namespace IdentityServerAPI.DTOs.HoSo
{
    public class NguoiNopDonDto
    {
        [Required(ErrorMessage = "Họ tên là bắt buộc.")]
        [StringLength(100, ErrorMessage = "Họ tên không được vượt quá 100 ký tự.")]
        public string HoTen { get; set; } = string.Empty;

        public int GioiTinh { get; set; }
        
        public DateTime? NgaySinh { get; set; }
        
        public int? NamSinh { get; set; }

        [Required(ErrorMessage = "Số CCCD là bắt buộc.")]
        [StringLength(12, MinimumLength = 12, ErrorMessage = "Số CCCD phải có đúng 12 ký tự.")]
        [RegularExpression("^[0-9]*$", ErrorMessage = "Số CCCD chỉ được chứa ký tự số.")]
        public string SoCCCD { get; set; } = string.Empty;

        [StringLength(250, ErrorMessage = "Địa chỉ không được vượt quá 250 ký tự.")]
        public string? DiaChi { get; set; }

        [Required(ErrorMessage = "Số điện thoại là bắt buộc.")] // 10 hoặc 11 chữ số
        [RegularExpression(@"^0[0-9]{9,10}$", ErrorMessage = "Số điện thoại phải bắt đầu bằng 0 và có 10 hoặc 11 chữ số.")]
        public string SoDienThoai { get; set; } = string.Empty;
        
        [EmailAddress(ErrorMessage = "Định dạng email không hợp lệ.")]
        [StringLength(100, ErrorMessage = "Email không được vượt quá 100 ký tự.")]
        public string? Email { get; set; }
    }
}