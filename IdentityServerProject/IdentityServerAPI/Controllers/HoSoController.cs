using IdentityServerAPI.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;

namespace IdentityServerAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class HoSoController : ControllerBase
    {
        private readonly IMongoCollection<HoSo> _hoSoCollection;
        private readonly ILogger<HoSoController> _logger;

        public HoSoController(IMongoDatabase database, ILogger<HoSoController> logger)
        {
            _hoSoCollection = database.GetCollection<HoSo>("HoSo");
            _logger = logger;
        }

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
                var hoSo = await _hoSoCollection.Find(h => h.SoBienNhan.ToLower() == receiptNumber.Trim().ToLower()).FirstOrDefaultAsync();

                if (hoSo == null)
                {
                    return NotFound(new { message = "Không tìm thấy hồ sơ với số biên nhận này." });
                }

                return Ok(hoSo);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during ho so lookup for receipt number {ReceiptNumber}", receiptNumber);
                return StatusCode(500, new { message = "Đã có lỗi xảy ra trong quá trình tra cứu." });
            }
        }
        
        // Các API khác cho việc nộp hồ sơ, xem chi tiết... sẽ được thêm vào đây sau.
        // [Authorize]
        // [HttpPost("submit")]
        // public async Task<IActionResult> SubmitHoSo...
    }
}