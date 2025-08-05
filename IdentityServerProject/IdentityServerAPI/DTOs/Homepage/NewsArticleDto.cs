namespace IdentityServerAPI.DTOs.Homepage
{
    public class NewsArticleDto
    {
        public string? Id { get; set; }
        public string TieuDe { get; set; } = string.Empty;
        public string MoTaNgan { get; set; } = string.Empty;
        // public string? AnhDaiDienUrl { get; set; }
        public DateTime NgayDang { get; set; }
    }
}