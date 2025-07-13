using IdentityServerAPI.DTOs.Homepage;
using Microsoft.AspNetCore.Mvc;

namespace IdentityServerAPI.Services.Interfaces
{
    public interface IHomepageService
    {
        Task<IActionResult> GetHomepageStatisticsAsync();
        Task<IActionResult> GetRecentNewsAsync(int limit);
        Task<IActionResult> GetRecentLegalDocumentsAsync(int limit);
    }
}