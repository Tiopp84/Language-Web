# Language-Web — Deutsch Lernen (Menschen A1)

Website tự học tiếng Đức theo khung Menschen A1, giao diện tiếng Việt. Đây là bản
**demo chạy hoàn toàn phía client**: toàn bộ nội dung Lektion 1 là dữ liệu mẫu,
tiến độ được lưu trong `localStorage`, chưa có backend, tài khoản hay đồng bộ cloud.

- [Kế hoạch kỹ thuật và lộ trình MVP](docs/technical-plan.md)
- PRD nguồn: `PRD Website Menschen A1.pdf` (tệp cục bộ, bị bỏ qua bởi `.gitignore`).
- Thiết kế tham chiếu: thư mục `GE-design/`.

## Công nghệ

| Thành phần | Lựa chọn |
| --- | --- |
| Framework | Next.js 16 (App Router, Turbopack) |
| UI | React 19, TypeScript, Tailwind CSS 4 |
| Icon | lucide-react |
| Lưu trữ | `localStorage` (React context) |
| Âm thanh | Web Speech API, giọng `de-DE` |

## Chạy dự án

Yêu cầu Node.js 20+ (đã kiểm tra với Node 24).

```bash
npm install
npm run dev        # http://localhost:3000
```

Các lệnh khác:

```bash
npm run build      # build production, 17 route tĩnh
npm run start      # chạy bản build
npm run lint       # ESLint (Next core-web-vitals + TypeScript)
npm run typecheck  # tsc --noEmit
```

## Màn hình và route

| Màn hình | Route |
| --- | --- |
| Dashboard | `/` |
| Tổng quan Lektion | `/lektion/1` |
| Từ vựng Kursbuch | `/kursbuch/vocabulary` |
| Ngữ pháp Kursbuch | `/kursbuch/grammar` |
| Thư viện Arbeitsbuch | `/arbeitsbuch` |
| Làm bài tập | `/arbeitsbuch/[exerciseId]` (6 bài: `wb-1..3`, `ct-1..3`) |
| Luyện đọc | `/practice/reading` |
| Luyện nghe & dictation | `/practice/listening` |
| Luyện viết | `/practice/writing` |
| Luyện nói | `/practice/speaking` |

Ba nhóm **Kursbuch / Arbeitsbuch / Practice** hoạt động độc lập, không bắt học
tuần tự. Lektion 2–4 hiển thị là "Sắp có" chứ không khóa theo thứ tự.

## Chức năng đã có

**Kursbuch**
- Từ vựng có loại từ, phiên âm, nghĩa, ví dụ, động từ chia ngôi, phát âm.
- Tìm kiếm, lọc theo loại từ, đánh dấu "đã học" (lưu tiến độ).
- Ngữ pháp theo chủ đề, ví dụ tương tác, micro-quiz, đánh dấu "đã đọc".

**Arbeitsbuch**
- Thư viện bài tập phân biệt `workbook` (bám sách) và `custom` (tự tạo).
- 4 dạng câu hỏi: trắc nghiệm, đúng/sai, điền từ/chia động từ, sắp xếp câu.
- Chấm theo đáp án cấu hình, phản hồi đúng/sai, xem đáp án, nộp bài, làm lại.
- Bàn phím ký tự Đức (ä, ö, ü, ß) chèn tại vị trí con trỏ.
- Lưu kết quả từng lần làm bài.

**Practice**
- **Reading:** bài đọc A1 + câu hỏi đúng/sai và trắc nghiệm, chấm điểm.
- **Listening:** nghe bằng Web Speech API, tốc độ chậm 0.7x, dictation và so khớp.
- **Writing:** 2 đề viết, lưu nháp tự động, đếm từ, chấm bằng bộ đánh giá cục bộ.
- **Speaking:** shadowing theo câu, thu âm demo bằng trình duyệt (nếu hỗ trợ), tự
  đánh giá theo checklist và đề nói A1. Không chấm phát âm bằng AI.

**Chung**
- Dashboard tiến độ, streak, hoạt động gần đây, điều hướng nhanh.
- Tìm kiếm toàn cục, trợ giúp, thông báo, chỉnh tốc độ giọng đọc.
- Responsive desktop/mobile; có xác nhận trước khi xóa toàn bộ tiến độ.

## Dữ liệu và lưu trữ

Nội dung nằm trong `src/data/content.ts` dưới dạng TypeScript có kiểu, với ID ổn
định cho từng mục (`voc-*`, `gram-*`, `wb-*`, `ct-*`, `reading-1`, `listening-1`,
`writing-1/2`, `sh-*`). Thêm bài cùng dạng chủ yếu là thêm dữ liệu, không cần
sửa logic chấm.

Tiến độ và cài đặt được lưu tại:

| Khóa | Nội dung |
| --- | --- |
| `language-web:progress:v1` | từ đã học, ngữ pháp đã đọc, kết quả bài tập/đọc/nghe, nháp và nhận xét Writing, tự đánh giá Speaking, hoạt động |
| `language-web:settings:v1` | tốc độ giọng đọc |

Nếu dữ liệu trong `localStorage` hỏng hoặc sai phiên bản, ứng dụng bỏ qua và hiển
thị cảnh báo thay vì crash.

## Giới hạn hiện tại (quan trọng)

- **Chưa có backend.** Không có đăng nhập, đồng bộ nhiều thiết bị hay API.
- **Writing dùng bộ chấm cục bộ `local-demo-v1`.** Đây là đánh giá theo quy tắc
  (độ dài, từ vựng, cấu trúc câu), **không phải Gemini** và không gửi văn bản đi
  đâu. UI ghi rõ trạng thái demo. Khi có backend Gemini, thay qua lớp
  `src/lib/writing-review.ts`.
- **Speaking không chấm AI.** Chỉ shadowing, thu âm demo và tự đánh giá.
- **Audio là Web Speech API**, phụ thuộc giọng `de-DE` của trình duyệt/hệ điều
  hành; chưa có tệp audio thật.
- **Chỉ Lektion 1 có nội dung.** Lektion 2–4 là dữ liệu khung "Sắp có".
- Nội dung học liệu cần được kiểm tra quyền sử dụng trước khi xuất bản công khai.

## Cấu trúc mã nguồn

```text
src/
  app/                    # Route và màn hình (App Router)
    arbeitsbuch/          # Thư viện + runner bài tập
    kursbuch/             # Từ vựng, ngữ pháp
    lektion/[lessonId]/   # Tổng quan bài học
    practice/             # reading, listening, writing, speaking
  components/             # App shell, UI dùng chung, providers
  data/content.ts         # Toàn bộ nội dung mẫu Lektion 1
  lib/                    # progress, settings, speech, grading, writing-review
```

## Kiểm tra đã chạy

- `npm run build`: 17 route tĩnh/SSG thành công.
- `npx tsc --noEmit` và `npx eslint . --max-warnings=0`: sạch.
- Playwright: 11 route desktop + 4 route mobile trả HTTP 200, không lỗi console,
  không tràn ngang.
- 8 luồng tương tác: từ vựng, ngữ pháp, bài tập (5/5 + làm lại), đọc (4/4), nghe
  (100%), Writing (nháp + nhận xét + khôi phục sau reload), Speaking (tự đánh giá
  + đề nói), reset tiến độ.
