export function HowToUse() {
  return (
    <section className="max-w-2xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-orange-500 font-vi mb-2">📖 Hướng dẫn sử dụng</h2>
        <p className="text-gray-500 font-vi">Chọn kiểu gõ phù hợp và bắt đầu học!</p>
      </div>

      {/* Section: Gõ phím */}
      <div className="bg-white rounded-2xl border-2 border-orange-100 p-5 space-y-3">
        <h3 className="text-xl font-bold text-orange-500 font-vi">⌨️ Luyện gõ phím</h3>
        <p className="text-gray-600 font-vi text-sm">
          Chọn cấp độ từ Người mới đến Chuyên gia. Mỗi bài gồm nhiều màn hình — gõ xong tất cả để xem kết quả: tốc độ (WPM), độ chính xác và sao nhận được.
        </p>
        <div className="grid grid-cols-2 gap-2 text-sm font-vi">
          <div className="bg-green-50 rounded-xl p-3">
            <span className="font-bold text-green-700">🌱 Người mới</span>
            <p className="text-gray-500 mt-1">Từ đơn: con mèo, quả táo…</p>
          </div>
          <div className="bg-blue-50 rounded-xl p-3">
            <span className="font-bold text-blue-700">🌿 Trung cấp</span>
            <p className="text-gray-500 mt-1">Cụm từ: mẹ nấu cơm ngon…</p>
          </div>
          <div className="bg-purple-50 rounded-xl p-3">
            <span className="font-bold text-purple-700">🌺 Nâng cao</span>
            <p className="text-gray-500 mt-1">Câu đầy đủ: Con mèo ngủ…</p>
          </div>
          <div className="bg-yellow-50 rounded-xl p-3">
            <span className="font-bold text-yellow-700">🏆 Chuyên gia</span>
            <p className="text-gray-500 mt-1">Đoạn văn ngắn nhiều câu</p>
          </div>
        </div>
      </div>

      {/* Section: Kiểu gõ */}
      <div className="bg-white rounded-2xl border-2 border-orange-100 p-5 space-y-4">
        <h3 className="text-xl font-bold text-orange-500 font-vi">🖱️ Các kiểu gõ tiếng Việt</h3>

        <div className="space-y-3 text-sm font-vi">
          <div className="border border-gray-100 rounded-xl p-4">
            <p className="font-bold text-gray-700 mb-2">Telex <span className="font-normal text-gray-400">(phổ biến nhất)</span></p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-gray-600">
              <span><code className="bg-gray-100 px-1 rounded">aa</code> → â</span>
              <span><code className="bg-gray-100 px-1 rounded">aw</code> → ă</span>
              <span><code className="bg-gray-100 px-1 rounded">ow</code> → ơ</span>
              <span><code className="bg-gray-100 px-1 rounded">uw</code> → ư</span>
              <span><code className="bg-gray-100 px-1 rounded">ee</code> → ê</span>
              <span><code className="bg-gray-100 px-1 rounded">oo</code> → ô</span>
              <span><code className="bg-gray-100 px-1 rounded">dd</code> → đ</span>
              <span></span>
              <span><code className="bg-gray-100 px-1 rounded">s</code> → sắc (á)</span>
              <span><code className="bg-gray-100 px-1 rounded">f</code> → huyền (à)</span>
              <span><code className="bg-gray-100 px-1 rounded">r</code> → hỏi (ả)</span>
              <span><code className="bg-gray-100 px-1 rounded">x</code> → ngã (ã)</span>
              <span><code className="bg-gray-100 px-1 rounded">j</code> → nặng (ạ)</span>
            </div>
            <p className="mt-2 text-orange-500">Ví dụ: gõ <code className="bg-gray-100 px-1 rounded">vieejt</code> → <strong>viết</strong></p>
          </div>

          <div className="border border-gray-100 rounded-xl p-4">
            <p className="font-bold text-gray-700 mb-2">VNI <span className="font-normal text-gray-400">(dùng số)</span></p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-gray-600">
              <span><code className="bg-gray-100 px-1 rounded">a6</code> → â</span>
              <span><code className="bg-gray-100 px-1 rounded">a8</code> → ă</span>
              <span><code className="bg-gray-100 px-1 rounded">o7</code> → ơ</span>
              <span><code className="bg-gray-100 px-1 rounded">u7</code> → ư</span>
              <span><code className="bg-gray-100 px-1 rounded">e6</code> → ê</span>
              <span><code className="bg-gray-100 px-1 rounded">o6</code> → ô</span>
              <span><code className="bg-gray-100 px-1 rounded">d9</code> → đ</span>
              <span></span>
              <span><code className="bg-gray-100 px-1 rounded">1</code> → sắc (á)</span>
              <span><code className="bg-gray-100 px-1 rounded">2</code> → huyền (à)</span>
              <span><code className="bg-gray-100 px-1 rounded">3</code> → hỏi (ả)</span>
              <span><code className="bg-gray-100 px-1 rounded">4</code> → ngã (ã)</span>
              <span><code className="bg-gray-100 px-1 rounded">5</code> → nặng (ạ)</span>
            </div>
            <p className="mt-2 text-orange-500">Ví dụ: gõ <code className="bg-gray-100 px-1 rounded">vie61t</code> → <strong>viết</strong></p>
          </div>

          <div className="border border-gray-100 rounded-xl p-4">
            <p className="font-bold text-gray-700 mb-2">Trực tiếp (IME) <span className="font-normal text-gray-400">(dùng bộ gõ hệ thống)</span></p>
            <p className="text-gray-600">Bật bộ gõ tiếng Việt trên máy tính (Unikey, Google IME…) và gõ bình thường. CatLearner sẽ nhận ký tự đã được bộ gõ xử lý.</p>
          </div>
        </div>
      </div>

      {/* Section: Viết văn */}
      <div className="bg-white rounded-2xl border-2 border-orange-100 p-5 space-y-2">
        <h3 className="text-xl font-bold text-orange-500 font-vi">✍️ Xưởng viết văn</h3>
        <p className="text-gray-600 font-vi text-sm">
          Viết một đoạn văn ngắn bằng tiếng Việt (tối thiểu 20 ký tự). Miu — AI gia sư thân thiện — sẽ đọc bài, khen điểm hay và sửa lỗi chính tả hoặc ngữ pháp cho bạn!
        </p>
      </div>
    </section>
  );
}
