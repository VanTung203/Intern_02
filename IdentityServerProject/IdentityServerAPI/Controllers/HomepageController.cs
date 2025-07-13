using IdentityServerAPI.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace IdentityServerAPI.Controllers
{
    [AllowAnonymous] // Mọi người đều có thể truy cập
    [Route("api/[controller]")]
    [ApiController]
    public class HomepageController : ControllerBase
    {
        private readonly IHomepageService _homepageService;

        public HomepageController(IHomepageService homepageService)
        {
            _homepageService = homepageService;
        }

        [HttpGet("statistics")] // GET /api/homepage/statistics
        public async Task<IActionResult> GetStatistics()
        {
            return await _homepageService.GetHomepageStatisticsAsync();
        }

        [HttpGet("news")] // GET /api/homepage/news?limit=9
        public async Task<IActionResult> GetNews([FromQuery] int limit = 9)
        {
            return await _homepageService.GetRecentNewsAsync(limit);
        }

        [HttpGet("legal-documents")] // GET /api/homepage/legal-documents?limit=5
        public async Task<IActionResult> GetLegalDocuments([FromQuery] int limit = 5)
        {
            return await _homepageService.GetRecentLegalDocumentsAsync(limit);
        }
    }
}