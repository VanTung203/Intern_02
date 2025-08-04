// IdentityServerProject/IdentityServerAPI/Services/HoSoService.cs
using Ganss.Xss;
using AngleSharp.Html.Parser;
using System.Text.RegularExpressions;
using IdentityServerAPI.Configuration;
using IdentityServerAPI.DTOs.HoSo;
using IdentityServerAPI.Enums;
using IdentityServerAPI.Models;
using IdentityServerAPI.Services.Interfaces;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using System.Security.Claims;
// using System.Text.Json;
using Microsoft.Extensions.Options;
using MongoDB.Driver.GeoJsonObjectModel;
// using Newtonsoft.Json;
using MongoDB.Bson.Serialization;

namespace IdentityServerAPI.Services
{
    public class HoSoService : IHoSoService
    {
        // Biến
        private readonly IMongoCollection<HoSo> _hoSoCollection;
        private readonly IMongoCollection<NguoiNopDon> _nguoiNopDonCollection;
        private readonly IMongoCollection<ThongTinThuaDat> _thongTinThuaDatCollection;
        private readonly IMongoCollection<GiayToDinhKem> _giayToDinhKemCollection;
        private readonly IWebHostEnvironment _webHostEnvironment;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly ILogger<HoSoService> _logger;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly FileUploadSettings _fileUploadSettings;
        private readonly IReCaptchaService _reCaptchaService;
        private readonly IHtmlSanitizer _sanitizer;

        // Tham số
        public HoSoService(
            IMongoDatabase database,
            IWebHostEnvironment webHostEnvironment,
            UserManager<ApplicationUser> userManager,
            ILogger<HoSoService> logger,
            IHttpContextAccessor httpContextAccessor,
            IOptions<FileUploadSettings> fileUploadSettings,
            IReCaptchaService reCaptchaService,
            IHtmlSanitizer sanitizer
        )
        {
            // Giá trị
            _hoSoCollection = database.GetCollection<HoSo>("HoSo");
            _nguoiNopDonCollection = database.GetCollection<NguoiNopDon>("NguoiNopDon");
            _thongTinThuaDatCollection = database.GetCollection<ThongTinThuaDat>("ThongTinThuaDat");
            _giayToDinhKemCollection = database.GetCollection<GiayToDinhKem>("GiayToDinhKem");
            _webHostEnvironment = webHostEnvironment;
            _userManager = userManager;
            _logger = logger;
            _httpContextAccessor = httpContextAccessor;
            _fileUploadSettings = fileUploadSettings.Value;
            _reCaptchaService = reCaptchaService;
            _sanitizer = sanitizer;
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
                // var thuTucList = JsonSerializer.Deserialize<List<ThuTucHanhChinh>>(jsonText, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                // Thêm "System.Text.Json." vào trước JsonSerializer
                var thuTucList = System.Text.Json.JsonSerializer.Deserialize<List<ThuTucHanhChinh>>(jsonText, new System.Text.Json.JsonSerializerOptions { PropertyNameCaseInsensitive = true });

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
                // PHẦN SANITIZATION
                dto.NguoiNopDon.HoTen = SanitizeToPlainText(dto.NguoiNopDon.HoTen);
                dto.NguoiNopDon.DiaChi = !string.IsNullOrEmpty(dto.NguoiNopDon.DiaChi) ? SanitizeToPlainText(dto.NguoiNopDon.DiaChi) : null;
                dto.ThongTinThuaDat.DiaChi = !string.IsNullOrEmpty(dto.ThongTinThuaDat.DiaChi) ? SanitizeToPlainText(dto.ThongTinThuaDat.DiaChi) : null;

                if (dto.GiayToDinhKem != null)
                {
                    foreach (var giayTo in dto.GiayToDinhKem)
                    {
                        giayTo.TenLoaiGiayTo = SanitizeToPlainText(giayTo.TenLoaiGiayTo);
                    }
                }

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
                    DiaChi = dto.ThongTinThuaDat.DiaChi,
                    // --- THÊM LOGIC XỬ LÝ GEOMETRY ---
                    Geometry = !string.IsNullOrEmpty(dto.ThongTinThuaDat.Geometry)
                        ? BsonSerializer.Deserialize<GeoJsonPolygon<GeoJson2DCoordinates>>(dto.ThongTinThuaDat.Geometry)
                        : null
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
        public async Task<HoSoDetailsDto?> GetHoSoDetailsAsync(string receiptNumber, string? cccd, ClaimsPrincipal? userPrincipal = null)
        {
            try
            {
                var hoSo = await _hoSoCollection.Find(h => h.SoBienNhan.ToLower() == receiptNumber.Trim().ToLower()).FirstOrDefaultAsync();
                if (hoSo == null)
                {
                    _logger.LogInformation("Tra cứu không thành công: Không tìm thấy hồ sơ với số biên nhận {ReceiptNumber}", receiptNumber);
                    return null;
                }

                var currentUser = userPrincipal != null ? await _userManager.GetUserAsync(userPrincipal) : null;

                // --- LOGIC KIỂM TRA QUYỀN TRUY CẬP ---
                if (currentUser != null)
                {
                    if (hoSo.UserId != currentUser.Id)
                    {
                        _logger.LogWarning("Access denied: User {UserId} attempted to access Ho So {ReceiptNumber} owned by {OwnerId}", currentUser.Id, receiptNumber, hoSo.UserId);
                        return null;
                    }
                }
                else
                {
                    if (string.IsNullOrEmpty(cccd))
                    {
                        _logger.LogWarning("Public access failed: CCCD is required for Ho So {ReceiptNumber}", receiptNumber);
                        return null;
                    }

                    var nguoiNopDonForAuth = await _nguoiNopDonCollection.Find(n => n.HoSoId == hoSo.Id).FirstOrDefaultAsync();
                    if (nguoiNopDonForAuth == null || nguoiNopDonForAuth.SoCCCD.Trim() != cccd.Trim())
                    {
                        _logger.LogWarning("Public access failed: CCCD mismatch for Ho So {ReceiptNumber}", receiptNumber);
                        return null;
                    }
                }

                // --- BẮT ĐẦU SỬA LỖI NULLREFERENCE ---

                // Truy vấn tất cả dữ liệu liên quan
                var nguoiNopDon = await _nguoiNopDonCollection.Find(n => n.HoSoId == hoSo.Id).FirstOrDefaultAsync();
                var thongTinThuaDat = await _thongTinThuaDatCollection.Find(t => t.HoSoId == hoSo.Id).FirstOrDefaultAsync();
                var giayToDinhKemList = await _giayToDinhKemCollection.Find(g => g.HoSoId == hoSo.Id).ToListAsync();

                // Kiểm tra xem các dữ liệu thiết yếu có tồn tại không
                if (nguoiNopDon == null)
                {
                    _logger.LogError("Dữ liệu không nhất quán: Không tìm thấy NguoiNopDon cho HoSoId {HoSoId}", hoSo.Id);
                    return null; // Trả về null nếu dữ liệu bị thiếu
                }
                if (thongTinThuaDat == null)
                {
                    _logger.LogError("Dữ liệu không nhất quán: Không tìm thấy ThongTinThuaDat cho HoSoId {HoSoId}", hoSo.Id);
                    return null; // Trả về null nếu dữ liệu bị thiếu
                }

                var tenThuTuc = await GetTenThuTucHanhChinhById(hoSo.MaThuTucHanhChinh);
                var tenTrangThai = GetTenTrangThaiHoSo(hoSo.TrangThaiHoSo);

                // Tạo DTO một cách an toàn
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
                    ThongTinThuaDat = new ThongTinThuaDatDto
                    {
                        SoThuTuThua = thongTinThuaDat.SoThuTuThua,
                        SoHieuToBanDo = thongTinThuaDat.SoHieuToBanDo,
                        DiaChi = thongTinThuaDat.DiaChi
                    },
                    GiayToDinhKem = giayToDinhKemList.Select(g => new GiayToDinhKemDto
                    {
                        TenLoaiGiayTo = g.TenLoaiGiayTo,
                        DuongDanTapTin = g.DuongDanTapTin,
                        FileName = Path.GetFileName(g.DuongDanTapTin)
                    }).ToList()
                };

                return hoSoDetails;
                // --- KẾT THÚC SỬA LỖI NULLREFERENCE ---
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi nghiêm trọng khi tra cứu chi tiết hồ sơ {ReceiptNumber}", receiptNumber);
                return null; // Trả về null nếu có lỗi hệ thống
            }
        }

        // Phương thức xử lý tra cứu nhanh thông tin hồ sơ
        public async Task<IActionResult> LookupHoSoByReceiptNumberAsync(HoSoLookupRequestDto dto)
        {
            // 1. Xác thực CAPTCHA trước
            var isCaptchaValid = await _reCaptchaService.IsCaptchaValidAsync(dto.RecaptchaToken);
            if (!isCaptchaValid)
            {
                return new BadRequestObjectResult(new { message = "Xác thực CAPTCHA không thành công." });
            }

            // 2. Nếu CAPTCHA hợp lệ, tiếp tục tra cứu như cũ
            var hoSo = await _hoSoCollection
                .Find(h => h.SoBienNhan.ToLower() == dto.ReceiptNumber.Trim().ToLower())
                .FirstOrDefaultAsync();

            if (hoSo == null)
            {
                return new NotFoundObjectResult(new { message = "Không tìm thấy hồ sơ với số biên nhận này." });
            }

            var tenTrangThai = GetTenTrangThaiHoSo(hoSo.TrangThaiHoSo);
            var resultDto = new HoSoLookupResultDto
            {
                SoBienNhan = hoSo.SoBienNhan,
                TenTrangThaiHoSo = tenTrangThai,
                NgayNopHoSo = hoSo.NgayNopHoSo
            };

            return new OkObjectResult(resultDto);
        }

        // Các phương thức cho việc bổ sung, chỉnh sửa hồ sơ
        public async Task<IActionResult> GetMySubmissionsAsync(ClaimsPrincipal userPrincipal)
        {
            var user = await _userManager.GetUserAsync(userPrincipal);
            if (user == null)
            {
                return new UnauthorizedObjectResult(new { message = "Người dùng không hợp lệ." });
            }

            try
            {
                var hoSoList = await _hoSoCollection.Find(h => h.UserId == user.Id)
                                                    .SortByDescending(h => h.NgayNopHoSo)
                                                    .ToListAsync();

                // Chuyển đổi sang một DTO đơn giản để hiển thị danh sách
                var resultDto = new List<object>();
                foreach (var hoSo in hoSoList)
                {
                    resultDto.Add(new
                    {
                        soBienNhan = hoSo.SoBienNhan,
                        ngayNop = hoSo.NgayNopHoSo,
                        trangThai = GetTenTrangThaiHoSo(hoSo.TrangThaiHoSo),
                        tenThuTuc = await GetTenThuTucHanhChinhById(hoSo.MaThuTucHanhChinh)
                    });
                }

                return new OkObjectResult(resultDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi lấy danh sách hồ sơ của người dùng {UserId}", user.Id);
                return new ObjectResult(new { message = "Lỗi máy chủ." }) { StatusCode = 500 };
            }
        }

        public async Task<IActionResult> UpdateHoSoAsync(string soBienNhan, UpdateHoSoDto dto, ClaimsPrincipal userPrincipal)
        {
            var user = await _userManager.GetUserAsync(userPrincipal);
            if (user == null)
            {
                return new UnauthorizedObjectResult(new { message = "Người dùng không hợp lệ." });
            }

            try
            {
                var hoSo = await _hoSoCollection.Find(h => h.SoBienNhan == soBienNhan).FirstOrDefaultAsync();

                if (hoSo == null)
                {
                    return new NotFoundObjectResult(new { message = "Không tìm thấy hồ sơ." });
                }

                // **KIỂM TRA QUYỀN SỞ HỮU**
                if (hoSo.UserId != user.Id)
                {
                    return new ForbidResult(); // 403 Forbidden
                }

                // **KIỂM TRA TRẠNG THÁI HỒ SƠ** (Tùy chọn, nhưng rất nên có)
                // Ví dụ: chỉ cho phép sửa khi hồ sơ ở trạng thái "Đã nộp", chưa được "Tiếp nhận"
                if (hoSo.TrangThaiHoSo != HoSoStatus.DaNop)
                {
                    return new BadRequestObjectResult(new { message = "Không thể chỉnh sửa hồ sơ đã được tiếp nhận xử lý." });
                }

                // PHẦN SANITIZATION
                dto.NguoiNopDon.HoTen = SanitizeToPlainText(dto.NguoiNopDon.HoTen);
                dto.NguoiNopDon.DiaChi = !string.IsNullOrEmpty(dto.NguoiNopDon.DiaChi) ? SanitizeToPlainText(dto.NguoiNopDon.DiaChi) : null;
                dto.ThongTinThuaDat.DiaChi = !string.IsNullOrEmpty(dto.ThongTinThuaDat.DiaChi) ? SanitizeToPlainText(dto.ThongTinThuaDat.DiaChi) : null;

                if (dto.GiayToDinhKem != null)
                {
                    foreach (var giayTo in dto.GiayToDinhKem)
                    {
                        giayTo.TenLoaiGiayTo = SanitizeToPlainText(giayTo.TenLoaiGiayTo);
                    }
                }
                // ================== KẾT THÚC PHẦN SANITIZATION ==================

                // Cập nhật thông tin người nộp đơn
                var nguoiNopUpdate = Builders<NguoiNopDon>.Update
                    .Set(n => n.HoTen, dto.NguoiNopDon.HoTen)
                    .Set(n => n.GioiTinh, dto.NguoiNopDon.GioiTinh)
                    .Set(n => n.NgaySinh, dto.NguoiNopDon.NgaySinh)
                    .Set(n => n.NamSinh, dto.NguoiNopDon.NamSinh)
                    .Set(n => n.SoCCCD, dto.NguoiNopDon.SoCCCD)
                    .Set(n => n.DiaChi, dto.NguoiNopDon.DiaChi)
                    .Set(n => n.SoDienThoai, dto.NguoiNopDon.SoDienThoai)
                    .Set(n => n.Email, dto.NguoiNopDon.Email);
                await _nguoiNopDonCollection.UpdateOneAsync(n => n.HoSoId == hoSo.Id, nguoiNopUpdate);

                // Cập nhật thông tin thửa đất
                var thuaDatUpdate = Builders<ThongTinThuaDat>.Update
                    .Set(t => t.SoThuTuThua, dto.ThongTinThuaDat.SoThuTuThua)
                    .Set(t => t.SoHieuToBanDo, dto.ThongTinThuaDat.SoHieuToBanDo)
                    .Set(t => t.DiaChi, dto.ThongTinThuaDat.DiaChi);
                await _thongTinThuaDatCollection.UpdateOneAsync(t => t.HoSoId == hoSo.Id, thuaDatUpdate);

                // Cập nhật giấy tờ đính kèm
                await _giayToDinhKemCollection.DeleteManyAsync(g => g.HoSoId == hoSo.Id);
                if (dto.GiayToDinhKem != null && dto.GiayToDinhKem.Any())
                {
                    var newGiayToList = dto.GiayToDinhKem.Select(g => new GiayToDinhKem
                    {
                        HoSoId = hoSo.Id,
                        TenLoaiGiayTo = g.TenLoaiGiayTo,
                        DuongDanTapTin = g.DuongDanTapTin
                    }).ToList();
                    await _giayToDinhKemCollection.InsertManyAsync(newGiayToList);
                }

                _logger.LogInformation("Hồ sơ {SoBienNhan} được cập nhật bởi người dùng {UserId}", soBienNhan, user.Id);
                return new OkObjectResult(new { message = "Cập nhật hồ sơ thành công!" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi cập nhật hồ sơ {SoBienNhan}", soBienNhan);
                return new ObjectResult(new { message = "Lỗi máy chủ." }) { StatusCode = 500 };
            }
        }

        // Các phương thức hỗ trợ
        private async Task<string> GetTenThuTucHanhChinhById(string id)
        {
            var jsonFilePath = Path.Combine(_webHostEnvironment.ContentRootPath, "Data", "ThuTucHanhChinh.json");
            if (!System.IO.File.Exists(jsonFilePath)) return "Không xác định";

            var jsonText = await System.IO.File.ReadAllTextAsync(jsonFilePath);
            // var thuTucList = JsonSerializer.Deserialize<List<ThuTucHanhChinh>>(jsonText, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
            var thuTucList = System.Text.Json.JsonSerializer.Deserialize<List<ThuTucHanhChinh>>(jsonText, new System.Text.Json.JsonSerializerOptions { PropertyNameCaseInsensitive = true });

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

        /// <summary>
        /// Phân tích một chuỗi HTML và trả về nội dung văn bản thuần túy (plain text).
        /// Phương thức này loại bỏ tất cả các thẻ HTML và trả về văn bản một cách chính xác.
        /// </summary>
        /// <param name="html">Chuỗi đầu vào có thể chứa mã HTML.</param>
        /// <returns>Chuỗi văn bản thuần túy đã được làm sạch.</returns>
        private string SanitizeToPlainText(string html)
        {
            if (string.IsNullOrEmpty(html))
            {
                return html;
            }

            // 1. Khởi tạo một parser HTML
            var parser = new HtmlParser();

            // 2. Phân tích chuỗi đầu vào thành một tài liệu HTML
            var document = parser.ParseDocument(html);

            // 3. Trích xuất nội dung văn bản thô (có thể chứa nhiều khoảng trắng thừa)
            string rawText = document.Body.TextContent;

            // 4. Thay thế một hoặc nhiều ký tự khoảng trắng bằng một dấu cách duy nhất
            // và cắt bỏ khoảng trắng ở hai đầu (Trim).
            string cleanedText = Regex.Replace(rawText, @"\s+", " ").Trim();

            return cleanedText;
        }
    }
}