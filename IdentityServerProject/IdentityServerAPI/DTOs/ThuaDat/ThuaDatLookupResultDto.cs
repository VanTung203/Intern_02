// File: IdentityServerProject/IdentityServerAPI/DTOs/ThuaDat/ThuaDatLookupResultDto.cs

using Newtonsoft.Json;

namespace IdentityServerAPI.DTOs.ThuaDat
{
    public class ThuaDatLookupResultDto
    {
        public string SoHieuToBanDo { get; set; } = string.Empty;
        public string SoThuTuThua { get; set; } = string.Empty;
        public string DiaChi { get; set; } = string.Empty;

        // Sử dụng object để trả về cấu trúc JSON nguyên bản cho thư viện bản đồ
        [JsonProperty("geometry")]
        public object? Geometry { get; set; } 
    }
}