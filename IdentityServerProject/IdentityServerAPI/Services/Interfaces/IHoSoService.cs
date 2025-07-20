using IdentityServerAPI.DTOs.HoSo;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace IdentityServerAPI.Services.Interfaces
{
    public interface IHoSoService
    {
        Task<IActionResult> GetThuTucHanhChinhAsync();
        Task<IActionResult> UploadFileAsync(IFormFile file);
        Task<IActionResult> SubmitHoSoAsync(SubmitHoSoDto dto, ClaimsPrincipal user);
    }
}