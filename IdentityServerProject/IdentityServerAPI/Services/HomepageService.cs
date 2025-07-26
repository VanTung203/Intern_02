// IdentityServerProject/IdentityServerAPI/Services/HomepageService.cs
using IdentityServerAPI.DTOs.Homepage;
using IdentityServerAPI.Enums;
using IdentityServerAPI.Models;
using IdentityServerAPI.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using System.Linq;

namespace IdentityServerAPI.Services
{
    public class HomepageService : IHomepageService
    {
        private readonly IMongoCollection<HoSo> _hoSoCollection;
        private readonly IMongoCollection<TinTuc> _tinTucCollection;
        private readonly IMongoCollection<VanBanPhapLuat> _vanBanPhapLuatCollection;
        private readonly ILogger<HomepageService> _logger;

        public HomepageService(IMongoDatabase database, ILogger<HomepageService> logger)
        {
            _hoSoCollection = database.GetCollection<HoSo>("HoSo");
            _tinTucCollection = database.GetCollection<TinTuc>("TinTuc");
            _vanBanPhapLuatCollection = database.GetCollection<VanBanPhapLuat>("VanBanPhapLuat");
            _logger = logger;
        }

        public async Task<IActionResult> GetHomepageStatisticsAsync()
        {
            try
            {
                var total = await _hoSoCollection.CountDocumentsAsync(_ => true);
                var choTiepNhan = await _hoSoCollection.CountDocumentsAsync(h => h.TrangThaiHoSo == HoSoStatus.DaNop);
                var dangThuLy = await _hoSoCollection.CountDocumentsAsync(h => h.TrangThaiHoSo == HoSoStatus.DaTiepNhanVaXuLy);
                var daTraFilter = Builders<HoSo>.Filter.In(h => h.TrangThaiHoSo, new[] { HoSoStatus.DaTra, HoSoStatus.TuChoi });
                var daTra = await _hoSoCollection.CountDocumentsAsync(daTraFilter);

                var stats = new HomepageStatsDto
                {
                    // DTO đã được cập nhật ở lần trước, ta chỉ cần gán giá trị
                    TongSoHoSo = total,
                    SoHoSoChoTiepNhan = choTiepNhan,
                    SoHoSoDangThuLy = dangThuLy,
                    SoHoSoDaTra = daTra // Gán giá trị mới đã được tính toán
                };

                return new OkObjectResult(stats);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting homepage statistics.");
                return new ObjectResult(new { message = "Lỗi máy chủ khi lấy dữ liệu thống kê." }) { StatusCode = 500 };
            }
        }

        public async Task<IActionResult> GetRecentNewsAsync(int limit)
        {
            try
            {
                var news = await _tinTucCollection.Find(_ => true)
                                                  .SortByDescending(n => n.NgayDang)
                                                  .Limit(limit)
                                                  .ToListAsync();

                var newsDtos = news.Select(n => new NewsArticleDto
                {
                    Id = n.Id,
                    TieuDe = n.TieuDe,
                    MoTaNgan = n.MoTaNgan,
                    AnhDaiDienUrl = n.AnhDaiDienUrl,
                    NgayDang = n.NgayDang
                }).ToList();

                return new OkObjectResult(newsDtos);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting recent news.");
                return new ObjectResult(new { message = "Lỗi máy chủ khi lấy tin tức." }) { StatusCode = 500 };
            }
        }

        public async Task<IActionResult> GetRecentLegalDocumentsAsync(int limit)
        {
             try
            {
                var documents = await _vanBanPhapLuatCollection.Find(_ => true)
                                                  .SortByDescending(d => d.NgayBanHanh)
                                                  .Limit(limit)
                                                  .ToListAsync();

                var documentDtos = documents.Select(d => new LegalDocumentDto
                {
                    Id = d.Id,
                    TieuDe = d.TieuDe,
                    SoHieuVanBan = d.SoHieuVanBan,
                    NgayBanHanh = d.NgayBanHanh
                }).ToList();

                return new OkObjectResult(documentDtos);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting recent legal documents.");
                return new ObjectResult(new { message = "Lỗi máy chủ khi lấy văn bản pháp luật." }) { StatusCode = 500 };
            }
        }
    }
}