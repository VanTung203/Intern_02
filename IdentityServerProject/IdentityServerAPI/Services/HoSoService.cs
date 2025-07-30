// IdentityServerProject/IdentityServerAPI/Services/HoSoService.cs
using IdentityServerAPI.Configuration;
using IdentityServerAPI.DTOs.HoSo;
using IdentityServerAPI.Enums;
using IdentityServerAPI.Models;
using IdentityServerAPI.Services.Interfaces;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using System.Security.Claims;
using System.Text.Json;
using Microsoft.Extensions.Options;

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
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly FileUploadSettings _fileUploadSettings;

        public HoSoService(
            IMongoDatabase database,
            IWebHostEnvironment webHostEnvironment,
            UserManager<ApplicationUser> userManager,
            ILogger<HoSoService> logger,
            IHttpContextAccessor httpContextAccessor,
            IOptions<FileUploadSettings> fileUploadSettings
        )
        {
            _hoSoCollection = database.GetCollection<HoSo>("HoSo");
            _nguoiNopDonCollection = database.GetCollection<NguoiNopDon>("NguoiNopDon");
            _thongTinThuaDatCollection = database.GetCollection<ThongTinThuaDat>("ThongTinThuaDat");
            _giayToDinhKemCollection = database.GetCollection<GiayToDinhKem>("GiayToDinhKem");
            _webHostEnvironment = webHostEnvironment;
            _userManager = userManager;
            _logger = logger;
            _httpContextAccessor = httpContextAccessor;
            _fileUploadSettings = fileUploadSettings.Value;
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
            
            var fileExtension = Path.GetExtension(file.FileName).ToLowerInvariant();

            if (string.IsNullOrEmpty(fileExtension) || !_fileUploadSettings.AllowedExtensions.Contains(fileExtension))
            {
                var allowedTypes = string.Join(", ", _fileUploadSettings.AllowedExtensions);
                _logger.LogWarning("File upload rejected: Invalid extension '{Extension}'. Allowed: {Allowed}", fileExtension, allowedTypes);
                return new BadRequestObjectResult(new { message = $"Loại file không hợp lệ. Chỉ chấp nhận các định dạng: {allowedTypes}" });
            }

            if (file.Length > _fileUploadSettings.MaxSizeInBytes)
            {
                var maxSizeInMB = _fileUploadSettings.MaxSizeInBytes / 1024 / 1024;
                _logger.LogWarning("File upload rejected: File size {Size} exceeds limit of {Limit}MB.", file.Length, maxSizeInMB);
                return new BadRequestObjectResult(new { message = $"Kích thước file quá lớn. Tối đa cho phép là {maxSizeInMB}MB." });
            }

            try
            {
                var uploadsFolderPath = Path.Combine(_webHostEnvironment.ContentRootPath, "wwwroot", "giay-to");
                if (!Directory.Exists(uploadsFolderPath))
                {
                    Directory.CreateDirectory(uploadsFolderPath);
                }

                var uniqueFileName = $"{Guid.NewGuid()}{fileExtension}"; // Tái sử dụng biến đã có
                var filePath = Path.Combine(uploadsFolderPath, uniqueFileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                // BẮT ĐẦU PHẦN TẠO URL TUYỆT ĐỐI
                var request = _httpContextAccessor.HttpContext.Request;
                var baseUrl = $"{request.Scheme}://{request.Host}";
                var fileUrl = $"{baseUrl}/giay-to/{uniqueFileName}";
                // KẾT THÚC PHẦN TẠO URL TUYỆT ĐỐI

                _logger.LogInformation("File uploaded successfully to {Path}", fileUrl);
                return new OkObjectResult(new { url = fileUrl, fileName = file.FileName }); // <<< Trả về URL đầy đủ
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
            // Điều này yêu cầu MongoDB phải chạy dưới dạng replica set.
            // Nếu không, có thể bỏ qua phần transaction và chấp nhận rủi ro (hiếm gặp) là dữ liệu có thể không nhất quán nếu có lỗi giữa chừng.

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
                    TrangThaiHoSo = Enums.HoSoStatus.DaNop,
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

        // Phương thức tra cứu thông tin hồ sơ
        public async Task<HoSoDetailsDto?> GetHoSoDetailsAsync(string receiptNumber, string cccd)
        {
            try
            {
                // 1. Tìm hồ sơ theo số biên nhận
                var hoSo = await _hoSoCollection.Find(h => h.SoBienNhan.ToLower() == receiptNumber.Trim().ToLower()).FirstOrDefaultAsync();
                if (hoSo == null)
                {
                    _logger.LogInformation("Tra cứu không thành công: Không tìm thấy hồ sơ với số biên nhận {ReceiptNumber}", receiptNumber);
                    return null; // Không tìm thấy hồ sơ
                }

                // 2. Tìm người nộp đơn theo HoSoId
                var nguoiNopDon = await _nguoiNopDonCollection.Find(n => n.HoSoId == hoSo.Id).FirstOrDefaultAsync();
                if (nguoiNopDon == null)
                {
                    _logger.LogError("Lỗi dữ liệu: Hồ sơ {HoSoId} tồn tại nhưng không có người nộp đơn tương ứng.", hoSo.Id);
                    return null; // Lỗi dữ liệu
                }

                // 3. **XÁC THỰC BẢO MẬT**: So sánh số CCCD
                if (nguoiNopDon.SoCCCD.Trim() != cccd.Trim())
                {
                    _logger.LogWarning("Tra cứu không thành công: Số CCCD không khớp cho hồ sơ {ReceiptNumber}", receiptNumber);
                    return null; // Thông tin không khớp, trả về null để bảo mật
                }

                // 4. Lấy các thông tin liên quan khác
                var thongTinThuaDat = await _thongTinThuaDatCollection.Find(t => t.HoSoId == hoSo.Id).FirstOrDefaultAsync();
                var giayToDinhKemList = await _giayToDinhKemCollection.Find(g => g.HoSoId == hoSo.Id).ToListAsync();

                // 5. Lấy tên thủ tục và tên trạng thái
                var tenThuTuc = await GetTenThuTucHanhChinhById(hoSo.MaThuTucHanhChinh);
                var tenTrangThai = GetTenTrangThaiHoSo(hoSo.TrangThaiHoSo);

                // 6. Tổng hợp dữ liệu vào DTO để trả về
                var hoSoDetails = new HoSoDetailsDto
                {
                    SoBienNhan = hoSo.SoBienNhan,
                    NgayNopHoSo = hoSo.NgayNopHoSo,
                    NgayTiepNhan = hoSo.NgayTiepNhan,
                    NgayHenTra = hoSo.NgayHenTra,
                    TrangThaiHoSo = hoSo.TrangThaiHoSo,
                    TenTrangThaiHoSo = tenTrangThai,
                    LyDoTuChoi = hoSo.LyDoTuChoi,
                    TenThuTucHanhChinh = tenThuTuc,
                    NguoiNopDon = new NguoiNopDonDto
                    {
                        HoTen = nguoiNopDon.HoTen,
                        GioiTinh = nguoiNopDon.GioiTinh,
                        NgaySinh = nguoiNopDon.NgaySinh,
                        NamSinh = nguoiNopDon.NamSinh,
                        SoCCCD = nguoiNopDon.SoCCCD,
                        DiaChi = nguoiNopDon.DiaChi,
                        SoDienThoai = nguoiNopDon.SoDienThoai,
                        Email = nguoiNopDon.Email
                    },
                    ThongTinThuaDat = thongTinThuaDat != null ? new ThongTinThuaDatDto
                    {
                        SoThuTuThua = thongTinThuaDat.SoThuTuThua,
                        SoHieuToBanDo = thongTinThuaDat.SoHieuToBanDo,
                        DiaChi = thongTinThuaDat.DiaChi
                    } : new ThongTinThuaDatDto(),
                    GiayToDinhKem = giayToDinhKemList.Select(g => new GiayToDinhKemDto
                    {
                        TenLoaiGiayTo = g.TenLoaiGiayTo,
                        DuongDanTapTin = g.DuongDanTapTin,
                        FileName = Path.GetFileName(g.DuongDanTapTin)
                    }).ToList()
                };

                return hoSoDetails;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi nghiêm trọng khi tra cứu chi tiết hồ sơ {ReceiptNumber}", receiptNumber);
                return null; // Trả về null nếu có lỗi hệ thống
            }
        }

        // Phương thức xử lý tra cứu nhanh thông tin hồ sơ
        public async Task<HoSoLookupResultDto?> LookupHoSoByReceiptNumberAsync(string receiptNumber)
        {
            var hoSo = await _hoSoCollection
                .Find(h => h.SoBienNhan.ToLower() == receiptNumber.Trim().ToLower())
                .FirstOrDefaultAsync();

            if (hoSo == null)
            {
                return null;
            }

            // Tái sử dụng hàm helper để lấy tên trạng thái chính xác
            var tenTrangThai = GetTenTrangThaiHoSo(hoSo.TrangThaiHoSo);

            // Ánh xạ kết quả sang DTO mới
            return new HoSoLookupResultDto
            {
                SoBienNhan = hoSo.SoBienNhan,
                TenTrangThaiHoSo = tenTrangThai,
                NgayNopHoSo = hoSo.NgayNopHoSo
            };
        }

        // Các phương thức hỗ trợ
        private async Task<string> GetTenThuTucHanhChinhById(string id)
        {
            var jsonFilePath = Path.Combine(_webHostEnvironment.ContentRootPath, "Data", "ThuTucHanhChinh.json");
            if (!System.IO.File.Exists(jsonFilePath)) return "Không xác định";

            var jsonText = await System.IO.File.ReadAllTextAsync(jsonFilePath);
            var thuTucList = JsonSerializer.Deserialize<List<ThuTucHanhChinh>>(jsonText, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

            return thuTucList?.FirstOrDefault(t => t.Id == id)?.Ten ?? "Không xác định";
        }

        private string GetTenTrangThaiHoSo(HoSoStatus status)
        {
            return status switch
            {
                HoSoStatus.DaNop => "Đã nộp",
                HoSoStatus.DaTiepNhanVaXuLy => "Đã tiếp nhận",
                HoSoStatus.DaTra => "Đã trả kết quả",
                HoSoStatus.TuChoi => "Bị từ chối",
                _ => "Không xác định"
            };
        }
    }
}