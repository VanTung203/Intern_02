using System.Text.Json;
using IdentityServerAPI.Services.Interfaces;

namespace IdentityServerAPI.Services
{
    public class ReCaptchaService : IReCaptchaService
    {
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _configuration;
        private readonly ILogger<ReCaptchaService> _logger;

        public ReCaptchaService(HttpClient httpClient, IConfiguration configuration, ILogger<ReCaptchaService> logger)
        {
            _httpClient = httpClient;
            _configuration = configuration;
            _logger = logger;
        }

        public async Task<bool> IsCaptchaValidAsync(string token)
        {
            if (string.IsNullOrEmpty(token))
            {
                return false;
            }
            
            try
            {
                var secretKey = _configuration["ReCaptchaSettings:SecretKey"];
                var content = new FormUrlEncodedContent(new Dictionary<string, string>
                {
                    {"secret", secretKey},
                    {"response", token}
                });

                var response = await _httpClient.PostAsync("https://www.google.com/recaptcha/api/siteverify", content);
                response.EnsureSuccessStatusCode();

                var jsonResponse = await response.Content.ReadAsStringAsync();
                var siteVerifyResponse = JsonSerializer.Deserialize<JsonElement>(jsonResponse);

                var success = siteVerifyResponse.GetProperty("success").GetBoolean();
                if (!success)
                {
                    var errorCodes = siteVerifyResponse.TryGetProperty("error-codes", out var errors) ? errors.ToString() : "N/A";
                    _logger.LogWarning("reCAPTCHA verification failed. Error codes: {ErrorCodes}", errorCodes);
                }

                return success;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Exception occurred during reCAPTCHA verification.");
                return false;
            }
        }
    }
}