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
        Task<HoSoDetailsDto?> GetHoSoDetailsAsync(string receiptNumber, string? cccd, ClaimsPrincipal? user = null);
        Task<HoSoLookupResultDto?> LookupHoSoByReceiptNumberAsync(string receiptNumber);
        Task<IActionResult> GetMySubmissionsAsync(ClaimsPrincipal user);
        Task<IActionResult> UpdateHoSoAsync(string soBienNhan, UpdateHoSoDto dto, ClaimsPrincipal user);
    }
}