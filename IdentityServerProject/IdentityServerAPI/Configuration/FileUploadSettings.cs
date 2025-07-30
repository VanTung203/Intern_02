namespace IdentityServerAPI.Configuration
{
    public class FileUploadSettings
    {
        public List<string> AllowedExtensions { get; set; } = new List<string>();
        public long MaxSizeInBytes { get; set; } = 5 * 1024 * 1024; // Mặc định 5MB
    }
}