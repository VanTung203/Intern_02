using IdentityServerAPI.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace IdentityServerAPI.Controllers
{
    [Authorize] // Yêu cầu đăng nhập để upload
    [Route("api/[controller]")]
    [ApiController]
    public class FileController : ControllerBase
    {
        private readonly IHoSoService _hoSoService;

        public FileController(IHoSoService hoSoService)
        {
            _hoSoService = hoSoService;
        }

        [HttpPost("upload")] // POST /api/file/upload
        public async Task<IActionResult> Upload(IFormFile file)
        {
            return await _hoSoService.UploadFileAsync(file);
        }
    }
}