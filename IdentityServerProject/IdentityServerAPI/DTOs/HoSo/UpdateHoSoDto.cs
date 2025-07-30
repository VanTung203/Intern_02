using System.ComponentModel.DataAnnotations;

namespace IdentityServerAPI.DTOs.HoSo
{
    public class UpdateHoSoDto
    {
        // Thông tin người nộp có thể được cập nhật
        [Required]
        public NguoiNopDonDto NguoiNopDon { get; set; }

        // Thông tin thửa đất có thể được cập nhật
        [Required]
        public ThongTinThuaDatDto ThongTinThuaDat { get; set; }

        // Danh sách giấy tờ có thể được cập nhật (thêm/xóa)
        public List<GiayToDinhKemDto> GiayToDinhKem { get; set; } = new List<GiayToDinhKemDto>();
    }
}