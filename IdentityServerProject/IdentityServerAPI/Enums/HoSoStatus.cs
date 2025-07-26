// IdentityServerProject/IdentityServerAPI/Enums/HoSoStatus.cs
// Mục đích: Định nghĩa vòng đời hồ sơ 4 trạng thái theo mô hình mới nhất.
namespace IdentityServerAPI.Enums
{
    public enum HoSoStatus
    {
        DaNop = 0,               // Người dùng vừa nộp, chờ cán bộ xem
        DaTiepNhanVaXuLy = 1,    // Cán bộ đã tiếp nhận và đang xử lý
        DaTra = 2,               // Đã hoàn thành và trả kết quả
        TuChoi = 3               // Hồ sơ bị từ chối
    }
}