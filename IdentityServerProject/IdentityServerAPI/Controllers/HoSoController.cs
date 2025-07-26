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
        [HttpGet("details")] // GET /api/hoso/details?receiptNumber=xxxx&cccd=yyyy
        public async Task<IActionResult> GetDetails([FromQuery] string receiptNumber, [FromQuery] string cccd)
        {
            if (string.IsNullOrWhiteSpace(receiptNumber) || string.IsNullOrWhiteSpace(cccd))
            {
                return BadRequest(new { message = "Vui lòng nhập đầy đủ Số biên nhận và Số CCCD." });
            }

            try
            {
                var result = await _hoSoService.GetHoSoDetailsAsync(receiptNumber, cccd);
                if (result == null)
                {
                    // Trả về thông báo chung để bảo mật, không tiết lộ thông tin nào đúng/sai
                    return NotFound(new { message = "Không tìm thấy hồ sơ. Vui lòng kiểm tra lại Số biên nhận và Số CCCD." });
                }
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi tra cứu chi tiết hồ sơ {ReceiptNumber}", receiptNumber);
                return StatusCode(500, new { message = "Đã có lỗi xảy ra trên máy chủ." });
            }
        }
    }
}