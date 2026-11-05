# Language-Web — Deutsch Lernen (Menschen A1)

Website tự học tiếng Đức theo khung Menschen A1, giao diện tiếng Việt. Nội dung
Lektion 1 là dữ liệu mẫu, tiến độ được lưu trong `localStorage`; chưa có tài khoản
hay đồng bộ cloud.

Phần **Writing** có thể gọi Gemini qua một Route Handler phía server để chấm bài.
Nếu chưa cấu hình API key hoặc Gemini lỗi, ứng dụng tự động quay về bộ chấm cục bộ
`local-demo-v1` và giữ nguyên bản nháp.

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
| AI Writing | Gemini 3.8 Flash (tùy chọn), gọi qua Route Handler |

## Chạy dự án

Yêu cầu Node.js 20+ (đã kiểm tra với Node 24).

```bash
npm install
npm run dev        # http://localhost:3000
```

Các lệnh khác:

```bash
npm run build      # build production, 17 trang tĩnh + 1 API route động
npm run start      # chạy bản build
npm run lint       # ESLint (Next core-web-vitals + TypeScript)
npm run typecheck  # tsc --noEmit
```

### Cấu hình Gemini cho Writing

Tạo `.env.local` từ mẫu:

```bash
cp .env.example .env.local
```

```bash
# .env.local — chỉ dùng phía server, không đặt sau NEXT_PUBLIC_
GEMINI_API_KEY=your-api-key
GEMINI_MODEL=gemini-3.8-flash
GEMINI_FALLBACK_MODEL=gemini-3.5-flash-lite
```

Lấy API key tại [Google AI Studio](https://aistudio.google.com/api-keys). Không
commit `.env.local`. Trên Vercel, thêm các biến này tại **Settings → Environment
Variables** rồi redeploy.

- Không có `GEMINI_API_KEY`: Writing vẫn hoạt động với bộ chấm cục bộ.
- `GEMINI_MODEL` không bắt buộc; mặc định là `gemini-3.8-flash`. Có thể đổi sang
  `gemini-3.5-flash-lite` nếu cần nhanh/rẻ hơn.
- `GEMINI_FALLBACK_MODEL` không bắt buộc; mặc định là `gemini-3.5-flash-lite`.
  Khi model chính trả 503/429 hoặc timeout, route thử model dự phòng một lần.
- Toàn bộ lần chấm có budget **24 giây** (14 giây cho model chính, 10 giây cho
  model dự phòng). Quá hạn sẽ tự động chấm cục bộ, tránh bị Vercel cắt ở 60 giây.
- API key chỉ được đọc trong Route Handler `src/app/api/writing/review/route.ts`;
  không bao giờ gửi xuống trình duyệt.

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
- **Writing:** 2 đề viết, lưu nháp tự động, đếm từ. Khi có `GEMINI_API_KEY`, bài
  được gửi tới Gemini 3.8 Flash để chấm ngữ pháp, từ vựng, mức độ đáp ứng đề và
  nhận xét bằng tiếng Việt; nếu lỗi hoặc chưa cấu hình, tự động dùng bộ chấm cục bộ.
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

- **Chưa có tài khoản/đồng bộ cloud.** Tiến độ chỉ nằm trong `localStorage` của
  từng trình duyệt; backend duy nhất hiện tại là Route Handler chấm Writing.
- **Writing có hai chế độ.** Có `GEMINI_API_KEY` thì dùng Gemini; không có key,
  hết quota hoặc API lỗi thì tự động dùng bộ chấm cục bộ `local-demo-v1` (quy tắc
  độ dài, từ vựng, chia động từ, viết hoa danh từ). Model chính quá tải sẽ được
  thử lại một lần bằng `GEMINI_FALLBACK_MODEL`; UI hiển thị rõ nguồn chấm.
- **Gemini free tier có giới hạn rất thấp.** Với Gemini 3.8 Flash hiện tại:
  khoảng **5 request/phút** và **20 request/ngày** cho mỗi project. Mỗi lần bấm
  chấm là một request; retry cũng tính. Hết quota, route tự chuyển sang chấm cục
  bộ và báo rõ trong UI. Muốn dùng thường xuyên nên bật billing hoặc dùng model
  khác có quota cao hơn.
- **Gemini free tier có thể dùng nội dung để cải thiện sản phẩm.** Không nhập
  thông tin cá nhân nhạy cảm vào bài viết. Nếu cần privacy cao hơn, dùng paid tier
  của Gemini hoặc thay provider.
- **Rate limit Writing là in-memory** (12 request/10 phút/IP). Phù hợp cho dự án
  cá nhân; nếu mở công khai, thay bằng Redis/Upstash để giới hạn đáng tin cậy.
- **Speaking không chấm AI.** Chỉ shadowing, thu âm demo và tự đánh giá.
- **Audio là Web Speech API**, phụ thuộc giọng `de-DE` của trình duyệt/hệ điều
  hành; chưa có tệp audio thật.
- **Chỉ Lektion 1 có nội dung.** Lektion 2–4 là dữ liệu khung "Sắp có".
- Nội dung học liệu cần được kiểm tra quyền sử dụng trước khi xuất bản công khai.

## Cấu trúc mã nguồn

```text
src/
  app/                    # Route và màn hình (App Router)
    api/writing/review/   # POST chấm Writing, GET trạng thái cấu hình
    arbeitsbuch/          # Thư viện + runner bài tập
    kursbuch/             # Từ vựng, ngữ pháp
    lektion/[lessonId]/   # Tổng quan bài học
    practice/             # reading, listening, writing, speaking
  components/             # App shell, UI dùng chung, providers
  data/content.ts         # Toàn bộ nội dung mẫu Lektion 1
  lib/                    # progress, settings, speech, grading, writing-review
    writing-ai-config.ts  # đọc GEMINI_API_KEY / GEMINI_MODEL phía server
    writing-review.ts     # bộ chấm cục bộ + type WritingReview
    writing-review-gemini.ts # prompt, JSON schema, gọi Gemini
```

## API chấm Writing

`POST /api/writing/review`

```json
{
  "promptId": "writing-1",
  "text": "Ich heiße Minh Anh. Ich komme aus Vietnam."
}
```

Phản hồi thành công:

```json
{
  "review": {
    "score": 8.5,
    "summary": "…",
    "criteria": [{ "id": "grammar", "label": "Ngữ pháp", "score": 8.5, "comment": "…" }],
    "errors": [
      {
        "type": "grammar",
        "excerpt": "Ich komme aus Vietnam",
        "correction": "…",
        "explanation": "…"
      }
    ],
    "suggestedText": "…",
    "model": "gemini-3.8-flash",
    "provider": "gemini",
    "isDemo": false
  },
  "provider": "gemini",
  "fallback": false
}
```

Khi Gemini lỗi hoặc chưa cấu hình, route trả HTTP 200 với `provider: "local"`,
`fallback: true`, `reason` (`timeout`, `unavailable`, `rate_limited`, `api_error`,
`invalid_response`, `not_configured`) và `notice`; UI hiển thị thông báo tương ứng
và vẫn lưu bài. Route tự thử model dự phòng một lần và luôn trả trong khoảng 24
giây. Lỗi đầu vào trả 400/404; vượt rate limit trả 429 kèm `Retry-After`.

## Kiểm tra đã chạy

- `npm run build`: 17 trang tĩnh/SSG + API route động thành công.
- `npx tsc --noEmit` và `npx eslint . --max-warnings=0`: sạch.
- Playwright: 11 route desktop + 4 route mobile trả HTTP 200, không lỗi console,
  không tràn ngang.
- 8 luồng tương tác: từ vựng, ngữ pháp, bài tập (5/5 + làm lại), đọc (4/4), nghe
  (100%), Writing (nháp + nhận xét + khôi phục sau reload), Speaking (tự đánh giá
  + đề nói), reset tiến độ.
- Route Writing đã kiểm tra fallback khi chưa có key, validation 400/404 và cấu
  hình qua `GET /api/writing/review`. Cần thêm key thật để kiểm thử end-to-end
  với Gemini.
