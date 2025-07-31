namespace IdentityServerAPI.Services.Interfaces
{
    public interface IReCaptchaService
    {
        Task<bool> IsCaptchaValidAsync(string token);
    }
}