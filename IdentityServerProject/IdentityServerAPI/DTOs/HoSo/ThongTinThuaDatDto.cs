// IdentityServerProject/IdentityServerAPI/DTOs/HoSo/ThongTinThuaDatDto.cs

using System.ComponentModel.DataAnnotations;

namespace IdentityServerAPI.DTOs.HoSo
{
    public class ThongTinThuaDatDto
    {
        [Required(ErrorMessage = "Số thứ tự thửa là bắt buộc.")]
        [RegularExpression("^[0-9]*$", ErrorMessage = "Số thứ tự thửa chỉ được chứa ký tự số.")]
        [StringLength(10, ErrorMessage = "Số thứ tự thửa không quá 10 ký tự.")]
        public string SoThuTuThua { get; set; } = string.Empty;

        [Required(ErrorMessage = "Số hiệu tờ bản đồ là bắt buộc.")]
        [RegularExpression("^[0-9]*$", ErrorMessage = "Số hiệu tờ bản đồ chỉ được chứa ký tự số.")]
        [StringLength(10, ErrorMessage = "Số hiệu tờ bản đồ không quá 10 ký tự.")]
        public string SoHieuToBanDo { get; set; } = string.Empty;
        
        [StringLength(250, ErrorMessage = "Địa chỉ không được vượt quá 250 ký tự.")]
        public string? DiaChi { get; set; } 
    }
}