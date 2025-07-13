namespace IdentityServerAPI.DTOs.Homepage
{
    public class LegalDocumentDto
    {
        public string? Id { get; set; }
        public string TieuDe { get; set; } = string.Empty;
        public string SoHieuVanBan { get; set; } = string.Empty;
        public DateTime NgayBanHanh { get; set; }
    }
}