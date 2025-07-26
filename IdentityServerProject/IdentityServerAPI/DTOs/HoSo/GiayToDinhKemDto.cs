using System.ComponentModel.DataAnnotations;

namespace IdentityServerAPI.DTOs.HoSo
{
    public class GiayToDinhKemDto
    {
        [Required]
        public string TenLoaiGiayTo { get; set; } = string.Empty;
        [Required]
        public string DuongDanTapTin { get; set; } = string.Empty;
        public string? FileName { get; set; }
    }
}