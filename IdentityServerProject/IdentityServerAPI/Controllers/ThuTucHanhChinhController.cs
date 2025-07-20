using IdentityServerAPI.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace IdentityServerAPI.Controllers
{
    [Authorize] // Yêu cầu đăng nhập để xem
    [Route("api/[controller]")]
    [ApiController]
    public class ThuTucHanhChinhController : ControllerBase
    {
        private readonly IHoSoService _hoSoService;

        public ThuTucHanhChinhController(IHoSoService hoSoService)
        {
            _hoSoService = hoSoService;
        }

        [HttpGet] // GET /api/thutuchanhchinh
        public async Task<IActionResult> Get()
        {
            return await _hoSoService.GetThuTucHanhChinhAsync();
        }
    }
}