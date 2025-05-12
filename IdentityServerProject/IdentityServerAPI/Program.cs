using System.Net;
using Microsoft.Extensions.Options;
using MongoDB.Driver;
using IdentityServerAPI;
using Microsoft.AspNetCore.Identity;
using AspNetCore.Identity.Mongo;
using IdentityServerAPI.Models;

var builder = WebApplication.CreateBuilder(args);

// Cấu hình MongoDB từ appsettings.json
builder.Services.Configure<MongoSettings>(
    builder.Configuration.GetSection("MongoSettings")
);

// Đăng ký MongoClient và MongoDatabase
builder.Services.AddSingleton<IMongoClient>(sp =>
{
    var settings = sp.GetRequiredService<IOptions<MongoSettings>>().Value;
    return new MongoClient(settings.ConnectionString);
});

builder.Services.AddSingleton<IMongoDatabase>(sp =>
{
    var settings = sp.GetRequiredService<IOptions<MongoSettings>>().Value;
    var client = sp.GetRequiredService<IMongoClient>();
    return client.GetDatabase(settings.DatabaseName);
});

// Cấu hình Identity
builder.Services.AddIdentity<ApplicationUser, ApplicationRole>()
    .AddMongoDbStores<ApplicationUser, ApplicationRole, Guid>(options =>
    {
        options.ConnectionString = builder.Configuration["MongoSettings:ConnectionString"];
        options.UsersCollection = "AspNetUsers";
        options.RolesCollection = "AspNetRoles";
    })
    .AddDefaultTokenProviders();


// Thêm các dịch vụ cần thiết khác
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.WebHost.ConfigureKestrel(options =>
{
    options.Listen(IPAddress.Any, 5116); // HTTP
    options.Listen(IPAddress.Any, 7289, listenOptions =>
    {
        listenOptions.UseHttps(); // HTTPS
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

app.Run();
