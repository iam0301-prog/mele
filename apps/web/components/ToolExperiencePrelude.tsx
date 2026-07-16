import type { CalcTool } from '@/lib/api';
import type { Locale } from '@/lib/i18n/config';

type Experience = {
  index: string;
  ritual: string;
  promise: string;
  duration: string;
  input: string;
  reveal: string;
  chapters: [string, string, string];
  chapterDetails: [string, string, string];
  loading: string;
};

type UiCopy = {
  ariaLabel: string;
  revealReady: string;
  revealBody: string;
};

const ZH: Record<CalcTool, Experience> = {
  numerology: { index: '01', ritual: '數字指紋', promise: '找出你反覆使用、卻不一定察覺的性格節奏。', duration: '約 45 秒', input: '只需出生日期', reveal: '核心數字逐層亮起', chapters: ['你的主旋律', '你最自然的優勢', '今天的微行動'], chapterDetails: ['不是標籤，是你常用的應對方式', '看見不費力就能做到的事', '把理解變成一個可完成步驟'], loading: '正在把生日拆成你的數字節奏' },
  maya: { index: '02', ritual: '能量印記', promise: '揭曉你的 Kin 身份，以及你如何啟動、推進與找回節奏。', duration: '約 60 秒', input: '只需出生日期', reveal: '圖騰與五方力量展開', chapters: ['你的 Kin', '你的推進節奏', '你的五方力量'], chapterDetails: ['一眼認出自己的能量印記', '調性如何影響做事方式', '支持、挑戰與隱藏資源'], loading: '正在定位你在 260 天曆中的能量座標' },
  bazi: { index: '03', ritual: '五行氣候', promise: '不背術語，直接看你目前最常使用的力量與容易失衡之處。', duration: '約 2 分鐘', input: '生日、時間、地點', reveal: '日主與五行比例成形', chapters: ['你的日主', '能量氣候', '現在怎麼調整'], chapterDetails: ['先認識最核心的反應方式', '看懂過強與不足的力量', '一個能落地的平衡方向'], loading: '正在排列四柱並校準你的五行氣候' },
  ziwei: { index: '04', ritual: '人生星圖', promise: '從命宮與主星看見你正在扮演的角色，而不是預言命運。', duration: '約 2 分鐘', input: '生日與出生時間', reveal: '十二宮位依序定位', chapters: ['你的核心角色', '目前最有感的宮位', '值得帶走的問題'], chapterDetails: ['命宮與主星的白話版本', '把盤面連回真實生活', '用好問題代替宿命答案'], loading: '正在安放十二宮與你的核心主星' },
  tarot: { index: '05', ritual: '此刻鏡面', promise: '不替你做決定；把混亂縮成現在、阻力與下一步。', duration: '約 90 秒', input: '帶著一個真實問題', reveal: '牌面一張一張翻開', chapters: ['此刻發生什麼', '真正的拉扯', '下一小步'], chapterDetails: ['先描述，不急著下結論', '看見問題背後的張力', '今天就能採取的行動'], loading: '正在為你的問題洗牌並建立牌陣' },
  runes: { index: '06', ritual: '符文路標', promise: '用最少的符號，指出阻力、可用資源與行動方向。', duration: '約 60 秒', input: '帶著一個明確方向', reveal: '符文從材質中浮現', chapters: ['眼前阻力', '手上的資源', '行動路標'], chapterDetails: ['先辨認真正卡住的地方', '找回已經存在的力量', '把提醒翻成具體選擇'], loading: '正在為你的問題取出對應符文' },
  astro: { index: '07', ritual: '內在宇宙', promise: '看懂太陽、月亮與上升為何有時像三個不同的自己。', duration: '約 3 分鐘', input: '生日、時間、出生地', reveal: '行星落入你的十二宮', chapters: ['你想成為誰', '你如何感受', '別人先看見什麼'], chapterDetails: ['太陽代表的核心方向', '月亮需要的安全感', '上升呈現的第一反應'], loading: '正在計算行星位置與你的出生地平線' },
  humandesign: { index: '08', ritual: '決策說明書', promise: '先回答一件最實用的事：你適合怎麼做決定。', duration: '約 3 分鐘', input: '生日、時間、出生地', reveal: '中心、通道與閘門點亮', chapters: ['你的能量類型', '你的決策權威', '你的互動界線'], chapterDetails: ['什麼節奏最不消耗你', '卡住時回到哪個判準', '哪些不是你需要承擔的'], loading: '正在生成你的能量中心與決策路徑' },
};

const EN_RITUALS: Record<CalcTool, string> = {
  numerology: 'Number Fingerprint',
  maya: 'Energy Signature',
  bazi: 'Elemental Climate',
  ziwei: 'Life Star Map',
  tarot: 'Mirror of Now',
  runes: 'Rune Signposts',
  astro: 'Inner Cosmos',
  humandesign: 'Decision Manual',
};

const EN: Record<CalcTool, Experience> = Object.fromEntries(
  (Object.keys(ZH) as CalcTool[]).map((tool) => [tool, { ...ZH[tool], ritual: EN_RITUALS[tool], promise: {
    numerology: 'Find the personal rhythm you use again and again.', maya: 'Reveal your Kin identity and natural momentum.', bazi: 'See your elemental balance without memorising jargon.', ziwei: 'Read your core role through palaces and leading stars.', tarot: 'Turn a tangled question into the present, tension and next step.', runes: 'Find the obstacle, available resource and direction.', astro: 'Understand how your Sun, Moon and Rising work together.', humandesign: 'Start with one useful answer: how you are built to decide.',
  }[tool], duration: ZH[tool].duration.replace('約 ', 'About '), input: 'A few details to begin', reveal: 'Your personal map unfolds', chapters: ['Your pattern', 'Your resource', 'Your next move'], chapterDetails: ['See the theme in plain language', 'Notice what is already available', 'Turn insight into one action'], loading: 'Building your personal reveal' }]),
) as Record<CalcTool, Experience>;

const VI: Record<CalcTool, Experience> = {
  numerology: { index: '01', ritual: 'Dấu vân tay con số', promise: 'Tìm ra nhịp tính cách bạn hay dùng mà chưa chắc để ý.', duration: 'khoảng 45 giây', input: 'Chỉ cần ngày sinh', reveal: 'Các con số cốt lõi sáng dần lên', chapters: ['Giai điệu chính của bạn', 'Thế mạnh tự nhiên nhất', 'Hành động nhỏ hôm nay'], chapterDetails: ['Không phải nhãn dán, mà là cách bạn hay phản ứng', 'Nhìn ra điều bạn làm được mà không tốn sức', 'Biến hiểu biết thành một bước có thể làm ngay'], loading: 'Đang tách ngày sinh thành nhịp số của bạn' },
  maya: { index: '02', ritual: 'Dấu ấn năng lượng', promise: 'Hé lộ danh tính Kin của bạn và cách bạn khởi động, tiến bước, tìm lại nhịp điệu.', duration: 'khoảng 60 giây', input: 'Chỉ cần ngày sinh', reveal: 'Vật tổ và năng lượng năm phương hiện ra', chapters: ['Kin của bạn', 'Nhịp tiến bước của bạn', 'Năng lượng năm phương'], chapterDetails: ['Nhận ra dấu ấn năng lượng của mình ngay lập tức', 'Tông màu ảnh hưởng cách bạn làm việc thế nào', 'Hỗ trợ, thử thách và nguồn lực ẩn'], loading: 'Đang định vị tọa độ năng lượng của bạn trong lịch 260 ngày' },
  bazi: { index: '03', ritual: 'Khí hậu Ngũ Hành', promise: 'Không cần thuộc thuật ngữ, xem ngay năng lượng bạn đang dùng nhiều nhất và điểm dễ mất cân bằng.', duration: 'khoảng 2 phút', input: 'Ngày sinh, giờ sinh, nơi sinh', reveal: 'Nhật chủ và tỷ lệ ngũ hành hiện rõ', chapters: ['Nhật chủ của bạn', 'Khí hậu năng lượng', 'Cách điều chỉnh lúc này'], chapterDetails: ['Nhận diện cách phản ứng cốt lõi trước tiên', 'Hiểu năng lượng nào đang dư hoặc thiếu', 'Một hướng cân bằng có thể áp dụng ngay'], loading: 'Đang sắp tứ trụ và cân chỉnh khí hậu ngũ hành của bạn' },
  ziwei: { index: '04', ritual: 'Bản đồ sao đời người', promise: 'Nhìn vai trò bạn đang đóng qua Mệnh cung và sao chủ, không phải lời tiên tri số phận.', duration: 'khoảng 2 phút', input: 'Ngày sinh và giờ sinh', reveal: 'Mười hai cung lần lượt định vị', chapters: ['Vai trò cốt lõi của bạn', 'Cung đang có cảm giác rõ nhất', 'Câu hỏi đáng mang theo'], chapterDetails: ['Bản giải thích dễ hiểu về Mệnh cung và sao chủ', 'Kết nối lá số với đời sống thật', 'Dùng câu hỏi hay thay cho câu trả lời định mệnh'], loading: 'Đang an vị mười hai cung và sao chủ của bạn' },
  tarot: { index: '05', ritual: 'Tấm gương của hiện tại', promise: 'Không quyết định thay bạn; thu gọn sự rối bời thành hiện tại, lực cản và bước tiếp theo.', duration: 'khoảng 90 giây', input: 'Mang theo một câu hỏi thật', reveal: 'Từng lá bài lật mở', chapters: ['Chuyện gì đang xảy ra', 'Sự giằng co thật sự', 'Bước nhỏ tiếp theo'], chapterDetails: ['Mô tả trước, chưa vội kết luận', 'Nhìn ra căng thẳng ẩn sau vấn đề', 'Hành động có thể làm ngay hôm nay'], loading: 'Đang xáo bài và dựng trải bài cho câu hỏi của bạn' },
  runes: { index: '06', ritual: 'Biển chỉ đường Rune', promise: 'Dùng ít ký hiệu nhất để chỉ ra lực cản, nguồn lực sẵn có và hướng hành động.', duration: 'khoảng 60 giây', input: 'Mang theo một hướng rõ ràng', reveal: 'Rune hiện lên từ chất liệu', chapters: ['Lực cản trước mắt', 'Nguồn lực trong tay', 'Biển chỉ đường hành động'], chapterDetails: ['Nhận diện đúng điểm đang mắc kẹt', 'Tìm lại sức mạnh vốn đã có sẵn', 'Biến lời nhắc thành lựa chọn cụ thể'], loading: 'Đang rút Rune tương ứng với câu hỏi của bạn' },
  astro: { index: '07', ritual: 'Vũ trụ nội tâm', promise: 'Hiểu vì sao Mặt Trời, Mặt Trăng và Cung Mọc đôi khi như ba con người khác nhau.', duration: 'khoảng 3 phút', input: 'Ngày sinh, giờ sinh, nơi sinh', reveal: 'Các hành tinh an vị vào mười hai cung', chapters: ['Bạn muốn trở thành ai', 'Cách bạn cảm nhận', 'Điều người khác thấy trước'], chapterDetails: ['Hướng đi cốt lõi mà Mặt Trời đại diện', 'Cảm giác an toàn mà Mặt Trăng cần', 'Phản ứng đầu tiên mà Cung Mọc thể hiện'], loading: 'Đang tính vị trí hành tinh và đường chân trời nơi bạn sinh ra' },
  humandesign: { index: '08', ritual: 'Sổ tay ra quyết định', promise: 'Trả lời trước một điều thực tế nhất: bạn hợp với cách ra quyết định nào.', duration: 'khoảng 3 phút', input: 'Ngày sinh, giờ sinh, nơi sinh', reveal: 'Trung tâm, kênh và cổng được kích hoạt sáng lên', chapters: ['Kiểu năng lượng của bạn', 'Thẩm quyền quyết định của bạn', 'Ranh giới tương tác của bạn'], chapterDetails: ['Nhịp độ nào ít tiêu hao bạn nhất', 'Quay về tiêu chuẩn nào khi bế tắc', 'Điều gì không phải là trách nhiệm của bạn'], loading: 'Đang tạo trung tâm năng lượng và lộ trình quyết định của bạn' },
};

const ID: Record<CalcTool, Experience> = {
  numerology: { index: '01', ritual: 'Sidik jari angka', promise: 'Menemukan ritme kepribadian yang sering kamu pakai tanpa disadari.', duration: 'sekitar 45 detik', input: 'Cukup tanggal lahir', reveal: 'Angka inti menyala satu per satu', chapters: ['Melodi utamamu', 'Kekuatan paling alami', 'Aksi kecil hari ini'], chapterDetails: ['Bukan label, tapi cara responmu yang biasa', 'Melihat hal yang bisa kamu lakukan tanpa usaha berat', 'Mengubah pemahaman jadi satu langkah nyata'], loading: 'Sedang mengurai tanggal lahirmu jadi ritme angka' },
  maya: { index: '02', ritual: 'Jejak energi', promise: 'Mengungkap identitas Kin-mu, dan caramu memulai, melaju, dan menemukan ritme kembali.', duration: 'sekitar 60 detik', input: 'Cukup tanggal lahir', reveal: 'Totem dan kekuatan lima arah terbuka', chapters: ['Kin-mu', 'Ritme melajumu', 'Kekuatan lima arah'], chapterDetails: ['Langsung mengenali jejak energimu sendiri', 'Bagaimana tone memengaruhi caramu bekerja', 'Dukungan, tantangan, dan sumber daya tersembunyi'], loading: 'Sedang menentukan koordinat energimu dalam kalender 260 hari' },
  bazi: { index: '03', ritual: 'Iklim lima elemen', promise: 'Tanpa perlu hafal istilah, langsung lihat kekuatan yang paling sering kamu pakai dan titik rawan tak seimbang.', duration: 'sekitar 2 menit', input: 'Tanggal, jam, tempat lahir', reveal: 'Day Master dan proporsi lima elemen terbentuk', chapters: ['Day Master-mu', 'Iklim energimu', 'Cara menyesuaikan sekarang'], chapterDetails: ['Kenali dulu cara responmu yang paling inti', 'Pahami kekuatan mana yang berlebih atau kurang', 'Satu arah penyeimbang yang bisa langsung dipakai'], loading: 'Sedang menyusun empat pilar dan menyelaraskan iklim lima elemenmu' },
  ziwei: { index: '04', ritual: 'Peta bintang kehidupan', promise: 'Melihat peran yang sedang kamu mainkan lewat istana takdir dan bintang utama, bukan ramalan nasib.', duration: 'sekitar 2 menit', input: 'Tanggal dan jam lahir', reveal: 'Dua belas istana ditentukan berurutan', chapters: ['Peran intimu', 'Istana yang paling terasa sekarang', 'Pertanyaan yang layak dibawa pulang'], chapterDetails: ['Versi mudah dipahami dari istana takdir dan bintang utama', 'Menghubungkan bagan dengan kehidupan nyata', 'Memakai pertanyaan baik, bukan jawaban nasib'], loading: 'Sedang menempatkan dua belas istana dan bintang utamamu' },
  tarot: { index: '05', ritual: 'Cermin saat ini', promise: 'Tidak membuat keputusan untukmu; merangkum kekacauan jadi masa kini, hambatan, dan langkah berikutnya.', duration: 'sekitar 90 detik', input: 'Bawa satu pertanyaan nyata', reveal: 'Kartu terbuka satu per satu', chapters: ['Apa yang sedang terjadi', 'Ketegangan yang sesungguhnya', 'Langkah kecil berikutnya'], chapterDetails: ['Gambarkan dulu, jangan buru-buru menyimpulkan', 'Lihat ketegangan di balik masalah', 'Aksi yang bisa diambil hari ini'], loading: 'Sedang mengocok kartu dan menyusun bentangan untuk pertanyaanmu' },
  runes: { index: '06', ritual: 'Penanda arah rune', promise: 'Dengan simbol paling sedikit, menunjukkan hambatan, sumber daya yang tersedia, dan arah aksi.', duration: 'sekitar 60 detik', input: 'Bawa satu arah yang jelas', reveal: 'Rune muncul dari materialnya', chapters: ['Hambatan di depan mata', 'Sumber daya di tanganmu', 'Penanda arah aksi'], chapterDetails: ['Kenali dulu titik yang benar-benar mentok', 'Temukan kembali kekuatan yang sudah ada', 'Ubah pengingat jadi pilihan konkret'], loading: 'Sedang menarik rune yang sesuai dengan pertanyaanmu' },
  astro: { index: '07', ritual: 'Alam semesta batin', promise: 'Memahami mengapa Matahari, Bulan, dan Ascendant kadang terasa seperti tiga sosok berbeda.', duration: 'sekitar 3 menit', input: 'Tanggal, jam, tempat lahir', reveal: 'Planet menempati dua belas rumahmu', chapters: ['Siapa yang ingin kamu jadi', 'Bagaimana kamu merasakan', 'Apa yang orang lain lihat lebih dulu'], chapterDetails: ['Arah inti yang diwakili Matahari', 'Rasa aman yang dibutuhkan Bulan', 'Reaksi pertama yang ditunjukkan Ascendant'], loading: 'Sedang menghitung posisi planet dan cakrawala tempat lahirmu' },
  humandesign: { index: '08', ritual: 'Buku panduan keputusan', promise: 'Menjawab dulu satu hal paling praktis: cara mengambil keputusan yang cocok untukmu.', duration: 'sekitar 3 menit', input: 'Tanggal, jam, tempat lahir', reveal: 'Center, channel, dan gate menyala', chapters: ['Tipe energimu', 'Otoritas keputusanmu', 'Batasan interaksimu'], chapterDetails: ['Ritme mana yang paling tidak menguras energimu', 'Kembali ke patokan apa saat mentok', 'Hal apa yang bukan tanggung jawabmu'], loading: 'Sedang membuat pusat energi dan jalur keputusanmu' },
};

const JA: Record<CalcTool, Experience> = {
  numerology: { index: '01', ritual: '数字の指紋', promise: '無意識に繰り返し使っている、あなたの性格のリズムを見つけます。', duration: '約45秒', input: '生年月日だけでOK', reveal: 'コアナンバーが一段ずつ浮かび上がる', chapters: ['あなたの主旋律', 'いちばん自然な強み', '今日の小さな一歩'], chapterDetails: ['レッテルではなく、よく使う対処法', '無理なくできることを見つける', '理解を実行できる一歩に変える'], loading: '生年月日をあなたの数字のリズムに分解しています' },
  maya: { index: '02', ritual: 'エネルギーの刻印', promise: 'あなたのKinアイデンティティと、動き出し方・進め方・リズムの取り戻し方を明らかにします。', duration: '約60秒', input: '生年月日だけでOK', reveal: 'トーテムと五方の力が展開', chapters: ['あなたのKin', '進み方のリズム', '五方の力'], chapterDetails: ['自分のエネルギーの刻印がひと目でわかる', 'トーンが仕事の仕方にどう影響するか', '支え・課題・隠れた資源'], loading: '260日暦の中であなたのエネルギー座標を特定しています' },
  bazi: { index: '03', ritual: '五行の気候', promise: '専門用語を覚えなくても、今いちばん使っている力とバランスを崩しやすい点がすぐわかります。', duration: '約2分', input: '生年月日・時間・出生地', reveal: '日主と五行の比率が浮かび上がる', chapters: ['あなたの日主', 'エネルギーの気候', '今の調整方法'], chapterDetails: ['まずいちばん核となる反応の仕方を知る', '強すぎる力・足りない力を理解する', '今すぐ実践できるバランスの取り方'], loading: '四柱を並べ、あなたの五行の気候を調整しています' },
  ziwei: { index: '04', ritual: '人生の星図', promise: '命宮と主星から、あなたが今演じている役割を見ます。運命の予言ではありません。', duration: '約2分', input: '生年月日と出生時間', reveal: '十二宮が順に定まる', chapters: ['あなたの中心的な役割', '今いちばん感じる宮位', '持ち帰るべき問い'], chapterDetails: ['命宮と主星のわかりやすい解説', '命盤を実生活に結びつける', '宿命的な答えより、良い問いを使う'], loading: '十二宮とあなたの主星を配置しています' },
  tarot: { index: '05', ritual: '今この瞬間の鏡', promise: 'あなたに代わって決断はしません。混乱を今・葛藤・次の一歩に絞り込みます。', duration: '約90秒', input: '本気の質問を一つ用意', reveal: 'カードが一枚ずつめくられる', chapters: ['今起きていること', '本当の葛藤', '次の小さな一歩'], chapterDetails: ['まず描写し、急いで結論を出さない', '問題の裏にある緊張を見る', '今日から取れる行動'], loading: 'あなたの質問のためにシャッフルしてスプレッドを作っています' },
  runes: { index: '06', ritual: 'ルーンの道しるべ', promise: '最小限のシンボルで、障害・使える資源・行動の方向を示します。', duration: '約60秒', input: '明確な方向性を一つ用意', reveal: '素材の中からルーンが浮かび上がる', chapters: ['目の前の障害', '手元にある資源', '行動の道しるべ'], chapterDetails: ['本当に詰まっている場所を見極める', 'すでにある力を取り戻す', '気づきを具体的な選択に変える'], loading: 'あなたの質問に対応するルーンを引いています' },
  astro: { index: '07', ritual: '内なる宇宙', promise: '太陽・月・アセンダントが時に三人の別人のように感じられる理由を理解します。', duration: '約3分', input: '生年月日・時間・出生地', reveal: '惑星があなたの十二ハウスに配置される', chapters: ['なりたい自分', '感じ方の傾向', '人にまず伝わる印象'], chapterDetails: ['太陽が示す中心的な方向性', '月が必要とする安心感', 'アセンダントが表す第一反応'], loading: '惑星の位置とあなたの出生地の地平線を計算しています' },
  humandesign: { index: '08', ritual: '意思決定の説明書', promise: 'いちばん実用的な問いから始めます。あなたに合う決め方とは。', duration: '約3分', input: '生年月日・時間・出生地', reveal: 'センター・チャンネル・ゲートが点灯', chapters: ['あなたのエネルギータイプ', 'あなたの意思決定権威', 'あなたの関わり方の境界線'], chapterDetails: ['どんなペースが一番消耗しないか', '行き詰まったとき、どの基準に戻るか', 'どれがあなたが背負わなくていいことか'], loading: 'あなたのエネルギーセンターと意思決定の道筋を生成しています' },
};

const KO: Record<CalcTool, Experience> = {
  numerology: { index: '01', ritual: '숫자 지문', promise: '자신도 모르게 반복해서 쓰고 있는 성격의 리듬을 찾아드려요.', duration: '약 45초', input: '생년월일만 있으면 OK', reveal: '핵심 숫자가 하나씩 밝혀져요', chapters: ['당신의 메인 멜로디', '가장 자연스러운 강점', '오늘의 작은 실천'], chapterDetails: ['꼬리표가 아니라 당신이 자주 쓰는 대응 방식', '힘들이지 않고 할 수 있는 일을 발견해요', '이해를 완료 가능한 한 걸음으로 바꿔요'], loading: '생년월일을 당신의 숫자 리듬으로 풀어내는 중입니다' },
  maya: { index: '02', ritual: '에너지 각인', promise: '당신의 Kin 정체성과 시작·추진·리듬 회복 방식을 밝혀드려요.', duration: '약 60초', input: '생년월일만 있으면 OK', reveal: '토템과 다섯 방향의 힘이 펼쳐져요', chapters: ['당신의 Kin', '추진 리듬', '다섯 방향의 힘'], chapterDetails: ['한눈에 자신의 에너지 각인을 알아봐요', '톤이 일하는 방식에 미치는 영향', '지지, 도전, 숨겨진 자원'], loading: '260일력 속 당신의 에너지 좌표를 찾는 중입니다' },
  bazi: { index: '03', ritual: '오행 기후', promise: '용어를 외울 필요 없이, 지금 가장 많이 쓰는 힘과 불균형 지점을 바로 확인해요.', duration: '약 2분', input: '생년월일·시간·출생지', reveal: '일주와 오행 비율이 드러나요', chapters: ['당신의 일주', '에너지 기후', '지금 조정하는 법'], chapterDetails: ['가장 핵심적인 반응 방식부터 파악해요', '과하거나 부족한 힘을 이해해요', '바로 실천할 수 있는 균형 방향'], loading: '사주를 배열하고 당신의 오행 기후를 조정하는 중입니다' },
  ziwei: { index: '04', ritual: '인생 별자리 지도', promise: '명궁과 주성으로 지금 맡고 있는 역할을 보여줘요. 운명을 예언하지 않아요.', duration: '약 2분', input: '생년월일과 태어난 시간', reveal: '열두 궁이 차례로 자리잡아요', chapters: ['당신의 핵심 역할', '지금 가장 와닿는 궁', '가져갈 만한 질문'], chapterDetails: ['명궁과 주성을 쉬운 말로 풀이해요', '명반을 실제 삶과 연결해요', '운명적인 답 대신 좋은 질문을 사용해요'], loading: '열두 궁과 당신의 주성을 배치하는 중입니다' },
  tarot: { index: '05', ritual: '지금 이 순간의 거울', promise: '대신 결정해 주지 않아요. 혼란을 현재·갈등·다음 걸음으로 정리해요.', duration: '약 90초', input: '진짜 궁금한 질문 하나 준비', reveal: '카드가 한 장씩 펼쳐져요', chapters: ['지금 일어나고 있는 일', '진짜 갈등', '다음 작은 걸음'], chapterDetails: ['서둘러 결론 내리지 않고 먼저 묘사해요', '문제 이면의 긴장을 봐요', '오늘 바로 시도할 수 있는 행동'], loading: '당신의 질문을 위해 카드를 섞고 스프레드를 준비하는 중입니다' },
  runes: { index: '06', ritual: '룬의 이정표', promise: '가장 적은 상징으로 장애물, 쓸 수 있는 자원, 행동 방향을 짚어줘요.', duration: '약 60초', input: '명확한 방향 하나 준비', reveal: '재질 속에서 룬이 떠올라요', chapters: ['눈앞의 장애물', '손에 쥔 자원', '행동 이정표'], chapterDetails: ['진짜 막혀 있는 지점을 먼저 알아차려요', '이미 있던 힘을 되찾아요', '알림을 구체적인 선택으로 바꿔요'], loading: '당신의 질문에 맞는 룬을 뽑는 중입니다' },
  astro: { index: '07', ritual: '내면의 우주', promise: '태양·달·상승궁이 때로 세 명의 다른 사람처럼 느껴지는 이유를 이해해요.', duration: '약 3분', input: '생년월일·시간·출생지', reveal: '행성이 당신의 열두 하우스에 자리잡아요', chapters: ['되고 싶은 나', '느끼는 방식', '남들이 먼저 보는 모습'], chapterDetails: ['태양이 상징하는 핵심 방향', '달이 필요로 하는 안정감', '상승궁이 보이는 첫 반응'], loading: '행성 위치와 당신이 태어난 지평선을 계산하는 중입니다' },
  humandesign: { index: '08', ritual: '결정 설명서', promise: '가장 실용적인 질문부터 답해요. 당신에게 맞는 결정 방식은 무엇인지.', duration: '약 3분', input: '생년월일·시간·출생지', reveal: '센터·채널·게이트가 밝혀져요', chapters: ['당신의 에너지 타입', '당신의 결정 권위', '당신의 관계 경계선'], chapterDetails: ['어떤 리듬이 가장 덜 소모적인지', '막혔을 때 어떤 기준으로 돌아갈지', '당신이 짊어질 필요 없는 것들'], loading: '당신의 에너지 센터와 결정 경로를 생성하는 중입니다' },
};

const EXPERIENCES: Record<Locale, Record<CalcTool, Experience>> = {
  'zh-TW': ZH,
  en: EN,
  vi: VI,
  id: ID,
  ja: JA,
  ko: KO,
};

const UI: Record<Locale, UiCopy> = {
  'zh-TW': { ariaLabel: '這次探索會得到什麼', revealReady: '你的揭曉已完成', revealBody: '不用一次讀完。照著三個章節看，先找到最像你的一句。' },
  en: { ariaLabel: 'What this exploration reveals', revealReady: 'Your reveal is ready', revealBody: 'Read it in three chapters and keep the line that feels most like you.' },
  vi: { ariaLabel: 'Điều bạn sẽ khám phá lần này', revealReady: 'Kết quả của bạn đã sẵn sàng', revealBody: 'Không cần đọc hết một lần. Hãy xem theo ba chương và tìm câu giống bạn nhất.' },
  id: { ariaLabel: 'Apa yang akan kamu temukan kali ini', revealReady: 'Hasil kamu sudah siap', revealBody: 'Tidak perlu dibaca sekaligus. Ikuti tiga bab dan temukan kalimat yang paling terasa seperti dirimu.' },
  ja: { ariaLabel: '今回の探索でわかること', revealReady: 'あなたの結果が完成しました', revealBody: '一度に読み切らなくて大丈夫。三つの章から、いちばん自分らしい一文を見つけてください。' },
  ko: { ariaLabel: '이번 탐색에서 알게 될 것', revealReady: '당신의 결과가 준비됐어요', revealBody: '한 번에 다 읽지 않아도 돼요. 세 장을 따라가며 가장 나 같은 한 문장을 찾아보세요.' },
};

export function getToolExperience(tool: CalcTool, locale: Locale) {
  return (EXPERIENCES[locale] ?? EXPERIENCES['zh-TW'])[tool];
}

function getUiCopy(locale: Locale) {
  return UI[locale] ?? UI['zh-TW'];
}

export function ToolExperiencePrelude({ tool, locale }: { tool: CalcTool; locale: Locale }) {
  const x = getToolExperience(tool, locale);
  const ui = getUiCopy(locale);
  return (
    <section className={`tool-experience tool-experience--${tool}`} aria-label={ui.ariaLabel}>
      <div className="tool-experience__intro">
        <span className="mag-label">{x.index} · {x.ritual}</span>
        <h2>{x.promise}</h2>
        <div className="tool-experience__facts"><span>{x.duration}</span><span>{x.input}</span><span>{x.reveal}</span></div>
      </div>
      <div className="tool-experience__chapters">
        {x.chapters.map((chapter, index) => <article key={chapter}><b>0{index + 1}</b><strong>{chapter}</strong><p>{x.chapterDetails[index]}</p></article>)}
      </div>
    </section>
  );
}

export function ToolResultReveal({ tool, locale }: { tool: CalcTool; locale: Locale }) {
  const x = getToolExperience(tool, locale);
  const ui = getUiCopy(locale);
  return (
    <header className={`tool-result-reveal tool-result-reveal--${tool}`}>
      <span>{ui.revealReady}</span>
      <h2>{x.ritual}</h2>
      <p>{ui.revealBody}</p>
      <ol>{x.chapters.map((chapter, index) => <li key={chapter}><b>0{index + 1}</b>{chapter}</li>)}</ol>
    </header>
  );
}
