# Cách làm việc của nhóm Travelplan

Thành viên (cả 4 đều là dev): Dương (@25540008), Khôi (@khoi41807-source), Hà (@dnh-uit), Phượng (@phuongtruong282).

Yêu cầu: [docs/SRS.md](docs/SRS.md) (bản Word/PDF trong `docs/`). Việc cần làm: các Issue `[TP-xx]` và [Project board](https://github.com/users/25540008/projects/1).

## Lịch sprint (sprint 1 tuần, Thứ Năm đến Thứ Tư)

| Sprint | Thời gian | Mục tiêu | Use case |
|---|---|---|---|
| S1 · Khởi động và tài khoản | 22/10 – 28/10 | Repo, CI/CD, Docker, migration, khung frontend chung; đăng ký, đăng nhập, đăng xuất | 1–3 |
| S2 · Chuyến đi và lịch trình | 29/10 – 04/11 | Danh sách, tạo, sửa, xoá chuyến, ảnh bìa, chia sẻ; lịch trình theo ngày, thêm/sửa/xoá hoạt động | 13–22 |
| S3 · Ngân sách, thời tiết, lịch trình mẫu | 05/11 – 11/11 | Ngân sách và khoản chi, dự báo thời tiết, Trang chủ, tìm và lọc lịch trình mẫu, dùng lại, lưu | 6, 7, 10–12, 24–27 |
| S4 · Điểm đến và mật khẩu | 12/11 – 18/11 | Danh sách và chi tiết điểm đến, thêm địa điểm gợi ý; quên và đặt lại mật khẩu | 4, 5, 8, 9, 23 |
| S5 · Quản trị, sửa lỗi, phát hành | 19/11 – 24/11 | API và trang quản trị điểm đến, sửa lỗi BE/FE, bảo mật, deploy bản cuối | 28 |

Mốc: demo nội bộ cuối S2 (04/11), đóng băng tính năng cuối S4 (18/11), nộp đồ án 24/11.

## Nhịp Scrum

| Buổi | Khi nào | Nội dung |
|---|---|---|
| Sprint Planning | Thứ Năm đầu sprint, 30 phút | Chọn việc vào sprint, chia người, ước lượng điểm |
| Daily (online) | Mỗi tối, 10 phút | Hôm qua làm gì, hôm nay làm gì, đang vướng gì; kéo thẻ cho đúng cột |
| Sprint Review | Thứ Tư cuối sprint | Demo các thẻ ở cột Done trên bản deploy Render |
| Retrospective | Ngay sau Review, 15 phút | Điều gì tốt, điều gì cần đổi ở sprint sau |

## Cột trên board

- **Todo**: việc đã nhận trong sprint, chưa bắt đầu.
- **In Progress**: mỗi người tối đa 2 thẻ cùng lúc.
- **Review**: đã mở PR, chờ 1 người khác duyệt code hoặc kiểm thử.
- **Done**: đạt Definition of Done bên dưới.

## Definition of Done

1. Code khớp luồng hoạt động và bảng Business Rules của use case trong SRS.
2. Giao diện khớp màn hình thiết kế (Screen 1–14), hiển thị đúng thông báo MSG.
3. PR đã được 1 thành viên khác duyệt và merge vào `develop`; CI xanh.
4. Một thành viên khác đã chạy test case của use case và không còn lỗi P1.
5. Đã chạy được trên bản deploy Render.

## Quy ước Git

- Nhánh: `main` (bản phát hành), `develop` (tích hợp), `feature/TP-xx-mo-ta-ngan` cho từng thẻ.
- Commit: `TP-14: Screen 10 đăng nhập, lưu token` (mã thẻ ở đầu để tra ngược về board).
- Mô tả PR ghi `Closes #<số issue>` để issue tự đóng và thẻ tự sang Done khi merge.
- Cuối mỗi sprint merge `develop` vào `main` và gắn tag `v0.x`.

## Label

- `BE` / `FE`: loại việc. `P1` (bắt buộc) / `P2` / `P3` (làm nếu còn thời gian): ưu tiên.
- `module: …`: mảng chức năng (Tài khoản, Chuyến đi, Lịch trình, Ngân sách, …).
- Milestone = sprint, có hạn chót của sprint.
