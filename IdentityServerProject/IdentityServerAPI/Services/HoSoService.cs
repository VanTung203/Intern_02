using IdentityServerAPI.DTOs.HoSo;
using IdentityServerAPI.Models;
using IdentityServerAPI.Services.Interfaces;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using System.Security.Claims;
using System.Text.Json;

namespace IdentityServerAPI.Services
{
    public class HoSoService : IHoSoService
    {
        private readonly IMongoCollection<HoSo> _hoSoCollection;
        private readonly IMongoCollection<NguoiNopDon> _nguoiNopDonCollection;
        private readonly IMongoCollection<ThongTinThuaDat> _thongTinThuaDatCollection;
        private readonly IMongoCollection<GiayToDinhKem> _giayToDinhKemCollection;
        private readonly IWebHostEnvironment _webHostEnvironment;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly ILogger<HoSoService> _logger;

        public HoSoService(IMongoDatabase database, IWebHostEnvironment webHostEnvironment, UserManager<ApplicationUser> userManager, ILogger<HoSoService> logger)
        {
            _hoSoCollection = database.GetCollection<HoSo>("HoSo");
            _nguoiNopDonCollection = database.GetCollection<NguoiNopDon>("NguoiNopDon");
            _thongTinThuaDatCollection = database.GetCollection<ThongTinThuaDat>("ThongTinThuaDat");
            _giayToDinhKemCollection = database.GetCollection<GiayToDinhKem>("GiayToDinhKem");
            _webHostEnvironment = webHostEnvironment;
            _userManager = userManager;
            _logger = logger;
        }

        public async Task<IActionResult> GetThuTucHanhChinhAsync()
        {
            try
            {
                var jsonFilePath = Path.Combine(_webHostEnvironment.ContentRootPath, "Data", "ThuTucHanhChinh.json");
                if (!System.IO.File.Exists(jsonFilePath))
                {
                    _logger.LogWarning("File ThuTucHanhChinh.json not found at path: {Path}", jsonFilePath);
                    return new NotFoundObjectResult(new { message = "Không tìm thấy file dữ liệu thủ tục hành chính." });
                }

                var jsonText = await System.IO.File.ReadAllTextAsync(jsonFilePath);
                var thuTucList = JsonSerializer.Deserialize<List<ThuTucHanhChinh>>(jsonText, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                
                return new OkObjectResult(thuTucList);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi đọc file thủ tục hành chính.");
                return new ObjectResult(new { message = "Lỗi máy chủ khi tải dữ liệu thủ tục." }) { StatusCode = 500 };
            }
        }

        public async Task<IActionResult> UploadFileAsync(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return new BadRequestObjectResult(new { message = "Không có file nào được chọn." });

            // Cân nhắc thêm giới hạn kích thước file ở đây
            // if (file.Length > 5 * 1024 * 1024) // Ví dụ: 5MB
            //    return new BadRequestObjectResult(new { message = "Kích thước file vượt quá 5MB." });
            
            try
            {
                var uploadsFolderPath = Path.Combine(_webHostEnvironment.ContentRootPath, "wwwroot", "giay-to");
                if (!Directory.Exists(uploadsFolderPath))
                {
                    Directory.CreateDirectory(uploadsFolderPath);
                }

                // Tạo tên file duy nhất để tránh trùng lặp
                var uniqueFileName = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
                var filePath = Path.Combine(uploadsFolderPath, uniqueFileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                // Trả về đường dẫn tương đối để frontend có thể truy cập
                var fileUrl = $"/giay-to/{uniqueFileName}";
                _logger.LogInformation("File uploaded successfully to {Path}", fileUrl);
                return new OkObjectResult(new { url = fileUrl, fileName = file.FileName });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi upload file.");
                return new ObjectResult(new { message = "Đã có lỗi xảy ra trên máy chủ khi tải lên file." }) { StatusCode = 500 };
            }
        }

        public async Task<IActionResult> SubmitHoSoAsync(SubmitHoSoDto dto, ClaimsPrincipal userPrincipal)
        {
            var user = await _userManager.GetUserAsync(userPrincipal);
            if (user == null)
            {
                return new UnauthorizedObjectResult(new { message = "Người dùng không hợp lệ hoặc phiên đăng nhập đã hết hạn." });
            }

            // Sử dụng transaction để đảm bảo toàn vẹn dữ liệu: hoặc tất cả cùng thành công, hoặc không có gì được lưu.
            // Điều này yêu cầu MongoDB của bạn phải chạy dưới dạng replica set.
            // Nếu không, bạn có thể bỏ qua phần transaction và chấp nhận rủi ro (hiếm gặp) là dữ liệu có thể không nhất quán nếu có lỗi giữa chừng.
            // Tôi sẽ viết code không có transaction để đảm bảo nó chạy trên mọi môi trường MongoDB.

            try
            {
                // 1. Tạo bản ghi HoSo chính
                var soBienNhan = $"HS-{Guid.NewGuid().ToString("N").ToUpper().Substring(0, 16)}";

                var newHoSo = new HoSo
                {
                    UserId = user.Id,
                    SoBienNhan = soBienNhan,
                    MaThuTucHanhChinh = dto.MaThuTucHanhChinh,
                    NgayNopHoSo = DateTime.UtcNow,
                    TrangThaiHoSo = Enums.HoSoStatus.DangXuLy,
                    // Các trường nullable sẽ được admin cập nhật sau
                    NgayTiepNhan = null,
                    NgayHenTra = null,
                    LyDoTuChoi = null
                };
                await _hoSoCollection.InsertOneAsync(newHoSo);
                _logger.LogInformation("Created new HoSo with Id: {HoSoId} and SoBienNhan: {SoBienNhan}", newHoSo.Id, soBienNhan);


                // 2. Tạo bản ghi NguoiNopDon, liên kết với HoSo
                var newNguoiNopDon = new NguoiNopDon
                {
                    HoSoId = newHoSo.Id, // <<< Liên kết quan trọng
                    HoTen = dto.NguoiNopDon.HoTen,
                    GioiTinh = dto.NguoiNopDon.GioiTinh,
                    NgaySinh = dto.NguoiNopDon.NgaySinh,
                    NamSinh = dto.NguoiNopDon.NamSinh,
                    SoCCCD = dto.NguoiNopDon.SoCCCD,
                    DiaChi = dto.NguoiNopDon.DiaChi,
                    SoDienThoai = dto.NguoiNopDon.SoDienThoai,
                    Email = dto.NguoiNopDon.Email
                };
                await _nguoiNopDonCollection.InsertOneAsync(newNguoiNopDon);


                // 3. Tạo bản ghi ThongTinThuaDat, liên kết với HoSo
                var newThongTinThuaDat = new ThongTinThuaDat
                {
                    HoSoId = newHoSo.Id, // <<< Liên kết quan trọng
                    SoThuTuThua = dto.ThongTinThuaDat.SoThuTuThua,
                    SoHieuToBanDo = dto.ThongTinThuaDat.SoHieuToBanDo,
                    DiaChi = dto.ThongTinThuaDat.DiaChi
                };
                await _thongTinThuaDatCollection.InsertOneAsync(newThongTinThuaDat);

                // 4. Tạo các bản ghi GiayToDinhKem nếu có, liên kết với HoSo
                if (dto.GiayToDinhKem != null && dto.GiayToDinhKem.Any())
                {
                    var giayToList = dto.GiayToDinhKem.Select(g => new GiayToDinhKem
                    {
                        HoSoId = newHoSo.Id, // <<< Liên kết quan trọng
                        TenLoaiGiayTo = g.TenLoaiGiayTo,
                        DuongDanTapTin = g.DuongDanTapTin
                    }).ToList();
                    await _giayToDinhKemCollection.InsertManyAsync(giayToList);
                }

                // 5. Trả về số biên nhận cho frontend
                return new OkObjectResult(new { soBienNhan = soBienNhan, message = "Nộp hồ sơ thành công!" });
            }
            catch (Exception ex)
            {
                // Nếu có lỗi, cần có cơ chế dọn dẹp các bản ghi đã được tạo (phức tạp nếu không dùng transaction)
                _logger.LogError(ex, "Lỗi nghiêm trọng khi nộp hồ sơ cho người dùng {UserId}.", user.Id);
                return new ObjectResult(new { message = "Đã xảy ra lỗi trong quá trình nộp hồ sơ. Vui lòng thử lại." }) { StatusCode = 500 };
            }
        }
    }
}