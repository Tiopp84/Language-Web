# Kế hoạch kỹ thuật — Language Web

Ngày: 05/11/2026. Trạng thái: kế hoạch đề xuất; một **bản demo client-only** đã được
triển khai trong repo (Next.js App Router, dữ liệu mẫu Lektion 1, tiến độ
`localStorage`). Bản demo chưa có backend Gemini, IndexedDB, auth hay deployment.
Nguồn yêu cầu: PRD Website Menschen A1 v0.1, 10 trang, ngày 03/11/2026.

> Ghi chú hiện trạng: các mục dưới đây mô tả kiến trúc đích. Demo hiện tại giữ
> đúng phạm vi nghiệp vụ (ba nhóm độc lập, ID ổn định, Writing local-demo) nhưng
> đơn giản hóa tổ chức mã: nội dung trong `src/data/content.ts`, tiến độ trong
> `src/lib/progress.tsx`. Khi thêm backend, thay các lớp này theo hợp đồng đã nêu.

## 1. Quyết định đề xuất

Xây một ứng dụng Next.js + TypeScript theo module, triển khai trên Vercel Hobby. Học liệu JSON được kiểm tra trước khi build; tiến độ và bài viết lưu IndexedDB. Backend ban đầu chỉ phục vụ Writing qua Gemini. Chưa cần Render, database cloud, CMS hay microservices.

Mục tiêu chi phí hạ tầng ban đầu là 0 USD/tháng trong hạn mức miễn phí, dùng tên miền được nền tảng cấp. Đây là mục tiêu có điều kiện, không phải cam kết miễn phí vĩnh viễn. Gemini phải có model/free tier khả dụng cho tài khoản và khu vực của người dùng. Khi hết quota, giữ bản nháp và báo thử lại; không tự chuyển sang dịch vụ trả phí.

“Dễ mở rộng” nghĩa là thêm bài học bằng dữ liệu, thay nơi lưu tiến độ hoặc nhà cung cấp AI qua một lớp tích hợp nhỏ. Không có kiến trúc đảm bảo tuyệt đối không phát sinh nợ kỹ thuật; kiểm soát bằng ranh giới module, kiểm thử nghiệp vụ và danh sách việc hoãn rõ ràng.

## 2. Phạm vi phải giữ theo PRD

- Ba nhóm độc lập: Kursbuch, Arbeitsbuch, Practice 4 Skills. Không bắt học tuần tự.
- Kursbuch: từ vựng, ngữ pháp; Arbeitsbuch: bài theo tham chiếu sách và bài tự tạo, phân biệt nguồn.
- Bài tập: trắc nghiệm, đúng/sai, điền từ/chia động từ, sắp xếp câu; chấm bằng đáp án cấu hình.
- Listening: dictation; Reading: văn bản và câu hỏi; Writing: đặt câu/đoạn văn với Gemini; Speaking: shadowing và đề tự luyện, không chấm AI.
- Một Lektion mẫu hoàn chỉnh trước khi nhân rộng. Không tự giả định số Lektion hoặc phiên bản sách.
- Dashboard, lưu tiến độ, reset có xác nhận, responsive và thao tác bàn phím nằm trong MVP.
- Nội dung phải có nguồn/quyền; chưa được xuất bản thì không được lọt vào bundle hoặc thư mục public.

Auth, cloud sync, spaced repetition, CMS và ghi âm Speaking là phần mở rộng. Việc chủ động hoãn chúng không phải thiếu tính năng P0. Export/import là P1 theo PRD; đề xuất kéo bản đơn giản lên trước khi dùng hằng ngày để bảo vệ dữ liệu cá nhân.

## 3. Lựa chọn dịch vụ

| Thành phần | Bắt đầu | Khi cần mở rộng |
| --- | --- | --- |
| Web và API Writing | Next.js, TypeScript, Vercel Hobby | Nâng gói hoặc chuyển Node hosting khi có nhu cầu thực tế |
| UI | React, CSS/Tailwind, component dùng chung vừa đủ | Bổ sung design system theo nhu cầu |
| Học liệu | JSON trong repo, schema Zod, nội dung văn bản có cấu trúc | CMS/database cung cấp cùng hợp đồng dữ liệu |
| Tiến độ | IndexedDB, adapter nhỏ bằng Dexie | Supabase Postgres + Auth + RLS, giữ local cache |
| AI | Gemini qua API server, model cấu hình bằng biến môi trường | Thay adapter/model, thêm quota theo user |
| Audio | Tệp tự tạo/có quyền; Web Speech API cho phát âm khi khả dụng | Object storage/CDN khi media tăng |
| Kiểm thử | Vitest cho nghiệp vụ, Playwright cho hành trình chính | CI giữ cùng kiểm tra trên mỗi thay đổi |

Các giới hạn đã đối chiếu tài liệu chính thức:

- [Vercel Hobby](https://vercel.com/docs/plans/hobby): dành cho cá nhân, phi thương mại; cần đánh giá lại gói khi thương mại hóa. Không coi mở rộng số người dùng là tự động còn phù hợp điều khoản.
- [Render Free](https://render.com/docs/free): web service ngủ sau 15 phút không có traffic; PostgreSQL miễn phí hết hạn sau 30 ngày; filesystem của web service không dùng làm kho dữ liệu bền vững. Không chọn Render Postgres Free cho tiến độ lâu dài.
- [Supabase billing](https://supabase.com/docs/guides/platform/billing-on-supabase): Free có 500 MB database mỗi project. [Project pausing](https://supabase.com/docs/guides/platform/free-project-pausing): hoạt động thấp trong 7 ngày có thể bị pause. Chỉ thêm khi có nhu cầu đồng bộ và có cách sao lưu/khôi phục.
- [Gemini pricing](https://ai.google.dev/gemini-api/docs/pricing): miễn phí phụ thuộc model; dữ liệu ở free tier có thể được dùng cải thiện sản phẩm theo chính sách áp dụng. [Rate limits](https://ai.google.dev/gemini-api/docs/rate-limits): kiểm tra quota thực trong AI Studio, không ghi cứng một số request/ngày được giả định là vĩnh viễn.

Chốt phiên bản dependency còn được hỗ trợ lúc scaffold, commit lockfile và pin runtime. Không dùng `latest` thả nổi trong deployment. Không cần đồng thời Vercel và Render cho MVP này.

## 4. Ranh giới mã nguồn

```text
src/
  app/                       # Routes, layout, API; chỉ điều phối
  features/
    vocabulary/ grammar/ exercises/
    listening/ reading/ writing/ speaking/ progress/
  domain/                    # Types, chấm bài, dictation, tính tiến độ
  content/                   # Schemas, truy vấn catalog, kiểm tra liên kết
  infrastructure/
    persistence/             # IndexedDB, migrations
    ai/                      # Gemini adapter, server-only
  config/                    # Config đã validate; tách server/public
  components/                # Thành phần UI thực sự dùng chung
content/                     # JSON tự biên soạn hoặc được phép
public/audio/                # Chỉ media đã được phép xuất bản
scripts/                     # Validate nội dung và kiểm tra quyền xuất bản
tests/                       # Kiểm thử nghiệp vụ và UAT
```

UI gọi use case của feature; use case dùng hàm domain hoặc adapter. Domain không import React, Next.js, Gemini SDK hoặc IndexedDB. Không để component tự fetch Gemini hay tự ghi database.

Chỉ cần ba hợp đồng ban đầu: `ContentRepository`, `ProgressRepository`, `WritingReviewer`. Không tạo một framework plugin, generic repository cho mọi thứ hoặc hệ thống dependency injection lớn. Một điểm khởi tạo nối adapter với use case là đủ.

Next.js được chọn để web và API nằm cùng repo và origin. Không dùng dịch vụ độc quyền Vercel trong logic học/chấm bài. Chuyển host vẫn cần điều chỉnh build, secrets và vận hành; adapter không có nghĩa là di chuyển miễn phí hoàn toàn.

## 5. Dữ liệu và “không hard code”

### Học liệu

- Mọi tài nguyên có `id` ổn định, `schemaVersion`, `contentVersion`, `module`, `feature`, `levelId`, `lessonId?`, `topicIds`, `sourceType`, `sourceReference`, `rightsStatus`, `publishable`.
- ID không dựa vào index mảng, tên hiển thị hay vị trí bài. Đổi tên/đổi thứ tự không làm mất lịch sử. Không tái sử dụng ID đã xóa cho nội dung khác.
- Schema riêng cho từng dạng bài bằng discriminated union. `exerciseType` quyết định renderer; thêm bài cùng dạng chỉ cần thêm JSON. Thêm dạng tương tác mới vẫn cần code và kiểm thử.
- Dữ liệu từ loại cũng dùng union: danh từ có giống/mạo từ/số nhiều; động từ có thông tin chia khi áp dụng. Trường chưa biết hiển thị “chưa cập nhật”.
- Mỗi câu có `answerKeys`, `explanation`, `normalizationPolicy`. Chuẩn hóa Unicode NFC và khoảng trắng; không tự biến ä/ö/ü thành a/o/u hoặc ß thành ss. Quy tắc chữ hoa, dấu câu và đáp án thay thế cấu hình theo câu.
- Dictation dùng căn chỉnh chuỗi từ để phân biệt đúng/sai/thiếu/thừa. Không chỉ so sánh từ ở cùng index vì một từ thiếu sẽ làm sai cả phần sau.
- Giữ ba module theo PRD trong constants/types là hợp lý. Không xây công cụ tự định nghĩa module tùy ý khi chưa có nhu cầu.
- Catalog bài học quyết định điều hướng, tiêu đề và thứ tự; không có `if lessonId === ...` rải trong UI.
- Build phải kiểm tra schema, ID trùng, tham chiếu hỏng, đáp án không thuộc options, media thiếu, nguồn/quyền. Chỉ tài nguyên được duyệt mới vào đầu ra public; không dựa vào ẩn nút trên UI.
- Bài không còn dùng chuyển archived; lưu lại metadata tối thiểu cho lịch sử. Nội dung bản mới không âm thầm thay kết quả lần làm cũ.

### Tiến độ

Tách `Progress`, `Attempt`, `WritingDraft`, `WritingReview`. Khóa tiến độ gồm `profileId + module + feature + contentId`. `profileId` là định danh cục bộ, không phải bằng chứng xác thực.

Attempt có UUID, contentVersion, câu trả lời, kết quả và thời gian. Review lưu bài gốc, phản hồi, model và promptVersion. Chỉ ghi “hoàn thành” theo quy tắc từng feature: nộp bài tập; đánh dấu đã học kiến thức; xác nhận tự luyện Speaking. Không yêu cầu điểm AI Speaking hoặc khóa phần sau theo phần trước.

IndexedDB có migration đánh số phiên bản. Migration không được xóa kho rồi tạo lại. Nếu ghi thất bại/hết dung lượng, phải báo chưa lưu, giữ dữ liệu đang nhập và cho xuất dữ liệu; không hiển thị lưu thành công giả.

LocalStorage chỉ dùng cho tùy chọn nhỏ như theme. Dữ liệu cục bộ thuộc origin và trình duyệt: đổi domain, đổi máy hoặc xóa browser data không tự mang theo tiến độ. Export/import cần version, schema validation, xem trước và xác nhận; import mặc định hợp nhất theo ID, không xóa dữ liệu hiện tại. Chưa có service worker thì không quảng cáo ứng dụng hoạt động offline đầy đủ.

## 6. API Writing và giới hạn chi phí

`POST /api/writing/review` nhận `promptId`, `contentVersion`, `text`, `requestId`; server tự tải đề và rubric tin cậy. Không nhận system prompt/model tùy ý từ client.

Luồng: validate payload và kích thước → kiểm tra quyền gọi → kiểm tra quota → gọi Gemini với timeout → validate JSON phản hồi → trả DTO của ứng dụng. Điểm phải trong 0–10, nhận xét tiếng Việt, bản sửa tiếng Đức, lỗi và gợi ý diễn đạt phân biệt rõ. Trích đoạn lỗi phải đối chiếu được với bài gốc; JSON đúng schema chưa bảo đảm nhận xét đúng về ngôn ngữ.

Các biến cấu hình dự kiến: `GEMINI_API_KEY`, `GEMINI_MODEL`, `WRITING_ENABLED`, `WRITING_MAX_CHARS`, `WRITING_TIMEOUT_MS`, `WRITING_MAX_OUTPUT_TOKENS`, `OWNER_ACCESS_SECRET`, `SESSION_SIGNING_SECRET`. Secrets chỉ phía server, không có tiền tố public; `.env.example` chỉ chứa placeholder. Prompt được version-control riêng, không nhét trong component.

Điểm cần bổ sung so với PRD: server-side key chưa đủ để bảo vệ endpoint công khai. Bản cá nhân có cổng truy cập Writing bằng mật khẩu chủ sở hữu, đổi thành session ký với cookie HttpOnly/Secure/SameSite và thời hạn. Đây là bảo vệ thao tác AI, không phải hệ thống tài khoản học tập. Kiểm tra Origin/CSRF cho request thay đổi trạng thái và giới hạn thử mật khẩu. Không nhúng mật khẩu vào frontend.

Nếu triển khai API ra internet, giới hạn ở gateway hoặc kho đếm dùng chung; biến đếm trong RAM serverless không bảo đảm quota qua nhiều instance. Trước khi bật Writing phải xác minh quota phía nhà cung cấp, giới hạn kích thước/thời gian/output và cơ chế chặn lạm dụng đang hoạt động. Nếu chưa có bảo vệ này, giữ Writing tắt ở production; không tuyên bố MVP đầy đủ cho đến khi bật và nghiệm thu được tính năng.

Mất mạng, timeout, 429, 5xx, JSON sai: giữ bài gốc, hiển thị lỗi phù hợp, không bịa kết quả. Không retry tự động vô hạn; chỉ retry lỗi tạm thời có giới hạn. Khóa nút khi đang gửi; khi phục vụ nhiều người, dùng idempotency store dùng chung cho request đang chạy/đã xong, không chỉ chống trùng trên UI.

Trước khi gửi AI, thông báo bài viết và đề liên quan sẽ gửi tới nhà cung cấp. Log metadata như requestId, latency, error code và token usage nếu có; không log bài viết, secrets hoặc toàn bộ phản hồi mặc định. Không dùng HTML từ AI trực tiếp. Bài học, bài tập và bản nháp Writing vẫn dùng được khi AI không khả dụng.

## 7. Audio

Dictation và shadowing cần audio cố định, có quyền và transcript khớp; dùng tệp mẫu đã chuẩn bị cho Lektion đầu tiên. Không coi Web Speech API là nguồn audio nhất quán trên mọi thiết bị. Phát âm từ vựng có thể dùng giọng tiếng Đức của trình duyệt khi có; nếu không có thì báo rõ hoặc dùng tệp thay thế. Không tự chọn một giọng ngôn ngữ khác rồi coi là hoàn thành yêu cầu phát âm.

Media được tham chiếu qua metadata/base URL, không rải domain storage trong component. Tải audio khi cần, không preload toàn bộ A1. Speaking không gửi microphone lên server, không có chức năng chấm điểm.

## 8. Lộ trình và cửa nghiệm thu

| Mốc | Đầu ra | Điều kiện chuyển bước |
| --- | --- | --- |
| 1. Nền tảng | Scaffold, config, schema, catalog, 3 nhóm điều hướng, CI | Build/typecheck/lint chạy; dữ liệu sai bị chặn; thêm Lektion không sửa UI |
| 2. Kiến thức | Một bài Vocabulary + Grammar đầy đủ | UAT-02/03; lọc/tìm, metadata đúng từ loại, liên kết bài tập đúng |
| 3. Bài tập và tiến độ | Hai nhóm Arbeitsbuch, đủ dạng bài, IndexedDB | UAT-04; đáp án thay thế, Unicode, reload, reset có xác nhận |
| 4. Kỹ năng cố định | Listening, Reading, Speaking và audio hợp lệ | UAT-05/06/08; dictation thiếu/thừa; Speaking không chấm |
| 5. Writing | Gemini thật, bảo vệ endpoint, bản nháp, phản hồi có cấu trúc | UAT-07; timeout/quota/JSON lỗi vẫn giữ bài; API key không ra client |
| 6. Pilot cá nhân | Dashboard, responsive, backup đơn giản, deployment | Đủ UAT-01 đến UAT-10; học trọn một Lektion trên desktop/mobile |

Chưa ấn định số tuần khi chưa biết quỹ thời gian và học liệu có sẵn. Mỗi mốc ra phần hoạt động thật; mock AI chỉ dùng trong test, không thay nghiệm thu tích hợp Gemini.

Kiểm thử tập trung vào lỗi có hậu quả: chấm sai tiếng Đức; dictation lệch từ; migration mất dữ liệu; khôi phục backup; truy cập API trái phép; đầu ra AI sai; publish nhầm nội dung chưa được phép. Playwright kiểm tra đi vào từng nhóm độc lập, làm bài, reload và giữ bản nháp khi API lỗi. CI tối thiểu: validate content, lint, typecheck, unit tests, build; smoke E2E cho thay đổi ảnh hưởng hành trình học.

## 9. Triển khai và vận hành

1. Chuẩn bị repo cá nhân, lockfile, runtime và các lệnh kiểm tra; giữ secrets, `.next`, `node_modules` ngoài Git. Hiện `.gitignore` chỉ có `*.pdf`; khi scaffold cần bổ sung các mục này và cho phép `.env.example`.
2. Deploy preview từ Vercel, cấu hình biến môi trường riêng cho preview/production. Preview không tự nhận secrets production hoặc quyền gọi AI không giới hạn.
3. Kiểm tra artifact/client bundle không có secrets và học liệu chưa duyệt. Chạy smoke test trên URL preview, không chỉ localhost.
4. Xác minh model/quota khả dụng, cổng Writing và xử lý lỗi rồi mới bật AI cho production.
5. Dùng domain production ổn định từ đầu để tránh chia kho tiến độ theo origin. Trước đổi domain, xuất dữ liệu và nhập ở domain mới.
6. Theo dõi lỗi và quota bằng dashboard nền tảng; không cần dịch vụ observability trả phí ở MVP. Không dùng ping giữ Render luôn thức để né giới hạn free tier.
7. Có bản export trước migration lớn. Rollback code không tự rollback IndexedDB; migration cần tương thích với bản cũ hoặc có quy trình khôi phục rõ ràng.

Việc tạo tài khoản, kết nối Git/Vercel và cấp API key cần thông tin của chủ dự án. Tài liệu này chưa thực hiện những thao tác đó và không chứa URL deployment.

## 10. Mở rộng có điều kiện

| Nhu cầu xuất hiện | Thay đổi | Việc phải làm kèm |
| --- | --- | --- |
| Dùng nhiều thiết bị | Supabase Auth + Postgres và sync adapter | RLS theo user, import local có xác nhận, backup/restore |
| Mời bạn bè | Danh tính và quota AI từng user | Bộ đếm dùng chung, rate limiting, thông báo dữ liệu AI, kiểm thử cách ly dữ liệu |
| Học liệu nhiều/người biên soạn khác | CMS hoặc editor với draft/review/publish | Giữ ID/schema, duyệt quyền và validate trước phát hành |
| Audio/bandwidth tăng | Object storage/CDN | Migration URL qua metadata, kiểm tra quyền và dung lượng |
| Có thu phí | Đánh giá lại gói hosting và AI | Ngân sách, điều khoản, backup, vận hành; không mặc định Hobby còn phù hợp |

Cloud sync là một tính năng riêng, không chỉ thay localStorage bằng database. Giữ attempt bất biến với UUID để hợp nhất; progress tính từ lịch sử; không gộp hai bản nháp bằng cách ghi đè âm thầm. Khi có xung đột bản nháp, giữ cả hai cho người dùng chọn. Thao tác xóa/reset cần tombstone hoặc reset event để dữ liệu cũ không tự sống lại sau sync. Chỉ triển khai các cơ chế này khi bắt đầu sync, nhưng giữ ID/contentVersion ngay từ MVP.

## 11. Những việc hoãn có kiểm soát

| Việc hoãn | Chấp nhận ở MVP | Điều kiện xử lý |
| --- | --- | --- |
| Chưa đồng bộ cloud | Một trình duyệt, có export/import đề xuất | Khi thực sự cần nhiều thiết bị/người dùng |
| Chưa CMS | Sửa JSON, validate và deploy lại | Khi quy trình biên soạn trở thành nút thắt |
| Chưa SRS/yêu thích | Học và ôn theo bài đầy đủ | Sau khi pilot chứng minh cần |
| Chưa ghi âm | Shadowing/tự luyện vẫn đủ P0 | Khi cần tự nghe lại giọng |
| Chưa queue AI | Request ngắn, timeout có kiểm soát | Khi có tác vụ dài hoặc nhiều request đồng thời |

Không chấp nhận hoãn: secret an toàn, kiểm tra dữ liệu, nguồn/quyền xuất bản, giữ bài khi lỗi, version/migration tiến độ, tính đúng của chấm bài và đủ các tính năng P0 trước khi gọi là MVP hoàn chỉnh.
