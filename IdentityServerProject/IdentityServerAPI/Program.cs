// Program.cs
using System.Net;
using Microsoft.Extensions.Options;
using MongoDB.Driver;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using IdentityServerAPI.Models;
using IdentityServerAPI.Enums;
using IdentityServerAPI.Configuration;
// using IdentityServerAPI.Repositories;
using IdentityServerAPI.Services;
using IdentityServerAPI.Services.Interfaces;
using Microsoft.OpenApi.Models;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.FileProviders;
using Ganss.Xss;

var builder = WebApplication.CreateBuilder(args);

// --- 1. Đăng ký các lớp cấu hình (Settings) ---
builder.Services.Configure<MongoSettings>(builder.Configuration.GetSection("MongoSettings"));
builder.Services.Configure<EmailSettings>(builder.Configuration.GetSection("EmailSettings"));
builder.Services.Configure<JwtSettings>(builder.Configuration.GetSection("JwtSettings"));
builder.Services.Configure<FileUploadSettings>(builder.Configuration.GetSection("FileUploadSettings"));

// --- 2. Cấu hình và đăng ký MongoDB Client và Database ---
builder.Services.AddSingleton<IMongoClient>(sp =>
{
    var settings = sp.GetRequiredService<IOptions<MongoSettings>>().Value;
    if (string.IsNullOrEmpty(settings.ConnectionString))
    {
        throw new InvalidOperationException("MongoDB ConnectionString is not configured in MongoSettings.");
    }
    return new MongoClient(settings.ConnectionString);
});

builder.Services.AddSingleton<IMongoDatabase>(sp =>
{
    var settings = sp.GetRequiredService<IOptions<MongoSettings>>().Value;
    var client = sp.GetRequiredService<IMongoClient>();
    if (string.IsNullOrEmpty(settings.DatabaseName))
    {
        throw new InvalidOperationException("MongoDB DatabaseName is not configured in MongoSettings.");
    }
    return client.GetDatabase(settings.DatabaseName);
});

// // --- 3. Đăng ký UserStore và RoleStore ---
// builder.Services.AddScoped<IUserStore<ApplicationUser>, UserStore>();
// builder.Services.AddScoped<IRoleStore<ApplicationRole>, RoleStore>();

// --- 4. Cấu hình ASP.NET Core Identity ---
builder.Services.AddIdentity<ApplicationUser, ApplicationRole>(options =>
    {
        options.Password.RequireDigit = true;
        options.Password.RequireLowercase = true;
        options.Password.RequireUppercase = true;
        options.Password.RequireNonAlphanumeric = false;
        options.Password.RequiredLength = 6;
        options.SignIn.RequireConfirmedEmail = true;
        // options.User.RequireUniqueEmail = true;

        // >>> THAY ĐỔI QUAN TRỌNG: SỬ DỤNG EMAILTOKENPROVIDER CHO RESET MẬT KHẨU <<<
        // EmailTokenProvider sẽ tạo ra mã OTP 6 số.
        options.Tokens.PasswordResetTokenProvider = TokenOptions.DefaultEmailProvider; // "Email"
        // Mặc định, token từ EmailTokenProvider (là một dạng TOTP) có thời gian sống ngắn (khoảng 3 phút).
        // Điều này phù hợp với OTP.
    })
    .AddMongoDbStores<ApplicationUser, ApplicationRole, Guid>(
        builder.Configuration.GetValue<string>("MongoSettings:ConnectionString"),
        builder.Configuration.GetValue<string>("MongoSettings:DatabaseName") // Lấy tên DB từ cấu hình
    )
    .AddDefaultTokenProviders(); // Đảm bảo dòng này vẫn còn. Nó đăng ký EmailTokenProvider với tên "Email".

// --- 5. Đăng ký các Services ---
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddScoped<IAuthService, AuthService>(); // AuthService là nơi logic chính
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IHomepageService, HomepageService>();
builder.Services.AddScoped<IHoSoService, HoSoService>();
builder.Services.AddScoped<IThuaDatService, ThuaDatService>();

builder.Services.AddHttpClient<IReCaptchaService, ReCaptchaService>()
    .ConfigureHttpClient(client =>
    {
        client.Timeout = TimeSpan.FromSeconds(20);
    });
// builder.Services.AddHttpClient<IReCaptchaService, ReCaptchaService>();
// Comment do bị lỗi Timeout
// builder.Services.AddScoped<IReCaptchaService, ReCaptchaService>();

builder.Services.AddHttpContextAccessor(); 

// --- 6. Cấu hình JWT Authentication và thêm GOOGLE Authentication ---
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    var jwtSettings = builder.Configuration.GetSection("JwtSettings").Get<JwtSettings>();
    if (jwtSettings == null || string.IsNullOrEmpty(jwtSettings.SecretKey) || string.IsNullOrEmpty(jwtSettings.Issuer) || string.IsNullOrEmpty(jwtSettings.Audience))
    {
        throw new InvalidOperationException("JWT settings (SecretKey, Issuer, Audience) are not properly configured.");
    }
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings.Issuer,
        ValidAudience = jwtSettings.Audience,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings.SecretKey))
    };
})
.AddGoogle(googleOptions =>
{
    var googleAuthSettings = builder.Configuration.GetSection("GoogleAuthSettings");
    var clientId = googleAuthSettings["ClientId"];
    var clientSecret = googleAuthSettings["ClientSecret"];

    if (string.IsNullOrEmpty(clientId) || string.IsNullOrEmpty(clientSecret))
    {
        throw new InvalidOperationException("Google ClientId and ClientSecret are not configured in appsettings.json.");
    }

    googleOptions.ClientId = clientId;
    googleOptions.ClientSecret = clientSecret;
    // Tích hợp với hệ thống Identity có sẵn
    googleOptions.SignInScheme = IdentityConstants.ExternalScheme;
});

// --- Thêm các dịch vụ cần thiết khác ---
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "IdentityServerAPI", Version = "v1" });
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "JWT Authorization header. \nPlease enter your token in the text input below. \n\nExample: \"12345abcdef\"",
    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement()
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                },
            },
            new List<string>()
        }
    });
});

// Cấu hình Dependency Injection cho HtmlSanitizer
builder.Services.AddSingleton<IHtmlSanitizer>(s =>
{
    // Khởi tạo sanitizer như bình thường
    var sanitizer = new HtmlSanitizer();

    // XÓA TẤT CẢ CÁC THẺ HTML ĐƯỢC PHÉP.
    // Bằng cách này, sanitizer sẽ loại bỏ mọi thẻ và chỉ giữ lại nội dung văn bản bên trong.
    sanitizer.AllowedTags.Clear();

    // Trả về sanitizer đã được cấu hình
    return sanitizer;
});

// Cấu hình CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontendOrigin",
        policyBuilder =>
        {
            var frontendUrl = builder.Configuration["FrontendUrl"] ?? "http://localhost:3000";
            var origins = new List<string> { frontendUrl };

            // Nếu đang ở môi trường Development, cho phép cả các URL của Swagger
            if (builder.Environment.IsDevelopment())
            {
                // Lấy các URL từ launchSettings.json để thêm vào
                var launchSettings = builder.Configuration.GetSection("profiles:IdentityServerAPI:applicationUrl").Value;
                if (!string.IsNullOrEmpty(launchSettings))
                {
                    origins.AddRange(launchSettings.Split(';').Select(url => url.TrimEnd('/')));
                }
            }
            
            // Thêm AllowAnyOrigin() nếu đang ở môi trường Development cho chắc chắn
            if (builder.Environment.IsDevelopment())
            {
                policyBuilder.AllowAnyOrigin()
                             .AllowAnyHeader()
                             .AllowAnyMethod();
            }
            else
            {
                // Giữ lại cấu hình cũ cho môi trường Production
                policyBuilder.WithOrigins(origins.ToArray())
                             .AllowAnyHeader()
                             .AllowAnyMethod();
            }
        });
});

// Cấu hình Kestrel
builder.WebHost.ConfigureKestrel(options =>
{
    var httpPortEnv = Environment.GetEnvironmentVariable("ASPNETCORE_HTTP_PORTS");
    var httpsPortEnv = Environment.GetEnvironmentVariable("ASPNETCORE_HTTPS_PORTS");
    int httpPort = 5116;
    int httpsPort = 7289;

    if (!string.IsNullOrEmpty(httpPortEnv) && int.TryParse(httpPortEnv, out int parsedHttpPort))
    {
        httpPort = parsedHttpPort;
    }
    if (!string.IsNullOrEmpty(httpsPortEnv) && int.TryParse(httpsPortEnv, out int parsedHttpsPort))
    {
        httpsPort = parsedHttpsPort;
    }
    options.Listen(IPAddress.Any, httpPort);
    options.Listen(IPAddress.Any, httpsPort, listenOptions =>
    {
        listenOptions.UseHttps();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "IdentityServerAPI v1"));
    app.UseDeveloperExceptionPage();

    // Gọi hàm seed
    using (var scope = app.Services.CreateScope()) // Tạo scope để lấy services
    {
        var services = scope.ServiceProvider;
        try
        {
            // Gọi hàm seed, truyền services provider để nó có thể resolve UserManager, RoleManager,...
            await SeedDatabaseAsync(services);
        }
        catch (Exception ex)
        {
            var logger = services.GetRequiredService<ILogger<Program>>();
            logger.LogError(ex, "An error occurred while seeding the DB.");
        }
    }

}
else
{
    app.UseHsts();
    app.UseHttpsRedirection();
}

app.UseStaticFiles(new StaticFileOptions
{
    // Chỉ định rõ thư mục gốc là wwwroot
    FileProvider = new PhysicalFileProvider(
        Path.Combine(builder.Environment.ContentRootPath, "wwwroot")),
    // Cho phép truy cập mà không cần xác thực
    OnPrepareResponse = ctx =>
    {
        // Dòng này rất quan trọng, nó nói rằng các file tĩnh không cần
        // các header bảo mật như CORS, vì chúng là tài nguyên công khai.
        ctx.Context.Response.Headers.Append("Access-Control-Allow-Origin", "*");
    }
});
app.UseRouting();
app.UseCors("AllowFrontendOrigin");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.Run();

// ĐỊNH NGHĨA HÀM SEED DATABASE
async Task SeedDatabaseAsync(IServiceProvider services)
{
    // Không cần tạo scope nữa vì đã tạo ở nơi gọi
    var userManager = services.GetRequiredService<UserManager<ApplicationUser>>();
    var roleManager = services.GetRequiredService<RoleManager<ApplicationRole>>();
    var configuration = services.GetRequiredService<IConfiguration>();
    var logger = services.GetRequiredService<ILogger<Program>>(); // Hoặc ILogger<T> nếu tạo class riêng cho Seeder

    logger.LogInformation("Attempting to seed database...");

    // 1. Seed Roles
    string adminRoleName = "Admin";
    string userRoleName = "User";

    if (!await roleManager.RoleExistsAsync(adminRoleName))
    {
        var adminRole = new ApplicationRole(adminRoleName); // Sử dụng constructor đã định nghĩa
        var result = await roleManager.CreateAsync(adminRole);
        if (result.Succeeded) logger.LogInformation($"Role '{adminRoleName}' created successfully.");
        else logger.LogError($"Error creating role '{adminRoleName}': {string.Join(", ", result.Errors.Select(e => e.Description))}");
    }
    else
    {
        logger.LogInformation($"Role '{adminRoleName}' already exists.");
    }

    if (!await roleManager.RoleExistsAsync(userRoleName))
    {
        var userRole = new ApplicationRole(userRoleName);
        var result = await roleManager.CreateAsync(userRole);
        if (result.Succeeded) logger.LogInformation($"Role '{userRoleName}' created successfully.");
        else logger.LogError($"Error creating role '{userRoleName}': {string.Join(", ", result.Errors.Select(e => e.Description))}");
    }
    else
    {
        logger.LogInformation($"Role '{userRoleName}' already exists.");
    }

    // 2. Seed Admin User
    var adminConfig = configuration.GetSection("SeedAdminUser");
    var adminEmail = adminConfig["Email"];
    var adminUserName = adminConfig["UserName"];
    var adminPassword = adminConfig["Password"];

    if (string.IsNullOrEmpty(adminEmail) || string.IsNullOrEmpty(adminPassword) || string.IsNullOrEmpty(adminUserName))
    {
        logger.LogError("Admin user seed configuration (Email, UserName, Password) is missing in appsettings.json. Skipping admin user seed.");
        return; // Thoát nếu thiếu cấu hình
    }

    var adminUserInDb = await userManager.FindByEmailAsync(adminEmail);
    if (adminUserInDb == null)
    {
        var newAdminUser = new ApplicationUser
        {
            UserName = adminUserName,
            Email = adminEmail,
            EmailConfirmed = true, // Admin đầu tiên nên được xác thực sẵn
            FirstName = adminConfig["FirstName"] ?? "Admin1", // Sử dụng giá trị từ config hoặc mặc định
            LastName = adminConfig["LastName"] ?? "Admin",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        var result = await userManager.CreateAsync(newAdminUser, adminPassword);
        if (result.Succeeded)
        {
            logger.LogInformation($"Admin user '{adminEmail}' created successfully.");
            // Gán vai trò Admin
            if (await roleManager.RoleExistsAsync(adminRoleName))
            {
                var addToRoleResult = await userManager.AddToRoleAsync(newAdminUser, adminRoleName);
                if (addToRoleResult.Succeeded) logger.LogInformation($"User '{adminEmail}' added to role '{adminRoleName}'.");
                else logger.LogError($"Error adding user '{adminEmail}' to role '{adminRoleName}': {string.Join(", ", addToRoleResult.Errors.Select(e => e.Description))}");
            }
            else
            {
                logger.LogWarning($"Role '{adminRoleName}' does not exist. Cannot assign to admin user.");
            }
        }
        else
        {
            logger.LogError($"Failed to create admin user '{adminEmail}': {string.Join(", ", result.Errors.Select(e => e.Description))}");
        }
    }
    else
    {
        logger.LogInformation($"Admin user '{adminEmail}' already exists.");
        // Đảm bảo admin user hiện tại có vai trò Admin, nếu chưa có thì gán lại
        if (!await userManager.IsInRoleAsync(adminUserInDb, adminRoleName) && await roleManager.RoleExistsAsync(adminRoleName))
        {
            logger.LogInformation($"Attempting to add role '{adminRoleName}' to existing admin user '{adminEmail}'.");
            var addToRoleResult = await userManager.AddToRoleAsync(adminUserInDb, adminRoleName);
            if (addToRoleResult.Succeeded) logger.LogInformation($"Existing user '{adminEmail}' successfully added to role '{adminRoleName}'.");
            else logger.LogError($"Error adding existing user '{adminEmail}' to role '{adminRoleName}': {string.Join(", ", addToRoleResult.Errors.Select(e => e.Description))}");
        }
    }
    logger.LogInformation("Database seeding finished.");
    
    // 3. Seed Sample Data for HoSo (Bỏ seed cho TinTuc, VanBanPhapLuat)
    logger.LogInformation("Attempting to seed sample data for new collections...");
    var database = services.GetRequiredService<IMongoDatabase>();
    
    // // Seed Tin Tức
    // var tinTucCollection = database.GetCollection<TinTuc>("TinTuc");
    // if (await tinTucCollection.CountDocumentsAsync(_ => true) == 0)
    // {
    //     logger.LogInformation("Seeding sample news articles...");
    //     var sampleNews = new List<TinTuc>
    //     {
    //         new TinTuc { TieuDe = "Thẩm quyền cấp sổ đỏ tại Hà Nội mới nhất 2025", MoTaNgan = "Hiện nay thẩm quyền cấp sổ đỏ tại Hà Nội được quy định thế nào khi bỏ cấp huyện?", AnhDaiDienUrl = "https://via.placeholder.com/350x200?text=Tin+Tuc+1" },
    //         new TinTuc { TieuDe = "Quy định mới về cấp giấy chứng nhận quyền sử dụng đất", MoTaNgan = "Những thay đổi quan trọng trong Luật Đất đai (sửa đổi) mà người dân cần biết.", AnhDaiDienUrl = "https://via.placeholder.com/350x200?text=Tin+Tuc+2" },
    //         new TinTuc { TieuDe = "Hướng dẫn nộp hồ sơ đất đai trực tuyến", MoTaNgan = "Các bước chi tiết để nộp hồ sơ đăng ký biến động đất đai qua cổng dịch vụ công quốc gia.", AnhDaiDienUrl = "https://via.placeholder.com/350x200?text=Tin+Tuc+3" },
    //         new TinTuc { TieuDe = "Giá đất các quận trung tâm Hà Nội có thể tăng", MoTaNgan = "Dự thảo bảng giá đất mới cho giai đoạn 2025-2029 đang được lấy ý kiến.", AnhDaiDienUrl = "https://via.placeholder.com/350x200?text=Tin+Tuc+4" }
    //     };
    //     await tinTucCollection.InsertManyAsync(sampleNews);
    //     logger.LogInformation("Seeded {Count} news articles.", sampleNews.Count);
    // }
    
    // // Seed Văn Bản Pháp Luật
    // var vanBanCollection = database.GetCollection<VanBanPhapLuat>("VanBanPhapLuat");
    // if (await vanBanCollection.CountDocumentsAsync(_ => true) == 0)
    // {
    //     logger.LogInformation("Seeding sample legal documents...");
    //     var sampleDocs = new List<VanBanPhapLuat>
    //     {
    //         new VanBanPhapLuat { TieuDe = "Nghị định 91/2019/NĐ-CP về xử phạt vi phạm hành chính trong lĩnh vực đất đai", SoHieuVanBan = "91/2019/NĐ-CP", NgayBanHanh = new DateTime(2019, 11, 19) },
    //         new VanBanPhapLuat { TieuDe = "Thông tư 25/2014/TT-BTNMT quy định về bản đồ địa chính", SoHieuVanBan = "25/2014/TT-BTNMT", NgayBanHanh = new DateTime(2014, 5, 19) },
    //         new VanBanPhapLuat { TieuDe = "Luật Đất đai (sửa đổi) 2024", SoHieuVanBan = "31/2024/QH15", NgayBanHanh = new DateTime(2024, 1, 18) },
    //         new VanBanPhapLuat { TieuDe = "Thông tư 33/2017/TT-BTNMT quy định chi tiết Nghị định 01/2017/NĐ-CP", SoHieuVanBan = "33/2017/TT-BTNMT", NgayBanHanh = new DateTime(2017, 9, 29) }
    //     };
    //     await vanBanCollection.InsertManyAsync(sampleDocs);
    //     logger.LogInformation("Seeded {Count} legal documents.", sampleDocs.Count);
    // }
    
    // Seed Hồ Sơ
    var hoSoCollection = database.GetCollection<HoSo>("HoSo");
    if (await hoSoCollection.CountDocumentsAsync(_ => true) == 0)
    {
        logger.LogInformation("Seeding sample Ho So records with new status model...");
        var adminUser = await userManager.FindByEmailAsync(configuration["SeedAdminUser:Email"]);
        if(adminUser != null)
        {
            var sampleHoSo = new List<HoSo>
            {
                // 2 hồ sơ đang được xử lý
                new HoSo { SoBienNhan = "HS00001", UserId = adminUser.Id, TrangThaiHoSo = HoSoStatus.DaTiepNhanVaXuLy, NgayTiepNhan = DateTime.UtcNow.AddDays(-2) },
                new HoSo { SoBienNhan = "HS00002", UserId = adminUser.Id, TrangThaiHoSo = HoSoStatus.DaTiepNhanVaXuLy, NgayTiepNhan = DateTime.UtcNow.AddDays(-1) },
                
                // 2 hồ sơ đã trả
                new HoSo { SoBienNhan = "HS00003", UserId = adminUser.Id, TrangThaiHoSo = HoSoStatus.DaTra, NgayTiepNhan = DateTime.UtcNow.AddDays(-5), NgayHenTra = DateTime.UtcNow.AddDays(-1) },
                new HoSo { SoBienNhan = "HS00004", UserId = adminUser.Id, TrangThaiHoSo = HoSoStatus.DaTra, NgayTiepNhan = DateTime.UtcNow.AddDays(-4), NgayHenTra = DateTime.UtcNow },
                
                // 1 hồ sơ bị từ chối
                new HoSo { SoBienNhan = "HS00005", UserId = adminUser.Id, TrangThaiHoSo = HoSoStatus.TuChoi, LyDoTuChoi = "Giấy tờ không hợp lệ." },
                
                // 2 hồ sơ mới nộp, đang chờ tiếp nhận
                new HoSo { SoBienNhan = "HS00006", UserId = adminUser.Id, TrangThaiHoSo = HoSoStatus.DaNop },
                new HoSo { SoBienNhan = "HS00007", UserId = adminUser.Id, TrangThaiHoSo = HoSoStatus.DaNop }
            };
            await hoSoCollection.InsertManyAsync(sampleHoSo);
            logger.LogInformation("Seeded {Count} Ho So records.", sampleHoSo.Count);
        }
    }

    logger.LogInformation("Database seeding finished.");
}