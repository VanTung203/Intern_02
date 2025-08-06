// IdentityServerProject/IdentityServerAPI/Services/HomepageService.cs
using IdentityServerAPI.DTOs.Homepage;
using IdentityServerAPI.Enums;
using IdentityServerAPI.Models;
using IdentityServerAPI.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using System.Linq;
using MongoDB.Bson;

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

        // public async Task<IActionResult> GetHomepageStatisticsAsync()
        // {
        //     try
        //     {
        //         var total = await _hoSoCollection.CountDocumentsAsync(_ => true);
        //         var choTiepNhan = await _hoSoCollection.CountDocumentsAsync(h => h.TrangThaiHoSo == HoSoStatus.DaNop);
        //         var dangThuLy = await _hoSoCollection.CountDocumentsAsync(h => h.TrangThaiHoSo == HoSoStatus.DaTiepNhanVaXuLy);
        //         var daTraFilter = Builders<HoSo>.Filter.In(h => h.TrangThaiHoSo, new[] { HoSoStatus.DaTra, HoSoStatus.TuChoi });
        //         var daTra = await _hoSoCollection.CountDocumentsAsync(daTraFilter);

        //         var stats = new HomepageStatsDto
        //         {
        //             // DTO đã được cập nhật ở lần trước, ta chỉ cần gán giá trị
        //             TongSoHoSo = total,
        //             SoHoSoChoTiepNhan = choTiepNhan,
        //             SoHoSoDangThuLy = dangThuLy,
        //             SoHoSoDaTra = daTra // Gán giá trị mới đã được tính toán
        //         };

        //         return new OkObjectResult(stats);
        //     }
        //     catch (Exception ex)
        //     {
        //         _logger.LogError(ex, "Error getting homepage statistics.");
        //         return new ObjectResult(new { message = "Lỗi máy chủ khi lấy dữ liệu thống kê." }) { StatusCode = 500 };
        //     }
        // }

        public async Task<IActionResult> GetHomepageStatisticsAsync()
        {
            try
            {
                var groupStage = new BsonDocument("$group", new BsonDocument
                {
                    { "_id", "$TrangThaiHoSo" },
                    { "count", new BsonDocument("$sum", 1) }
                });

                var pipeline = new[] { groupStage };
                var results = await _hoSoCollection.Aggregate<BsonDocument>(pipeline).ToListAsync();

                long total = 0;
                long choTiepNhan = 0;
                long dangThuLy = 0;
                long daTraVaTuChoi = 0;

                foreach (var result in results)
                {
                    var status = (HoSoStatus)result["_id"].AsInt32;
                    // var count = result["count"].AsInt64;
                    var count = result["count"].AsInt32;
                    total += count;

                    switch (status)
                    {
                        case HoSoStatus.DaNop:
                            choTiepNhan = count;
                            break;
                        case HoSoStatus.DaTiepNhanVaXuLy:
                            dangThuLy = count;
                            break;
                        case HoSoStatus.DaTra:
                        case HoSoStatus.TuChoi:
                            daTraVaTuChoi += count;
                            break;
                    }
                }

                var stats = new HomepageStatsDto
                {
                    TongSoHoSo = total,
                    SoHoSoChoTiepNhan = choTiepNhan,
                    SoHoSoDangThuLy = dangThuLy,
                    SoHoSoDaTra = daTraVaTuChoi
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
                    // AnhDaiDienUrl = n.AnhDaiDienUrl,
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

        public async Task<IActionResult> GetAllNewsAsync()
        {
            try
            {
                var news = await _tinTucCollection.Find(_ => true)
                                                  .SortByDescending(n => n.NgayDang) // Sắp xếp tin mới nhất lên đầu
                                                  .ToListAsync();

                // Dùng lại NewsArticleDto vì chỉ cần tiêu đề và mô tả ngắn
                var newsDtos = news.Select(n => new NewsArticleDto
                {
                    Id = n.Id,
                    TieuDe = n.TieuDe,
                    MoTaNgan = n.MoTaNgan,
                    NgayDang = n.NgayDang
                }).ToList();

                return new OkObjectResult(newsDtos);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting all news articles.");
                return new ObjectResult(new { message = "Lỗi máy chủ khi lấy danh sách bản tin." }) { StatusCode = 500 };
            }
        }

        public async Task<IActionResult> GetNewsByIdAsync(string id)
        {
            try
            {
                var newsArticle = await _tinTucCollection.Find(n => n.Id == id).FirstOrDefaultAsync();

                if (newsArticle == null)
                {
                    return new NotFoundObjectResult(new { message = "Không tìm thấy bản tin." });
                }

                // Trả về toàn bộ object TinTuc, vì frontend cần cả NoiDung
                // Chúng ta không cần tạo DTO mới để giữ mọi thứ đơn giản theo yêu cầu
                return new OkObjectResult(newsArticle);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting news article by ID.");
                return new ObjectResult(new { message = "Lỗi máy chủ khi lấy chi tiết bản tin." }) { StatusCode = 500 };
            }
        }
        
        public async Task<IActionResult> GetAllLegalDocumentsAsync()
        {
            try
            {
                var documents = await _vanBanPhapLuatCollection.Find(_ => true)
                                                               .SortByDescending(d => d.NgayBanHanh)
                                                               .ToListAsync();

                // Dùng lại LegalDocumentDto vì nó chứa các thông tin cần thiết cho trang danh sách
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
                _logger.LogError(ex, "Error getting all legal documents.");
                return new ObjectResult(new { message = "Lỗi máy chủ khi lấy danh sách văn bản pháp luật." }) { StatusCode = 500 };
            }
        }

        public async Task<IActionResult> GetLegalDocumentByIdAsync(string id)
        {
            try
            {
                var document = await _vanBanPhapLuatCollection.Find(d => d.Id == id).FirstOrDefaultAsync();

                if (document == null)
                {
                    return new NotFoundObjectResult(new { message = "Không tìm thấy văn bản pháp luật." });
                }

                // Trả về toàn bộ object VanBanPhapLuat để frontend có thể lấy NoiDungVanBan
                return new OkObjectResult(document);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting legal document by ID.");
                return new ObjectResult(new { message = "Lỗi máy chủ khi lấy chi tiết văn bản pháp luật." }) { StatusCode = 500 };
            }
        }
    }
}