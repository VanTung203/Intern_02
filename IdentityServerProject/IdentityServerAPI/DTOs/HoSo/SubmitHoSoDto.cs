using System.ComponentModel.DataAnnotations;

namespace IdentityServerAPI.DTOs.HoSo
{
    public class SubmitHoSoDto
    {
        [Required]
        public string MaThuTucHanhChinh { get; set; } = string.Empty;

        [Required]
        public NguoiNopDonDto NguoiNopDon { get; set; }

        [Required]
        public ThongTinThuaDatDto ThongTinThuaDat { get; set; }

        public List<GiayToDinhKemDto> GiayToDinhKem { get; set; } = new List<GiayToDinhKemDto>();
    }
}