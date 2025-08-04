// File: IdentityServerProject/IdentityServerAPI/Services/Interfaces/IThuaDatService.cs

using IdentityServerAPI.DTOs.ThuaDat;
using System.Threading.Tasks;

namespace IdentityServerAPI.Services.Interfaces
{
    public interface IThuaDatService
    {
        Task<ThuaDatLookupResultDto?> GetThuaDatAsync(string soTo, string soThua);
    }
}