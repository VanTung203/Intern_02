using IdentityServerAPI.DTOs.HoSo;
using IdentityServerAPI.Models;
using IdentityServerAPI.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;

namespace IdentityServerAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class HoSoController : ControllerBase
    {
        // Xóa _hoSoCollection vì logic đã được chuyển hết vào Service
        // private readonly IMongoCollection<HoSo> _hoSoCollection;
        private readonly ILogger<HoSoController> _logger;
        private readonly IHoSoService _hoSoService;

        public HoSoController(ILogger<HoSoController> logger, IHoSoService hoSoService)
        {
            // _hoSoCollection = database.GetCollection<HoSo>("HoSo");
            _logger = logger;
            _hoSoService = hoSoService;
        }

        // Endpoints cập nhật hồ sơ
        [Authorize]
        [HttpGet("my-submissions")] // GET /api/hoso/my-submissions
        public async Task<IActionResult> GetMySubmissions()
        {
            return await _hoSoService.GetMySubmissionsAsync(User);
        }

        [Authorize]
        [HttpPut("update/{soBienNhan}")] // PUT /api/hoso/update/HS0001
        public async Task<IActionResult> Update(string soBienNhan, [FromBody] UpdateHoSoDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            return await _hoSoService.UpdateHoSoAsync(soBienNhan, dto, User);
        }

        // Endpoint tra cứu nhanh thông tin hồ sơ
        [AllowAnonymous]
        [HttpGet("lookup")] // GET /api/hoso/lookup?receiptNumber=xxxx
        public async Task<IActionResult> LookupByReceiptNumber([FromQuery] string receiptNumber)
        {
            if (string.IsNullOrWhiteSpace(receiptNumber))
            {
                return BadRequest(new { message = "Vui lòng nhập số biên nhận." });
            }

            try
            {
                var result = await _hoSoService.LookupHoSoByReceiptNumberAsync(receiptNumber);

                if (result == null)
                {
                    return NotFound(new { message = "Không tìm thấy hồ sơ với số biên nhận này." });
                }

                // Trả về DTO đã được xử lý, chứa trạng thái dạng chữ
                return Ok(result); 
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during ho so lookup for receipt number {ReceiptNumber}", receiptNumber);
                return StatusCode(500, new { message = "Đã có lỗi xảy ra trong quá trình tra cứu." });
            }
        }

        [Authorize]
        [HttpPost("submit")] // POST /api/hoso/submit
        public async Task<IActionResult> Submit([FromBody] SubmitHoSoDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            return await _hoSoService.SubmitHoSoAsync(dto, User);
        }
        
        // Thêm endpoint tra cứu thông tin hồ sơ
        [AllowAnonymous]
        [HttpGet("details")]
        public async Task<IActionResult> GetDetails([FromQuery] string receiptNumber, [FromQuery] string? cccd)
        {
            if (string.IsNullOrWhiteSpace(receiptNumber))
            {
                return BadRequest(new { message = "Vui lòng nhập Số biên nhận." });
            }

            // Nếu người dùng chưa đăng nhập VÀ không cung cấp CCCD -> lỗi
            if (!User.Identity.IsAuthenticated && string.IsNullOrEmpty(cccd))
            {
                return BadRequest(new { message = "Vui lòng cung cấp Số CCCD để tra cứu." });
            }

            var result = await _hoSoService.GetHoSoDetailsAsync(receiptNumber, cccd, User);

            if (result == null)
            {
                return NotFound(new { message = "Không tìm thấy hồ sơ hoặc bạn không có quyền truy cập." });
            }
            return Ok(result);
        }
    }
}