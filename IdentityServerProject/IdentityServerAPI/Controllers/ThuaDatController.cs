// File: IdentityServerProject/IdentityServerAPI/Controllers/ThuaDatController.cs

using IdentityServerAPI.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace IdentityServerAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ThuaDatController : ControllerBase
    {
        private readonly IThuaDatService _thuaDatService;

        public ThuaDatController(IThuaDatService thuaDatService)
        {
            _thuaDatService = thuaDatService;
        }

        [HttpGet("lookup")]
        public async Task<IActionResult> LookupThuaDat([FromQuery] string soTo, [FromQuery] string soThua)
        {
            if (string.IsNullOrWhiteSpace(soTo) || string.IsNullOrWhiteSpace(soThua))
            {
                return BadRequest("Vui lòng cung cấp đầy đủ Số tờ bản đồ và Số thứ tự thửa.");
            }

            var result = await _thuaDatService.GetThuaDatAsync(soTo, soThua);

            if (result == null)
            {
                return NotFound("Không tìm thấy thông tin thửa đất bạn yêu cầu.");
            }

            // Kiểm tra xem thửa đất có dữ liệu hình thể không
            if (result.Geometry == null)
            {
                return NotFound("Thửa đất được tìm thấy nhưng không có dữ liệu hình thể để hiển thị trên bản đồ.");
            }

            return Ok(result);
        }
    }
}