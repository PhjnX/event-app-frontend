# Luồng test kiểm duyệt Moments trên web

Backend đã triển khai đủ 12 endpoint kiểm duyệt trên
`https://event-app-y77p.onrender.com/api` (kiểm chứng qua `/v3/api-docs`).
Tài liệu này là kịch bản nghiệm thu trên bản web. Chạy xong và thấy ổn thì mới
port sang mobile.

## Chuẩn bị

**Tài khoản** — cần 3, vì chủ bài viết chỉ thấy Sửa/Xoá, nút Báo cáo và Chặn chỉ
hiện trên bài của người khác:

| Vai | Yêu cầu | Dùng để |
|-----|---------|---------|
| **A** | user thường, **đã check-in** một sự kiện | Đăng bài |
| **B** | user thường khác, chỉ cần **đăng nhập** | Báo cáo, chặn |
| **C** | `SADMIN` | Vào `/admin/reports` |

Người báo cáo không cần check-in sự kiện — chỉ người đăng bài mới cần.

**Cách cho A check-in mà không cần ra hiện trường.** Check-in thật đòi organizer
quét QR vé bằng app mobile. Để test trên web, gọi thẳng API — nhanh hơn và không
cần thiết bị nào:

1. Đăng nhập A trên web → `/my-tickets` → bấm copy để lấy `ticketCode`
   (dạng `TICKET-<uuid>`). Vé phải đã được duyệt, chưa duyệt thì trường này là `null`.
2. Mở `https://event-app-y77p.onrender.com/swagger-ui/index.html` → đăng nhập
   bằng tài khoản **organizer sở hữu sự kiện đó** để lấy `accessToken`.
3. Bấm **Authorize**, dán token vào.
4. **Check-In Management** → `POST /api/checkin/event` → body đúng một trường:
   ```json
   { "ticketCode": "TICKET-3f2a8b10-...." }
   ```
5. Trả về 200 kèm `"eventCheckInStatus": "CHECKED_IN"` là xong.

Lưu ý: Swagger hiện schema có 4 trường (`ticketCode`, `activityQrCode`,
`latitude`, `longitude`) vì backend dùng chung DTO cho hai endpoint check-in.
Endpoint này **chỉ đọc `ticketCode`**, ba trường kia bị bỏ qua hoàn toàn.

Nếu nhận 500 kèm chuỗi `"không có quyền check-in"` thì tài khoản organizer đó
không sở hữu sự kiện chứa vé — đăng nhập đúng organizer rồi thử lại. (Đáng ra
backend phải trả 403; họ đã biết và đang sửa.)

Mẹo: mở B ở cửa sổ ẩn danh để không phải đăng xuất qua lại. Bước 5 nên mở 2 tab
song song để thấy feed tự cập nhật.

**Xoá dữ liệu thử cũ.** Vào `/admin/reports` bấm *Xoá dữ liệu thử, chạy lại từ
đầu*. Trong giai đoạn backend chưa xong, client có lưu bài đã ẩn và danh sách
chặn vào `localStorage`; không xoá thì bài từng ẩn cục bộ vẫn ẩn dù server trả về
bình thường.

**Khởi động**

```bash
npm run dev    # http://localhost:3000
```

> ⏱️ Backend chạy Onrender bản free nên ngủ khi không dùng. Lần gọi đầu tiên đo
> được **141 giây** mới phản hồi. Cứ đợi, đừng tưởng hỏng.

## Biết mình đang chạy chế độ nào

Client có một lớp dự phòng: nếu endpoint trả 404/405/501, lỗi mạng, hoặc lỗi 500
kèm thông điệp `No static resource` (Spring trả mã này khi chưa map route), nó
chuyển sang lưu tạm trong `localStorage` để giao diện không vỡ.

Dấu hiệu phân biệt, nhìn ở `/admin/reports`:

- **Không có banner vàng** → đang dùng dữ liệu thật từ server. Đây là điều cần thấy.
- **Có banner vàng "Chế độ thử cục bộ"** → server chưa trả lời được. Mở tab
  Network xem `GET /api/admin/reports` trả mã gì rồi xử lý theo mã đó.

## Kịch bản

### 1. Bắt buộc đồng ý quy tắc trước lần đăng đầu

Tài khoản A → trang Moments của sự kiện đã check-in
(`/vi/event/{slug}/moments`) → soạn nội dung → bấm Đăng.

- ✅ Hiện modal **Quy tắc cộng đồng**, không đăng được nếu chưa đồng ý.
- ✅ Bấm Đồng ý → bài đăng bình thường, và có request
  `POST /api/users/me/accept-content-policy`.
- ✅ Lần đăng sau không hỏi lại.
- ✅ Đăng nhập A ở trình duyệt khác → vẫn **không** bị hỏi lại, vì client đọc
  `contentPolicyAcceptedVersion` từ `GET /api/users/me`.

Đăng **2–3 bài có ảnh** để có dữ liệu cho các bước sau.

### 2. Người dùng báo cáo

Tài khoản B → cùng trang Moments → bài của A → nút **…** → **Báo cáo**.

- ✅ Modal hiện đủ 8 lý do.
- ✅ Gửi xong bài biến mất khỏi feed của B ngay, không chờ server.
- ✅ Network: `POST /api/events/{eventId}/moments/{momentId}/report` trả **200**.
- ✅ Báo cáo lại đúng bài đó lần nữa → server trả **409**, giao diện vẫn coi là
  thành công, **không** hiện lỗi đỏ.
- ✅ Tải lại trang, bài vẫn ẩn với B.

### 3. Chặn người dùng

Tài khoản B → bài khác của A → **…** → **Chặn người dùng này**.

- ✅ Toàn bộ bài của A biến mất khỏi feed của B.
- ✅ `POST /api/users/{userId}/block` trả 200.
- ✅ Vào `/blocked-users` thấy A; bấm Bỏ chặn (`DELETE`, trả 204) thì bài hiện lại.
- ✅ Chặn là một chiều: A vẫn thấy bài của B.

### 4. Admin thấy báo cáo

Tài khoản C → `/admin/reports`.

- ✅ **Không** có banner vàng.
- ✅ Báo cáo B vừa gửi có trong danh sách, kèm ảnh, caption, **tên tác giả và tên
  người báo cáo** (đây là chỗ tên trường backend và client từng lệch nhau — nếu
  thấy ô trống thì báo lại ngay).
- ✅ Lý do nghiêm trọng (CSAE / tình dục / khoả thân) đẩy lên đầu và tô đỏ.
- ✅ Tab **Tất cả** load được — client bỏ hẳn tham số `status` cho tab này vì
  server chỉ nhận `PENDING | RESOLVED | DISMISSED`.
- ✅ Nhãn xám "bài đã bị xoá" hiện đúng với báo cáo mà moment gốc đã bị xoá.

### 5. Admin gỡ bài → feed cập nhật

Mở 2 tab: tab 1 là feed của A (chủ bài viết), tab 2 là `/admin/reports`.

Ở tab 2, mở báo cáo → nhập lý do → **Gỡ bài**.

- ✅ `POST /api/admin/moments/{momentId}/remove` trả 200, báo cáo chuyển **Đã gỡ bài**.
- ✅ Tab 1: bài biến mất (server đẩy `{"type":"DELETE","data":<id>}` qua WebSocket).
- ✅ Đăng nhập B xem lại: bài đã biến mất.
- ✅ Bấm **Bỏ qua** trên một báo cáo khác → `restore` trả 200, bài hiển thị lại.
- ⚠️ Gỡ một bài đã gỡ rồi → server trả **400**. Đúng thiết kế, không phải lỗi.

### 6. Tự động ẩn khi lý do nghiêm trọng

Tài khoản B báo cáo một bài với lý do **Xâm hại trẻ em (CSAE)**.

- ✅ Bài chuyển `UNDER_REVIEW` ngay chỉ với 1 báo cáo, không cần admin làm gì.
- ✅ Người khác không còn thấy bài đó.
- ✅ **Chủ bài viết (A) vẫn thấy, kèm nhãn "đang kiểm duyệt"** — sau khi refresh,
  vì server đẩy `DELETE` qua WebSocket cho mọi người kể cả chủ bài.
- ✅ A thử **sửa** bài đang `UNDER_REVIEW` → server trả 400. Đây là chốt chặn
  không cho thay ảnh vi phạm bằng ảnh sạch trong lúc chờ duyệt.

Ngưỡng 3 người báo cáo khó thử với ít tài khoản, nên dùng CSAE để kiểm chứng cơ
chế auto-hide.

### 7. Tạm khoá quyền đăng bài

Tài khoản C → mở một báo cáo → **Khoá đăng bài 7 ngày**.

- ✅ `POST /api/admin/users/{userId}/suspend` trả 200.
- ✅ A thử đăng bài mới → hiện **nguyên văn** thông điệp của server, có kèm mốc
  thời gian cụ thể ("...đang bị tạm khoá quyền đăng nội dung đến 14:30 15/09/2026"),
  chứ không phải thông báo lỗi chung chung.
- ✅ Các chức năng khác của A (xem sự kiện, đăng ký vé) vẫn bình thường.

## Điểm cần xác nhận trong tab Network

**`GET /api/users/me` có trả field `id` kiểu số không.** Feed dùng
`user?.id !== m.userId` để biết ai là chủ bài viết. Model User có cả `uid` (chuỗi)
lẫn `id` (số), nhưng ví dụ tài liệu backend chỉ nhắc `uid`. Nếu thiếu `id` thì
**chủ bài viết sẽ không thấy bài `UNDER_REVIEW` của mình** ở bước 6 — mất đúng
hành vi Google yêu cầu.

## Việc còn treo với backend

- `GET /api/admin/reports` chưa có `eventName`, chỉ có `eventId`. Giao diện hiện
  `{tác giả} · {tên sự kiện} · {thời gian}` nên đang thiếu tên sự kiện. Không vỡ,
  chỉ mất thông tin.
- Đặc tả OpenAPI khai báo response của endpoint này là `type: object` chung chung,
  không nói tên trường. Client đang ánh xạ phòng cả hai cách đặt tên
  (`ownerUsername` lẫn `authorName`) nên không vỡ dù thực tế lệch tài liệu.
- Mục 5.2: giữ `DELETE` thay vì đổi sang `UPDATE` kèm status — xem lý do trong
  trao đổi với backend.
