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
        private readonly IMongoCollection<HoSo> _hoSoCollection;
        private readonly ILogger<HoSoController> _logger;
        private readonly IHoSoService _hoSoService;

        public HoSoController(IMongoDatabase database, ILogger<HoSoController> logger, IHoSoService hoSoService)
        {
            _hoSoCollection = database.GetCollection<HoSo>("HoSo");
            _logger = logger;
            _hoSoService = hoSoService;
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
        
        [Authorize] // <<< THÊM ENDPOINT MỚI
        [HttpPost("submit")] // POST /api/hoso/submit
        public async Task<IActionResult> Submit([FromBody] SubmitHoSoDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            return await _hoSoService.SubmitHoSoAsync(dto, User);
        }
    }
}