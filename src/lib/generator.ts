import type {
  Complexity,
  DataEntity,
  DomainKey,
  Endpoint,
  Feature,
  Metric,
  ModelSettings,
  Persona,
  PRD,
  Priority,
  Risk,
} from '../types'

type FeatureSpec = {
  name: string
  description: string
  priority: Priority
  complexity: Complexity
  phase: 1 | 2 | 3
  dependsOn: number[]
  acceptance: string[]
}

type DomainConfig = {
  key: DomainKey
  label: string
  productType: string
  tagline: string
  audience: string
  problem: string
  solution: string
  goals: string[]
  metrics: Metric[]
  personas: Persona[]
  features: FeatureSpec[]
  stack: string[]
  integrations: string[]
  entities: DataEntity[]
  endpoints: Endpoint[]
  storyOutcomes: string[]
  openQuestions: string[]
  fishboneProblem: string
  extraScopeOut: string[]
}



const spec = (
  name: string,
  description: string,
  priority: Priority,
  complexity: Complexity,
  phase: 1 | 2 | 3,
  dependsOn: number[],
  acceptance: string[],
): FeatureSpec => ({ name, description, priority, complexity, phase, dependsOn, acceptance })

const personas = (
  people: Array<[string, string, string, string, string]>,
): Persona[] =>
  people.map(([name, role, quote, pain, goal], i) => ({
    id: `persona-${i + 1}`,
    name,
    role,
    quote,
    pain,
    goal,
  }))

const domainConfigs: Record<DomainKey, DomainConfig> = {
  productivity: {
    key: 'productivity',
    label: 'Manajemen kerja',
    productType: 'workspace kolaborasi untuk tim modern',
    tagline: 'Satu ruang tenang untuk tim yang bergerak cepat.',
    audience: 'tim produk dan operasi yang bekerja secara hybrid',
    problem:
      'Pekerjaan tim tersebar di spreadsheet, thread chat, dan dokumen yang tidak saling terhubung. Konteks hilang saat berpindah alat, prioritas sulit dibaca, dan progres hanya terlihat setelah rapat status.',
    solution:
      'Satu workspace yang menyatukan perencanaan, eksekusi, dan pembacaan progres. Setiap task membawa konteks, kepemilikan, serta dependensi yang eksplisit sehingga tim dapat bergerak tanpa koordinasi berulang.',
    goals: [
      'Memangkas waktu koordinasi mingguan minimal 30%.',
      'Menciptakan satu sumber kebenaran untuk prioritas dan status pekerjaan.',
      'Memungkinkan anggota baru memahami pekerjaan aktif dalam satu hari kerja.',
    ],
    metrics: [
      { name: 'Task completion rate', target: '≥ 72%', description: 'Task yang selesai sebelum atau tepat pada tenggat.' },
      { name: 'Time to first task', target: '< 8 menit', description: 'Dari onboarding selesai hingga task pertama dibuat.' },
      { name: 'Weekly active teams', target: '65%', description: 'Tim yang kembali mengelola pekerjaan dalam 7 hari.' },
    ],
    personas: personas([
      ['Rania Putri', 'Lead Product Manager', 'Saya butuh melihat gambaran besar tanpa kehilangan detail eksekusi.', 'Menghabiskan 5+ jam per minggu untuk merapikan status dan menyamakan persepsi.', 'Memimpin dua squad tanpa menambah ritme rapat.'],
      ['Bagas Wardana', 'Product Designer', 'Konteks task sering hilang saat saya mulai mengerjakan detail.', 'Harus membuka empat alat berbeda untuk memahami satu keputusan.', 'Fokus pada kualitas desain dengan brief yang jelas.'],
      ['Sinta Maharani', 'Engineering Manager', 'Saya ingin risiko delivery terlihat sebelum menjadi keterlambatan.', 'Dependensi antar tim baru terlihat saat mendekati deadline.', 'Mengelola kapasitas tim dengan data, bukan intuisi.'],
    ]),
    features: [
      spec('Workspace & kontrol akses', 'Struktur organisasi, ruang kerja, anggota, dan izin per proyek dalam satu fondasi yang aman.', 'P0', 'Sedang', 1, [], ['Workspace dapat dibuat dalam kurang dari satu menit.', 'Admin dapat mengundang anggota dengan peran Viewer, Editor, atau Owner.', 'Seluruh akses diverifikasi di level API, bukan hanya antarmuka.']),
      spec('Papan kerja multi-view', 'Kanban, list, dan timeline yang membaca sumber data yang sama dengan filter serta pengurutan yang konsisten.', 'P0', 'Tinggi', 2, [0], ['Pengguna dapat beralih tampilan tanpa kehilangan filter aktif.', 'Perubahan status di Kanban langsung tercermin di timeline.', 'Setiap tampilan mendukung keyboard navigation dan URL yang dapat dibagikan.']),
      spec('Kolaborasi pada task', 'Komentar, mention, lampiran, dan activity trail yang menempel pada konteks pekerjaan.', 'P0', 'Sedang', 2, [0, 1], ['Komentar baru muncul di inbox penerima dalam < 5 detik.', 'Mention hanya mengirim notifikasi kepada anggota workspace.', 'Riwayat perubahan tidak dapat dihapus oleh Viewer.']),
      spec('Otomasi alur kerja', 'Aturan if-this-then-that untuk memindahkan task, memberi label, dan mengirim notifikasi.', 'P1', 'Tinggi', 3, [1, 2], ['Aturan dapat diuji sebelum diaktifkan.', 'Setiap eksekusi otomasi tercatat dengan status dan durasi.', 'Kegagalan otomasi mengirim notifikasi kepada pemilik aturan.']),
      spec('Insight beban kerja', 'Dashboard kapasitas, velocity, dan risiko keterlambatan yang dihitung dari aktivitas workspace.', 'P1', 'Sedang', 3, [1], ['Manager dapat melihat kapasitas per anggota dan per squad.', 'Metrik dihitung ulang maksimal 15 menit setelah perubahan.', 'Data dapat difilter berdasarkan rentang tanggal dan proyek.']),
      spec('Integrasi & API', 'Koneksi ke kalender, repositori kode, dan alat komunikasi dengan webhook dua arah.', 'P1', 'Sedang', 3, [0], ['Integrasi dapat dihubungkan dan dilepas tanpa kehilangan data inti.', 'Webhook memiliki retry dengan exponential backoff.', 'Pemilik workspace dapat melihat log sinkronisasi.']),
      spec('Asisten perencanaan AI', 'Copilot yang merangkum konteks, memecah tujuan menjadi task, dan menandai dependensi yang berisiko.', 'P2', 'Tinggi', 3, [1, 4], ['Saran AI selalu memiliki sumber konteks yang dapat dibuka.', 'Pengguna harus mengonfirmasi sebelum saran diubah menjadi data.', 'Prompt dan output tidak dipakai untuk pelatihan model.']),
    ],
    stack: ['Next.js 15', 'TypeScript', 'PostgreSQL', 'Redis', 'OpenTelemetry'],
    integrations: ['Google Calendar', 'GitHub', 'Slack', 'Notion'],
    entities: [
      { name: 'Workspace', fields: 'id, name, plan, created_at' },
      { name: 'Project', fields: 'id, workspace_id, name, status, owner_id' },
      { name: 'Task', fields: 'id, project_id, title, status, assignee_id, due_at' },
      { name: 'Activity', fields: 'id, actor_id, entity_type, entity_id, payload, created_at' },
    ],
    endpoints: [
      { method: 'POST', path: '/v1/workspaces', purpose: 'Membuat workspace baru.' },
      { method: 'GET', path: '/v1/projects/:id/views', purpose: 'Mengambil snapshot papan, list, dan timeline.' },
      { method: 'PATCH', path: '/v1/tasks/:id', purpose: 'Memperbarui status, assignee, atau metadata task.' },
      { method: 'POST', path: '/v1/automations/:id/test', purpose: 'Menjalankan simulasi aturan otomasi.' },
      { method: 'GET', path: '/v1/insights/workload', purpose: 'Mengambil metrik kapasitas dan risiko delivery.' },
    ],
    storyOutcomes: [
      'tim dapat bergerak dari diskusi ke eksekusi tanpa kehilangan konteks.',
      'keputusan prioritas tidak lagi bergantung pada rapat status mingguan.',
      'risiko delivery terlihat sebelum berdampak pada tenggat.',
      'pekerjaan tetap dapat dilacak oleh semua pemangku kepentingan.',
      'koordinasi terasa lebih ringan tanpa mengurangi kendali.',
    ],
    openQuestions: [
      'Apakah MVP perlu mendukung lebih dari satu level hierarki organisasi?',
      'Seberapa dalam integrasi repositori kode yang dibutuhkan pada rilis pertama?',
      'Siapa pemilik keputusan saat terjadi konflik antara timeline dan kapasitas?',
    ],
    fishboneProblem: 'Mengapa adopsi mingguan dan ketepatan delivery belum mencapai target?',
    extraScopeOut: ['Billing enterprise dan kustomisasi kontrak', 'Aplikasi native terpisah untuk desktop'],
  },
  finance: {
    key: 'finance',
    label: 'Keuangan pribadi',
    productType: 'asisten keuangan pribadi yang proaktif',
    tagline: 'Uang yang lebih jernih, keputusan yang lebih tenang.',
    audience: 'profesional muda dan pekerja lepas yang mengelola keuangan sendiri',
    problem:
      'Pemasukan dan pengeluaran tersebar di banyak rekening, dompet digital, dan spreadsheet. Pengguna baru menyadari masalah arus kas setelah uangnya habis, ketika keputusan yang lebih baik sudah terlambat.',
    solution:
      'Satu tampilan yang menyatukan transaksi, anggaran, dan tujuan. Kategorisasi cerdas dan insight kontekstual membantu pengguna memahami pola tanpa harus menjadi ahli keuangan.',
    goals: [
      'Membantu pengguna memahami posisi keuangan bulanan dalam kurang dari dua menit.',
      'Mengurangi transaksi tanpa kategori menjadi di bawah 5%.',
      'Membuat perencanaan tujuan terasa sederhana dan dapat ditindaklanjuti.',
    ],
    metrics: [
      { name: 'Weekly review rate', target: '≥ 45%', description: 'Pengguna yang membuka ringkasan keuangan tiap minggu.' },
      { name: 'Kategori otomatis', target: '≥ 92% akurat', description: 'Transaksi yang dikategorikan tanpa koreksi manual.' },
      { name: 'Goals funded', target: '3.000 goals', description: 'Tujuan dengan setoran aktif pada kuartal pertama.' },
    ],
    personas: personas([
      ['Nadia Pratama', 'Freelance Designer', 'Pemasukan saya naik-turun, jadi saya butuh gambaran yang jujur.', 'Sering kaget saat pajak dan tagihan tahunan jatuh tempo.', 'Memisahkan uang pribadi dan operasional tanpa spreadsheet rumit.'],
      ['Raka Santoso', 'Product Analyst', 'Saya ingin tahu apakah keputusan kecil hari ini berdampak besar.', 'Punya banyak aplikasi, tetapi tidak pernah melihat pola pengeluaran.', 'Membangun dana darurat dengan progres yang terlihat.'],
      ['Maya Larasati', 'Pasangan dengan keuangan bersama', 'Kami butuh transparansi tanpa saling mengawasi.', 'Pengeluaran bersama tidak tercatat dan memicu diskusi berulang.', 'Mengatur target keluarga dengan kontrol privasi yang jelas.'],
    ]),
    features: [
      spec('Akun terhubung & transaksi', 'Sinkronisasi rekening dan dompet digital dengan deduplikasi transaksi yang dapat dipercaya.', 'P0', 'Tinggi', 1, [], ['Rekening demo dapat dihubungkan tanpa data finansial nyata.', 'Sinkronisasi pertama selesai dalam < 90 detik.', 'Transaksi duplikat terdeteksi sebelum ditampilkan.']),
      spec('Kategorisasi cerdas', 'Klasifikasi transaksi berbasis aturan dan model, dengan koreksi yang dipelajari per pengguna.', 'P0', 'Tinggi', 2, [0], ['Setiap kategori dapat dikoreksi dalam satu klik.', 'Akurasi kategori pertama minimal 85% di data uji.', 'Koreksi manual tidak menimpa transaksi lain yang serupa tanpa konfirmasi.']),
      spec('Anggaran & arus kas', 'Anggaran fleksibel per kategori dengan proyeksi arus kas sampai akhir bulan.', 'P0', 'Sedang', 2, [0, 1], ['Pengguna dapat membuat anggaran dengan tiga langkah.', 'Sisa anggaran diperbarui saat transaksi tersinkron.', 'Proyeksi menampilkan asumsi yang dapat dipahami pengguna.']),
      spec('Target tabungan', 'Tujuan finansial dengan setoran, milestone, dan proyeksi tanggal pencapaian.', 'P1', 'Sedang', 3, [2], ['Target dapat dibagi ke beberapa rekening.', 'Progres dihitung otomatis dari transaksi bertanda.', 'Pengguna menerima notifikasi saat milestone tercapai.']),
      spec('Insight & laporan', 'Ringkasan pola pengeluaran, langganan berulang, dan perbandingan bulanan.', 'P1', 'Sedang', 3, [1, 2], ['Insight hanya muncul jika data cukup dan relevan.', 'Setiap insight menjelaskan dasar perhitungannya.', 'Laporan dapat diekspor ke CSV dan PDF.']),
      spec('Pengingat tagihan', 'Kalender tagihan berulang dengan pengingat yang dapat diatur per akun.', 'P1', 'Rendah', 3, [0], ['Tagihan berulang terdeteksi dari riwayat transaksi.', 'Pengingat dikirim tepat waktu sesuai zona waktu pengguna.', 'Pengguna dapat menandai tagihan sebagai sudah dibayar.']),
      spec('Ruang keuangan bersama', 'Bagikan anggaran atau tujuan tertentu dengan izin baca-saja atau kolaborasi.', 'P2', 'Tinggi', 3, [2, 3], ['Undangan memiliki masa berlaku dan dapat dicabut.', 'Data rekening pribadi tidak pernah terlihat oleh anggota lain.', 'Audit log mencatat perubahan pada anggaran bersama.']),
      spec('Privasi & keamanan finansial', 'Enkripsi data sensitif, kontrol consent, dan ekspor atau penghapusan data oleh pengguna.', 'P0', 'Sedang', 1, [], ['Token bank disimpan terenkripsi dan tidak pernah dikirim ke klien.', 'Pengguna dapat mencabut akses integrasi kapan saja.', 'Permintaan penghapusan data selesai dalam 30 hari.']),
    ],
    stack: ['React 19', 'TypeScript', 'PostgreSQL', 'Redis', 'Plaid-compatible API'],
    integrations: ['Bank aggregation API', 'Stripe', 'Google Sheets', 'WhatsApp Business'],
    entities: [
      { name: 'UserProfile', fields: 'id, name, currency, timezone, consent_version' },
      { name: 'Account', fields: 'id, user_id, provider, balance, last_synced_at' },
      { name: 'Transaction', fields: 'id, account_id, amount, category, occurred_at, source' },
      { name: 'Budget', fields: 'id, user_id, category, limit, period_start, period_end' },
      { name: 'Goal', fields: 'id, user_id, name, target_amount, target_date, status' },
    ],
    endpoints: [
      { method: 'POST', path: '/v1/link-tokens', purpose: 'Membuat token koneksi rekening sekali pakai.' },
      { method: 'GET', path: '/v1/transactions', purpose: 'Menampilkan transaksi dengan filter dan paginasi.' },
      { method: 'PATCH', path: '/v1/transactions/:id/category', purpose: 'Mengoreksi kategori transaksi.' },
      { method: 'GET', path: '/v1/cashflow/forecast', purpose: 'Menghitung proyeksi arus kas.' },
      { method: 'POST', path: '/v1/goals/:id/contributions', purpose: 'Mencatat setoran tujuan.' },
    ],
    storyOutcomes: [
      'pengguna tahu posisi keuangannya tanpa membuka banyak aplikasi.',
      'keputusan belanja harian terhubung dengan tujuan jangka panjang.',
      'tagihan tidak lagi datang sebagai kejutan.',
      'pasangan dapat merencanakan keuangan dengan batas privasi yang jelas.',
      'kebiasaan meninjau keuangan terbentuk dalam hitungan menit.',
    ],
    openQuestions: [
      'Apakah rilis pertama perlu mendukung multi-currency?',
      'Model agregasi bank mana yang memenuhi persyaratan lisensi di Indonesia?',
      'Bagaimana kebijakan retensi data setelah akun dihapus?',
    ],
    fishboneProblem: 'Mengapa pengguna belum rutin meninjau kondisi keuangannya?',
    extraScopeOut: ['Robo-advisor dan eksekusi investasi otomatis', 'Kartu kredit fisik'],
  },
  commerce: {
    key: 'commerce',
    label: 'Commerce',
    productType: 'platform commerce untuk brand yang sedang tumbuh',
    tagline: 'Toko yang cepat, operasional yang tenang.',
    audience: 'pemilik brand lokal dan tim operasional e-commerce',
    problem:
      'Brand yang tumbuh cepat menempelkan banyak alat: katalog di satu tempat, pembayaran di tempat lain, pesanan dan stok di spreadsheet. Setiap pesanan menjadi pekerjaan manual dan setiap kesalahan terasa oleh pelanggan.',
    solution:
      'Storefront ringan yang terhubung langsung ke operasional. Katalog, pembayaran, pesanan, dan analitik berbagi satu sumber data sehingga tim dapat menjual lebih banyak tanpa menambah kompleksitas.',
    goals: [
      'Mengurangi waktu pemrosesan pesanan manual sebesar 60%.',
      'Menghadirkan checkout yang selesai dalam kurang dari tiga menit.',
      'Memberi pemilik brand visibilitas real-time atas penjualan dan stok.',
    ],
    metrics: [
      { name: 'Checkout completion', target: '≥ 68%', description: 'Sesi checkout yang berhasil menyelesaikan pembayaran.' },
      { name: 'Order sync latency', target: '< 30 detik', description: 'Waktu dari pembayaran terkonfirmasi hingga pesanan terlihat di dashboard.' },
      { name: 'Repeat purchase', target: '28%', description: 'Pembeli yang kembali dalam 60 hari.' },
    ],
    personas: personas([
      ['Sari Wulandari', 'Pemilik brand fashion lokal', 'Saya ingin toko saya terlihat premium dan operasionalnya tidak merepotkan.', 'Memproses pesanan festival hingga tengah malam karena data tersebar.', 'Mengembangkan brand tanpa menambah tiga alat baru.'],
      ['Dimas Prasetyo', 'E-commerce Operations Lead', 'Saya butuh satu dashboard yang jujur tentang stok dan pesanan.', 'Stok oversell terjadi karena sinkronisasi antar kanal terlambat.', 'Menjaga akurasi inventaris saat volume penjualan naik.'],
      ['Alya Nuraini', 'Pembeli', 'Saya ingin checkout cepat dan tahu pesanan saya ada di mana.', 'Terlalu banyak langkah dan biaya tambahan yang muncul di akhir.', 'Mendapat pengalaman belanja yang sederhana dan dapat dipercaya.'],
    ]),
    features: [
      spec('Storefront & katalog', 'Halaman toko, koleksi, dan detail produk yang dapat dikurasi tanpa bantuan developer.', 'P0', 'Sedang', 1, [], ['Pemilik toko dapat menerbitkan halaman produk tanpa deploy.', 'Gambar produk dioptimalkan otomatis untuk mobile.', 'Katalog mendukung varian, stok, dan harga per kanal.']),
      spec('Keranjang & checkout', 'Checkout satu halaman dengan alamat, pengiriman, dan ringkasan biaya yang transparan.', 'P0', 'Tinggi', 2, [0], ['Checkout dapat diselesaikan dalam tiga langkah utama.', 'Biaya tambahan terlihat sebelum pembayaran dimulai.', 'Keranjang tersimpan saat pengguna berpindah perangkat.']),
      spec('Pembayaran & rekonsiliasi', 'Pembayaran kartu, transfer, dan e-wallet dengan status yang dapat direkonsiliasi.', 'P0', 'Tinggi', 2, [0, 1], ['Webhook pembayaran diproses idempoten.', 'Status pembayaran dapat ditelusuri oleh admin.', 'Refund tercatat di ledger dan laporan penjualan.']),
      spec('Manajemen pesanan', 'Antrian pesanan, fulfillment, label pengiriman, dan komunikasi pelanggan.', 'P0', 'Sedang', 2, [1, 2], ['Pesanan baru muncul di antrian dalam < 30 detik.', 'Admin dapat memproses pesanan secara batch.', 'Pelanggan menerima riwayat status yang konsisten.']),
      spec('Promosi & loyalitas', 'Kode diskon, kampanye, dan program poin yang terhubung ke aturan harga.', 'P1', 'Sedang', 3, [1], ['Promo tidak dapat ditumpuk jika tidak diizinkan.', 'Kuota promo diperbarui secara atomik.', 'Penggunaan promo tercatat untuk analitik.']),
      spec('Analitik penjual', 'Dashboard penjualan, konversi, produk terlaris, dan retensi pembeli.', 'P1', 'Sedang', 3, [2, 3], ['Data penjualan tersedia maksimal 15 menit setelah transaksi.', 'Metrik dapat difilter per kanal dan periode.', 'Angka pada dashboard dapat ditelusuri ke definisi metrik.']),
      spec('Integrasi logistik', 'Koneksi kurir dan marketplace dengan sinkronisasi stok serta status pengiriman.', 'P1', 'Tinggi', 3, [3], ['Integrasi gagal sinkron menampilkan status dan aksi retry.', 'Stok tidak boleh negatif tanpa izin backorder.', 'Nomor resi tervalidasi sebelum dikirim ke pelanggan.']),
      spec('Operasional admin', 'Izin peran, audit trail, dan kontrol atas pengaturan toko.', 'P0', 'Sedang', 1, [], ['Setiap perubahan harga tercatat dengan aktor dan waktu.', 'Hanya Owner yang dapat mengubah rekening pencairan.', 'Sesi admin memiliki kontrol keamanan tambahan.']),
    ],
    stack: ['Next.js 15', 'TypeScript', 'PostgreSQL', 'Redis', 'S3-compatible storage'],
    integrations: ['Stripe', 'Midtrans-compatible gateway', 'JNE / logistics API', 'Meta Commerce'],
    entities: [
      { name: 'Store', fields: 'id, owner_id, domain, currency, status' },
      { name: 'Product', fields: 'id, store_id, name, variants, price, stock' },
      { name: 'Order', fields: 'id, store_id, customer_id, status, total, payment_status' },
      { name: 'Payment', fields: 'id, order_id, provider_ref, status, paid_at' },
      { name: 'InventoryEvent', fields: 'id, product_id, delta, reason, created_at' },
    ],
    endpoints: [
      { method: 'POST', path: '/v1/stores', purpose: 'Membuat toko baru.' },
      { method: 'POST', path: '/v1/checkouts', purpose: 'Menginisiasi sesi checkout.' },
      { method: 'POST', path: '/v1/webhooks/payments', purpose: 'Menerima event pembayaran secara idempoten.' },
      { method: 'PATCH', path: '/v1/orders/:id/fulfillment', purpose: 'Memproses pengiriman pesanan.' },
      { method: 'GET', path: '/v1/analytics/sales', purpose: 'Mengambil metrik penjualan teragregasi.' },
    ],
    storyOutcomes: [
      'pembeli menyelesaikan transaksi tanpa friksi yang tidak perlu.',
      'tim operasional memproses pesanan dengan lebih sedikit kesalahan.',
      'pemilik brand memahami performa penjualan secara real-time.',
      'promo meningkatkan pembelian ulang tanpa merusak margin.',
      'stok tetap akurat saat volume pesanan naik.',
    ],
    openQuestions: [
      'Marketplace mana yang harus didukung pada fase beta?',
      'Apakah pembayaran COD termasuk dalam ruang lingkup MVP?',
      'Bagaimana kebijakan retur untuk produk dengan varian berbeda?',
    ],
    fishboneProblem: 'Mengapa konversi dan operasional toko belum mencapai target?',
    extraScopeOut: ['Pencairan dana otomatis ke rekening bank', 'Aplikasi POS offline untuk toko fisik'],
  },
  ai: {
    key: 'ai',
    label: 'AI workspace',
    productType: 'ruang kerja AI untuk tim knowledge-intensive',
    tagline: 'Dari pertanyaan sulit ke keputusan yang bisa dipertanggungjawabkan.',
    audience: 'tim riset, strategi, dan operasi yang bekerja dengan banyak sumber pengetahuan',
    problem:
      'Tim kehilangan waktu untuk mencari konteks, mengulang prompt, dan memverifikasi jawaban model yang kualitasnya tidak stabil. Pengetahuan berharga tersebar di dokumen pribadi dan hasilnya sulit diaudit.',
    solution:
      'Workspace yang menyatukan sumber pengetahuan, prompt, model, dan hasil evaluasi. Setiap output membawa sitasi, versi, dan jejak keputusan sehingga AI dapat dipakai dengan percaya diri.',
    goals: [
      'Memotong waktu riset pengetahuan dari jam menjadi menit.',
      'Menjaga setiap output AI dapat ditelusuri ke sumber aslinya.',
      'Mengurangi biaya model inference melalui routing yang sadar biaya.',
    ],
    metrics: [
      { name: 'Answer groundedness', target: '≥ 92%', description: 'Jawaban yang seluruh klaimnya didukung sumber.' },
      { name: 'Time to insight', target: '-45%', description: 'Waktu dari pertanyaan hingga draft yang dapat direview.' },
      { name: 'Cost per answer', target: '< $0.04', description: 'Biaya rata-rata inferensi per pertanyaan.' },
    ],
    personas: personas([
      ['Maya Anggraini', 'Head of Research', 'Saya perlu jawaban yang bisa saya pertanggungjawabkan ke dewan.', 'Menghabiskan berjam-jam memverifikasi output AI dan mencari sumber.', 'Mempercepat riset tanpa mengorbankan ketelitian.'],
      ['Fajar Nugroho', 'Operations Manager', 'Saya ingin tim saya berhenti mengulang pertanyaan yang sama.', 'Knowledge base ada, tetapi sulit ditemukan saat dibutuhkan.', 'Mengubah pengetahuan tim menjadi alur kerja yang konsisten.'],
      ['Citra Dewi', 'AI Product Manager', 'Kualitas model berubah; saya butuh bukti, bukan perasaan.', 'Tidak punya evaluasi terukur sebelum mengganti prompt atau model.', 'Merilis fitur AI dengan confidence yang lebih tinggi.'],
    ]),
    features: [
      spec('Canvas prompt-first', 'Editor prompt dengan konteks, variabel, dan preview output dalam satu permukaan.', 'P0', 'Sedang', 1, [], ['Prompt dapat disimpan dan diberi versi.', 'Variabel tervalidasi sebelum dijalankan.', 'Pengguna dapat membandingkan dua output berdampingan.']),
      spec('Knowledge base & retrieval', 'Hubungkan dokumen, URL, dan catatan dengan indexing serta sitasi sumber.', 'P0', 'Tinggi', 1, [0], ['Setiap jawaban menampilkan sumber yang dapat dibuka.', 'Sumber baru terindeks dalam < 5 menit.', 'Izin akses sumber diwarisi oleh pengguna.']),
      spec('Router multi-model', 'Pilih model berdasarkan tugas, kualitas, latensi, dan batas biaya yang ditetapkan tim.', 'P0', 'Tinggi', 2, [0], ['Routing dapat diuji dengan fallback otomatis.', 'Setiap permintaan mencatat model dan biaya.', 'Admin dapat menetapkan budget per workspace.']),
      spec('Output terstruktur', 'Ekstraksi ke JSON, tabel, atau brief dengan schema yang dapat divalidasi.', 'P1', 'Sedang', 2, [0, 2], ['Schema yang tidak valid ditolak sebelum disimpan.', 'Pengguna dapat memperbaiki field tanpa kehilangan data lain.', 'Output terstruktur dapat diekspor ke API.']),
      spec('Kolaborasi & versioning', 'Shared workspace untuk review prompt, komentar, dan version history.', 'P1', 'Sedang', 2, [0], ['Setiap versi memiliki diff dan aktor.', 'Komentar dapat di-resolve tanpa menghapusnya.', 'Restore versi tidak menghapus audit trail.']),
      spec('Evaluasi & guardrail', 'Golden dataset, evaluasi otomatis, dan policy untuk konten sensitif.', 'P1', 'Tinggi', 3, [1, 2], ['Evaluasi berjalan sebelum prompt dipromosikan.', 'Pelanggaran policy tercatat dengan alasan yang jelas.', 'Admin dapat mengatur ambang kualitas minimum.']),
      spec('Analitik biaya & kualitas', 'Dashboard penggunaan, biaya per fitur, dan tren kualitas jawaban.', 'P2', 'Sedang', 3, [2, 5], ['Biaya dapat diprediksi dari volume dan model.', 'Metrik kualitas dibedakan per use case.', 'Export laporan mendukung format CSV.']),
      spec('API & integrasi', 'Akses programatik, webhook, dan konektor ke alat pengetahuan populer.', 'P1', 'Sedang', 3, [0], ['API memiliki API key per environment.', 'Rate limit mengembalikan header yang dapat dibaca.', 'Webhook ditandatangani dan memiliki retry.']),
    ],
    stack: ['Next.js 15', 'TypeScript', 'PostgreSQL', 'pgvector', 'OpenAI-compatible API'],
    integrations: ['Notion', 'Google Drive', 'Slack', 'OpenAI / Anthropic'],
    entities: [
      { name: 'Workspace', fields: 'id, name, owner_id, monthly_budget' },
      { name: 'PromptVersion', fields: 'id, prompt_id, version, content, model, created_by' },
      { name: 'Source', fields: 'id, workspace_id, uri, checksum, indexed_at' },
      { name: 'Run', fields: 'id, prompt_version_id, model, tokens, cost, latency_ms' },
      { name: 'Evaluation', fields: 'id, run_id, dataset_id, score, passed, notes' },
    ],
    endpoints: [
      { method: 'POST', path: '/v1/prompts/:id/runs', purpose: 'Menjalankan prompt dengan konteks terpilih.' },
      { method: 'POST', path: '/v1/sources/sync', purpose: 'Memicu sinkronisasi knowledge source.' },
      { method: 'GET', path: '/v1/runs/:id/trace', purpose: 'Mengambil trace model, retrieval, dan biaya.' },
      { method: 'POST', path: '/v1/evaluations', purpose: 'Menjalankan evaluasi terhadap golden dataset.' },
      { method: 'PATCH', path: '/v1/policies/:id', purpose: 'Memperbarui guardrail workspace.' },
    ],
    storyOutcomes: [
      'tim menemukan jawaban yang dapat diverifikasi tanpa riset manual berulang.',
      'kualitas output AI dapat dibandingkan sebelum dirilis.',
      'biaya model tetap terkendali saat penggunaan bertambah.',
      'pengetahuan organisasi menjadi aset yang dapat dipakai ulang.',
      'keputusan berbasis AI memiliki jejak yang dapat diaudit.',
    ],
    openQuestions: [
      'Apakah data pelanggan boleh meninggalkan region tertentu?',
      'Model provider mana yang wajib tersedia untuk memenuhi SLA?',
      'Siapa yang berwenang menyetujui perubahan guardrail?',
    ],
    fishboneProblem: 'Mengapa kepercayaan dan efisiensi penggunaan AI masih rendah?',
    extraScopeOut: ['Fine-tuning model proprietary', 'Autonomous agent yang berjalan tanpa approval'],
  },
  education: {
    key: 'education',
    label: 'Learning',
    productType: 'platform belajar yang menghubungkan materi, praktik, dan umpan balik',
    tagline: 'Belajar dengan arah yang jelas, bukan sekadar menonton.',
    audience: 'pengajar independen dan pembelajar dewasa yang ingin naik level',
    problem:
      'Konten belajar berlimpah tetapi arahnya tidak jelas. Pembelajar menyelesaikan video tanpa praktik, sementara pengajar sulit melihat siapa yang benar-benar berkembang.',
    solution:
      'Pengalaman belajar yang menggabungkan jalur adaptif, praktik kontekstual, dan umpan balik. Pengajar mendapat sinyal yang dapat ditindaklanjuti, pembelajar mendapat langkah berikutnya yang jelas.',
    goals: [
      'Meningkatkan penyelesaian jalur belajar aktif minimal 40%.',
      'Memberi umpan balik yang relevan dalam waktu kurang dari 24 jam.',
      'Membantu pengajar mengidentifikasi peserta berisiko lebih awal.',
    ],
    metrics: [
      { name: 'Learning path completion', target: '≥ 55%', description: 'Peserta yang menyelesaikan 80% modul dalam satu jalur.' },
      { name: 'Practice submission', target: '≥ 70%', description: 'Peserta yang mengumpulkan minimal satu praktik per modul.' },
      { name: 'Feedback turnaround', target: '< 24 jam', description: 'Waktu dari submission ke feedback bermakna.' },
    ],
    personas: personas([
      ['Laras Wibowo', 'Course creator', 'Saya ingin peserta benar-benar bisa, bukan sekadar lulus video.', 'Sulit melihat bagian materi yang paling sering membingungkan.', 'Memperbaiki kurikulum berdasarkan bukti belajar.'],
      ['Bima Saputra', 'Career switcher', 'Saya butuh tahu langkah berikutnya tanpa bingung memilih.', 'Mulai banyak kursus tetapi berhenti di tengah jalan.', 'Menyelesaikan portofolio yang relevan dengan pekerjaan impian.'],
      ['Nadia Kusuma', 'Learning facilitator', 'Saya ingin intervensi sebelum peserta menghilang.', 'Data progres baru terlihat di akhir kelas.', 'Mendampingi peserta dengan sinyal yang tepat waktu.'],
    ]),
    features: [
      spec('Course builder', 'Susun modul, materi, sesi live, dan praktik dengan editor berbasis blok.', 'P0', 'Sedang', 1, [], ['Modul dapat disusun dan dipreview tanpa deploy.', 'Konten draft tidak terlihat oleh peserta.', 'Setiap perubahan menyimpan versi sebelumnya.']),
      spec('Learning path adaptif', 'Rekomendasi urutan materi berdasarkan tujuan, hasil asesmen, dan aktivitas.', 'P0', 'Tinggi', 2, [0], ['Setiap rekomendasi dapat dijelaskan alasannya.', 'Peserta dapat mengambil jalur tanpa rekomendasi.', 'Perubahan jalur tidak menghapus progres sebelumnya.']),
      spec('Kelas live & async', 'Jadwal kelas, ruang diskusi, dan rekaman yang terhubung dengan modul.', 'P1', 'Sedang', 2, [0], ['Peserta menerima pengingat 24 jam dan 15 menit sebelum sesi.', 'Rekaman tersedia hanya bagi peserta terdaftar.', 'Catatan sesi dapat diubah menjadi materi modul.']),
      spec('Asesmen & feedback', 'Kuis, tugas praktik, rubric, dan feedback yang dapat digunakan ulang.', 'P0', 'Sedang', 2, [0], ['Rubrik tampil sebelum peserta mengumpulkan tugas.', 'Feedback dapat disimpan sebagai template.', 'Nilai akhir dapat direkonsiliasi oleh pengajar.']),
      spec('Progres & sertifikat', 'Pelacakan kompetensi, streak, dan sertifikat yang dapat diverifikasi.', 'P1', 'Sedang', 3, [1, 3], ['Progres dihitung dari aktivitas bermakna, bukan waktu tonton saja.', 'Sertifikat memiliki ID verifikasi publik.', 'Peserta dapat mengunduh transkrip capaian.']),
      spec('Komunitas belajar', 'Ruang diskusi per modul dengan pertanyaan, jawaban, dan moderasi.', 'P2', 'Sedang', 3, [2], ['Pertanyaan dapat ditandai sebagai terjawab.', 'Moderator dapat menyembunyikan konten melanggar.', 'Notifikasi diskusi dapat diatur per topik.']),
      spec('Analitik pengajar', 'Dashboard penyelesaian, titik drop-off, dan kualitas konten.', 'P1', 'Sedang', 3, [3, 4], ['Penyelesaian dihitung per modul dan per kohort.', 'Pengajar dapat mengekspor data tanpa identitas sensitif.', 'Titik drop-off memiliki minimal 20 sampel sebelum ditampilkan.']),
      spec('Integrasi & SSO', 'Integrasi video, kalender, dan akses organisasi melalui SSO.', 'P2', 'Tinggi', 3, [0], ['SSO mendukung koneksi berbasis SAML.', 'Kursus tetap dapat diakses jika provider video sedang down.', 'Admin dapat mengelola akses berdasarkan grup.']),
    ],
    stack: ['Next.js 15', 'TypeScript', 'PostgreSQL', 'Redis', 'Mux'],
    integrations: ['Zoom', 'Google Calendar', 'Stripe', 'Google SSO'],
    entities: [
      { name: 'Course', fields: 'id, creator_id, title, status, published_at' },
      { name: 'Module', fields: 'id, course_id, position, title, content_ref' },
      { name: 'Enrollment', fields: 'id, course_id, learner_id, progress, status' },
      { name: 'Submission', fields: 'id, learner_id, assessment_id, content, score, feedback' },
      { name: 'Credential', fields: 'id, learner_id, course_id, verification_code, issued_at' },
    ],
    endpoints: [
      { method: 'POST', path: '/v1/courses', purpose: 'Membuat course baru.' },
      { method: 'POST', path: '/v1/courses/:id/publish', purpose: 'Mempublikasikan versi course.' },
      { method: 'GET', path: '/v1/learners/:id/next-step', purpose: 'Mendapatkan rekomendasi langkah berikutnya.' },
      { method: 'POST', path: '/v1/submissions', purpose: 'Mengirim tugas praktik.' },
      { method: 'GET', path: '/v1/credentials/:code', purpose: 'Memverifikasi sertifikat.' },
    ],
    storyOutcomes: [
      'pembelajar selalu tahu langkah berikutnya yang paling relevan.',
      'pengajar dapat memperbaiki materi berdasarkan bukti, bukan asumsi.',
      'praktik menjadi bagian alami dari proses belajar.',
      'umpan balik datang saat masih relevan.',
      'penyelesaian belajar meningkat tanpa menurunkan kualitas.',
    ],
    openQuestions: [
      'Apakah sertifikat perlu diakui oleh mitra industri pada fase pertama?',
      'Bagaimana kebijakan akses materi setelah langganan berakhir?',
      'Apakah peserta boleh berbagi akun dalam satu organisasi?',
    ],
    fishboneProblem: 'Mengapa tingkat penyelesaian dan kualitas belajar belum optimal?',
    extraScopeOut: ['Marketplace kursus pihak ketiga', 'Ujian proctoring dengan pengawasan video'],
  },
  health: {
    key: 'health',
    label: 'Kesehatan',
    productType: 'pendamping kesehatan personal yang berfokus pada kebiasaan',
    tagline: 'Kebiasaan kecil, arah yang lebih sehat.',
    audience: 'profesional sibuk dan coach yang mendampingi perubahan gaya hidup',
    problem:
      'Nasihat kesehatan umum sulit diterapkan pada ritme hidup nyata. Pengguna mencatat seminggu lalu berhenti, sementara coach tidak memiliki gambaran yang cukup untuk memberi bantuan yang relevan.',
    solution:
      'Rencana yang menyesuaikan energi, jadwal, dan preferensi pengguna. Data yang ringan dicatat berubah menjadi pola bermakna dan percakapan coaching yang lebih tepat sasaran.',
    goals: [
      'Membantu pengguna mempertahankan setidaknya tiga kebiasaan inti selama 30 hari.',
      'Meningkatkan keterlibatan mingguan dengan coach minimal 50%.',
      'Menjaga data kesehatan tetap privat, transparan, dan dapat dihapus.',
    ],
    metrics: [
      { name: 'Habit adherence', target: '≥ 65%', description: 'Kebiasaan inti yang tercatat dalam 30 hari.' },
      { name: 'Weekly check-in', target: '50%', description: 'Pengguna aktif yang menyelesaikan check-in mingguan.' },
      { name: 'Coach response time', target: '< 12 jam', description: 'Waktu respons coach terhadap sinyal pengguna.' },
    ],
    personas: personas([
      ['Alya Prameswari', 'Marketing manager', 'Saya tidak butuh program sempurna; saya butuh yang bisa saya jalani.', 'Jadwal padat membuat rencana olahraga dan tidur selalu terlewat.', 'Merasa lebih berenergi dengan perubahan kecil yang konsisten.'],
      ['dr. Rani Ardhia', 'Health coach', 'Saya ingin melihat pola sebelum klien kehilangan motivasi.', 'Data klien tersebar di chat dan catatan manual.', 'Mendampingi lebih banyak klien dengan kualitas yang tetap personal.'],
      ['Yoga Pratama', 'Remote worker', 'Duduk seharian membuat tubuh saya berisyarat, tetapi saya tidak tahu mulai dari mana.', 'Pengingat terlalu banyak dan tidak sesuai konteks.', 'Membangun rutinitas singkat yang benar-benar dilakukan.'],
    ]),
    features: [
      spec('Profil & onboarding sehat', 'Asesmen awal untuk tujuan, batasan, preferensi, dan riwayat yang relevan.', 'P0', 'Sedang', 1, [], ['Onboarding selesai dalam < 5 menit.', 'Pengguna dapat melewati pertanyaan sensitif.', 'Tujuan dan batasan dapat diubah kapan saja.']),
      spec('Pelacakan kebiasaan ringan', 'Pencatatan aktivitas, tidur, hidrasi, dan check-in suasana hati dengan friksi minimal.', 'P0', 'Rendah', 2, [0], ['Satu check-in dapat diselesaikan dalam < 20 detik.', 'Data yang belum tersinkron disimpan lokal.', 'Riwayat dapat difilter per jenis kebiasaan.']),
      spec('Rencana personal', 'Rencana harian yang menyesuaikan waktu, energi, dan preferensi pengguna.', 'P0', 'Tinggi', 2, [0, 1], ['Rencana dapat disesuaikan tanpa kehilangan progres.', 'Rekomendasi menjelaskan alasan di balik perubahan.', 'Rencana tidak memberi saran medis diagnosis.']),
      spec('Insight & tren', 'Ringkasan pola kebiasaan, korelasi sederhana, dan pencapaian.', 'P1', 'Sedang', 3, [1], ['Insight ditampilkan setelah minimal 7 hari data.', 'Setiap tren menyertakan periode pembanding.', 'Pengguna dapat menandai insight yang tidak relevan.']),
      spec('Coaching & check-in', 'Ruang komunikasi dengan coach, ringkasan progres, dan catatan sesi.', 'P1', 'Tinggi', 2, [0, 1], ['Coach hanya melihat data yang diizinkan pengguna.', 'Check-in mingguan dapat dikirim sesuai jadwal.', 'Catatan sesi tidak terlihat oleh pihak lain.']),
      spec('Pengingat kontekstual', 'Notifikasi adaptif berdasarkan jadwal, lokasi opsional, dan pola keberhasilan.', 'P1', 'Sedang', 3, [2], ['Pengguna dapat mengatur frekuensi dan jam tenang.', 'Notifikasi berhenti setelah beberapa kali tidak direspons.', 'Tidak ada pengingat yang memicu rasa bersalah.']),
      spec('Privasi & consent', 'Kontrol izin data, audit akses, dan penghapusan data yang transparan.', 'P0', 'Tinggi', 1, [], ['Persetujuan dicatat dengan versi dan waktu.', 'Akses coach dapat dicabut dalam satu klik.', 'Permintaan ekspor data selesai dalam 72 jam.']),
      spec('Integrasi wearable', 'Sinkronisasi langkah, tidur, dan detak jantung dari perangkat yang didukung.', 'P2', 'Tinggi', 3, [1, 2], ['Kegagalan sinkronisasi dapat dicoba ulang.', 'Data mentah tidak ditampilkan tanpa konteks.', 'Pengguna memilih jenis data yang dibagikan.']),
    ],
    stack: ['React Native', 'Expo', 'TypeScript', 'PostgreSQL', 'HealthKit / Health Connect'],
    integrations: ['Apple Health', 'Google Health Connect', 'Zoom', 'Stripe'],
    entities: [
      { name: 'Profile', fields: 'id, user_id, goals, constraints, consent_version' },
      { name: 'Habit', fields: 'id, user_id, type, target, schedule, visibility' },
      { name: 'CheckIn', fields: 'id, user_id, mood, energy, notes, created_at' },
      { name: 'Plan', fields: 'id, user_id, version, source, status' },
      { name: 'CoachNote', fields: 'id, coach_id, client_id, summary, created_at' },
    ],
    endpoints: [
      { method: 'POST', path: '/v1/profiles', purpose: 'Menyimpan profil dan preferensi awal.' },
      { method: 'POST', path: '/v1/check-ins', purpose: 'Mencatat check-in harian.' },
      { method: 'GET', path: '/v1/insights/trends', purpose: 'Mengambil tren kebiasaan dengan periode pembanding.' },
      { method: 'POST', path: '/v1/consents', purpose: 'Mencatat persetujuan data versi terbaru.' },
      { method: 'DELETE', path: '/v1/me/health-data', purpose: 'Menghapus seluruh data kesehatan pengguna.' },
    ],
    storyOutcomes: [
      'pengguna dapat mempertahankan kebiasaan di tengah jadwal yang padat.',
      'coach memberi bantuan berdasarkan pola yang nyata.',
      'insight terasa relevan dan tidak menghakimi.',
      'pengguna tetap memegang kendali penuh atas data kesehatannya.',
      'perubahan kecil terasa cukup untuk melanjutkan.',
    ],
    openQuestions: [
      'Apakah produk memerlukan sertifikasi perangkat medis di pasar awal?',
      'Seberapa jauh coach boleh melihat data mentah pengguna?',
      'Bagaimana prosedur eskalasi jika pengguna menunjukkan sinyal risiko tinggi?',
    ],
    fishboneProblem: 'Mengapa adherence kebiasaan dan retensi pengguna masih rendah?',
    extraScopeOut: ['Resep atau diagnosis medis', 'Klaim asuransi kesehatan'],
  },
  crm: {
    key: 'crm',
    label: 'CRM',
    productType: 'revenue workspace untuk tim penjualan yang sedang tumbuh',
    tagline: 'Lebih sedikit administrasi, lebih banyak percakapan bernilai.',
    audience: 'tim penjualan B2B dan sales operations',
    problem:
      'Peluang penjualan tercatat tidak konsisten, follow-up bergantung pada ingatan, dan forecast dibangun dari spreadsheet. Tim kehilangan momentum pada momen yang seharusnya bisa dikonversi.',
    solution:
      'Satu workspace yang merangkum hubungan pelanggan, percakapan, dan langkah berikutnya. Otomasi mengambil alih administrasi, sementara tim fokus pada percakapan yang menggerakkan revenue.',
    goals: [
      'Meningkatkan jumlah follow-up tepat waktu minimal 35%.',
      'Mengurangi waktu administrasi sales per minggu sebanyak 5 jam.',
      'Membuat forecast lebih akurat dengan data aktivitas yang konsisten.',
    ],
    metrics: [
      { name: 'Follow-up on time', target: '≥ 90%', description: 'Aktivitas lanjutan yang selesai sesuai jadwal.' },
      { name: 'Forecast accuracy', target: '± 10%', description: 'Selisih antara forecast dan revenue aktual.' },
      { name: 'Data completeness', target: '≥ 95%', description: 'Peluang yang memiliki kontak, tahap, dan nilai.' },
    ],
    personas: personas([
      ['Andre Hermawan', 'Sales Lead', 'Saya butuh mempercayai angka forecast sebelum membawanya ke board.', 'Pipeline tidak konsisten karena data diisi terlambat.', 'Mengambil keputusan hiring dan target dengan data yang kuat.'],
      ['Citra Paramita', 'Account Executive', 'Saya ingin menghabiskan waktu untuk percakapan, bukan memperbarui field.', 'Administrasi CRM memakan waktu setelah setiap meeting.', 'Membawa lebih banyak deal ke tahap berikutnya.'],
      ['Rafael Tanu', 'Sales Operations', 'Saya ingin proses yang bersih tanpa mengawasi setiap orang.', 'Data duplikat dan integrasi tidak sinkron membuat laporan kacau.', 'Membangun alur revenue yang dapat diskalakan.'],
    ]),
    features: [
      spec('Profil kontak 360°', 'Satu profil yang merangkum kontak, perusahaan, percakapan, dan peluang.', 'P0', 'Sedang', 1, [], ['Kontak duplikat dapat digabung tanpa kehilangan riwayat.', 'Setiap profil menampilkan pemilik dan sumber data.', 'Catatan sensitif dapat dibatasi per peran.']),
      spec('Pipeline penjualan', 'Tahap deal, probabilitas, nilai, dan alasan menang atau kalah yang konsisten.', 'P0', 'Sedang', 2, [0], ['Tahap deal dapat dikonfigurasi oleh admin.', 'Perubahan nilai tercatat di activity log.', 'Board dapat difilter per owner dan periode.']),
      spec('Sequences & email', 'Urutan follow-up dengan template personalisasi dan jeda yang dapat diatur.', 'P1', 'Sedang', 2, [0], ['Pengiriman email menghormati opt-out.', 'Setiap sequence dapat dijeda per kontak.', 'Klik dan balasan tercatat pada profil kontak.']),
      spec('Meeting intelligence', 'Catatan meeting, action item, dan ringkasan otomatis yang terhubung ke deal.', 'P1', 'Tinggi', 3, [0, 2], ['Rekaman hanya diproses setelah semua peserta setuju.', 'Action item dapat diubah menjadi task.', 'Ringkasan tidak membagikan data ke pihak lain tanpa izin.']),
      spec('Forecast & target', 'Forecast berbobot berdasarkan tahap, aktivitas, dan sinyal risiko deal.', 'P1', 'Tinggi', 3, [1, 3], ['Forecast menampilkan asumsi dan cakupan data.', 'Target dapat dipecah per tim dan periode.', 'Perubahan forecast dapat dibandingkan antar versi.']),
      spec('Otomasi follow-up', 'Aturan untuk membuat task, memperbarui tahap, dan mengingatkan pemilik deal.', 'P1', 'Sedang', 3, [1], ['Aturan dapat diuji sebelum aktif.', 'Setiap otomasi mencatat pemilik dan alasan eksekusi.', 'Pemilik deal dapat menghentikan otomasi untuk kontak tertentu.']),
      spec('Team inbox', 'Percakapan email dan chat yang dapat diklaim, dialihkan, dan ditutup tim.', 'P2', 'Sedang', 3, [0, 2], ['Percakapan yang sama tidak ditangani dua orang tanpa peringatan.', 'Riwayat tetap tersedia setelah dialihkan.', 'Template dapat dibagikan ke anggota tim.']),
      spec('Integrasi & data hygiene', 'Koneksi ke email, kalender, dan ERP dengan validasi serta deduplikasi data.', 'P0', 'Tinggi', 1, [], ['Integrasi dapat dijeda tanpa menghapus data.', 'Field wajib divalidasi sebelum deal masuk forecast.', 'Deduplikasi berjalan sebelum impor massal selesai.']),
    ],
    stack: ['Next.js 15', 'TypeScript', 'PostgreSQL', 'Redis', 'OpenSearch'],
    integrations: ['Gmail', 'Google Calendar', 'Slack', 'Midtrans-compatible billing'],
    entities: [
      { name: 'Contact', fields: 'id, name, email, company_id, owner_id, source' },
      { name: 'Company', fields: 'id, name, domain, segment, employee_count' },
      { name: 'Deal', fields: 'id, contact_id, amount, stage, probability, close_date' },
      { name: 'Activity', fields: 'id, deal_id, type, actor_id, due_at, completed_at' },
      { name: 'ForecastSnapshot', fields: 'id, period, version, total, created_at' },
    ],
    endpoints: [
      { method: 'POST', path: '/v1/contacts/merge', purpose: 'Menggabungkan kontak duplikat.' },
      { method: 'PATCH', path: '/v1/deals/:id/stage', purpose: 'Memindahkan tahap deal dan mencatat audit.' },
      { method: 'POST', path: '/v1/sequences/:id/enroll', purpose: 'Memasukkan kontak ke urutan follow-up.' },
      { method: 'GET', path: '/v1/forecast', purpose: 'Mengambil forecast per periode.' },
      { method: 'POST', path: '/v1/integrations/:id/sync', purpose: 'Memicu sinkronisasi integrasi.' },
    ],
    storyOutcomes: [
      'sales dapat fokus pada percakapan yang paling mungkin menghasilkan revenue.',
      'tidak ada follow-up penting yang tenggelam karena administrasi.',
      'forecast dapat dipercaya untuk keputusan tim.',
      'pemimpin melihat risiko pipeline sebelum terlambat.',
      'data pelanggan tetap bersih saat tim dan alat bertambah.',
    ],
    openQuestions: [
      'Apakah email enterprise perlu disimpan penuh di sistem?',
      'Apa definisi stage yang disepakati untuk semua segmen?',
      'Bagaimana kebijakan akses terhadap catatan meeting sensitif?',
    ],
    fishboneProblem: 'Mengapa konsistensi pipeline dan akurasi forecast belum tercapai?',
    extraScopeOut: ['Billing dan manajemen kontrak lengkap', 'Dialer telepon dengan rekaman otomatis'],
  },
  travel: {
    key: 'travel',
    label: 'Travel',
    productType: 'perencana perjalanan kolaboratif',
    tagline: 'Perjalanan yang terasa ringan sejak sebelum berangkat.',
    audience: 'traveler independen dan kelompok kecil yang merencanakan perjalanan bersama',
    problem:
      'Rencana perjalanan tersebar di chat, screenshot, dan puluhan tab. Harga berubah tanpa terpantau, sementara anggota kelompok punya preferensi yang tidak pernah benar-benar selaras.',
    solution:
      'Itinerary hidup yang menyatukan inspirasi, booking, biaya, dan kesepakatan kelompok. Informasi penting tetap dapat diakses bahkan ketika koneksi hilang.',
    goals: [
      'Memangkas waktu perencanaan perjalanan lebih dari 40%.',
      'Mengurangi konflik jadwal dan biaya antaranggota kelompok.',
      'Memberi traveler rasa aman dengan informasi yang tepat saat dibutuhkan.',
    ],
    metrics: [
      { name: 'Trip activation', target: '≥ 60%', description: 'Pengguna yang membuat itinerary pertama dalam 48 jam.' },
      { name: 'Collaborative trips', target: '35%', description: 'Perjalanan dengan minimal dua kolaborator aktif.' },
      { name: 'Offline access', target: '< 1.5 detik', description: 'Waktu memuat itinerary dari cache offline.' },
    ],
    personas: personas([
      ['Kara Maheswari', 'Travel planner kelompok', 'Saya senang merencanakan, tetapi tidak ingin menjadi helpdesk perjalanan.', 'Mengulang informasi yang sama di banyak chat dan spreadsheet.', 'Membuat perjalanan yang semua orang nikmati tanpa drama.'],
      ['Yoga Ramadhan', 'Remote worker', 'Saya butuh fleksibilitas untuk bekerja sambil berpindah kota.', 'Wi-Fi, check-in, dan jadwal kerja tidak terintegrasi.', 'Menemukan ritme perjalanan yang produktif.'],
      ['Nina Hartono', 'Solo traveler', 'Saya ingin spontan, tetapi tetap aman dan siap.', 'Informasi lokal penting tersebar dan sulit diverifikasi.', 'Mengambil keputusan cepat dengan informasi yang dapat dipercaya.'],
    ]),
    features: [
      spec('Discovery destinasi', 'Inspirasi destinasi dan aktivitas yang dipersonalisasi berdasarkan preferensi dan musim.', 'P1', 'Sedang', 1, [], ['Rekomendasi dapat difilter berdasarkan budget dan durasi.', 'Setiap rekomendasi menampilkan sumber informasi.', 'Konten yang disponsori diberi label jelas.']),
      spec('Itinerary kolaboratif', 'Susun hari per hari, tambahkan aktivitas, dan voting untuk pilihan bersama.', 'P0', 'Sedang', 2, [0], ['Perubahan real-time terlihat oleh kolaborator.', 'Konflik waktu ditandai sebelum disimpan.', 'Versi itinerary dapat dipulihkan.']),
      spec('Booking & price watch', 'Pantau harga dan kelola tautan booking dengan status serta pengingat.', 'P0', 'Tinggi', 2, [1], ['Harga yang dipantau memiliki timestamp sumber.', 'Pengingat dikirim saat harga melewati target.', 'Booking eksternal tidak diklaim sebagai konfirmasi tanpa sumber.']),
      spec('Mode offline', 'Akses itinerary, alamat, dokumen, dan catatan penting tanpa koneksi.', 'P0', 'Sedang', 2, [1], ['Data penting tersedia setelah aplikasi dibuka sekali.', 'Perubahan offline disinkronkan dengan resolusi konflik.', 'Pengguna diberi tanda jelas saat data mungkin sudah usang.']),
      spec('Split bill perjalanan', 'Catat pengeluaran bersama, hitung pembagian, dan tunjukkan siapa berutang ke siapa.', 'P1', 'Sedang', 3, [1], ['Mata uang asing dapat dikonversi dengan kurs bertimestamp.', 'Pengeluaran dapat dilampiri bukti.', 'Perhitungan akhir dapat diekspor.']),
      spec('Safety & info lokal', 'Kontak darurat, tips lokal, dan status perjalanan yang relevan dengan lokasi.', 'P1', 'Sedang', 3, [0], ['Kontak darurat dapat diakses tanpa koneksi.', 'Tips lokal menampilkan tanggal pembaruan.', 'Lokasi presisi bersifat opt-in.']),
      spec('Integrasi partner', 'Koneksi ke maskapai, hotel, dan kalender tanpa menyimpan kredensial sensitif.', 'P1', 'Tinggi', 3, [2], ['Tautan booking menghasilkan status yang jelas.', 'Sinkronisasi kalender tidak menggandakan event.', 'Kredensial pihak ketiga tidak disimpan di klien.']),
      spec('Profil traveler', 'Preferensi perjalanan, dokumen, dan aksesibilitas yang dapat digunakan ulang.', 'P2', 'Rendah', 3, [0], ['Dokumen pribadi dienkripsi saat disimpan.', 'Preferensi dapat diwariskan ke itinerary baru.', 'Dokumen dapat dihapus secara permanen.']),
    ],
    stack: ['React Native', 'Expo', 'TypeScript', 'PostgreSQL', 'Mapbox'],
    integrations: ['Google Maps', 'Google Calendar', 'Stripe', 'Booking partner API'],
    entities: [
      { name: 'Trip', fields: 'id, owner_id, title, start_date, end_date, currency' },
      { name: 'ItineraryItem', fields: 'id, trip_id, day, start_time, title, location' },
      { name: 'Collaborator', fields: 'id, trip_id, user_id, role, joined_at' },
      { name: 'Expense', fields: 'id, trip_id, payer_id, amount, currency, split_json' },
      { name: 'PriceWatch', fields: 'id, user_id, target_price, last_price, expires_at' },
    ],
    endpoints: [
      { method: 'POST', path: '/v1/trips', purpose: 'Membuat perjalanan baru.' },
      { method: 'POST', path: '/v1/trips/:id/invites', purpose: 'Mengundang kolaborator.' },
      { method: 'GET', path: '/v1/trips/:id/offline-bundle', purpose: 'Mengambil paket data untuk akses offline.' },
      { method: 'POST', path: '/v1/trips/:id/expenses', purpose: 'Mencatat pengeluaran bersama.' },
      { method: 'GET', path: '/v1/price-watches/:id', purpose: 'Mengambil status pemantauan harga.' },
    ],
    storyOutcomes: [
      'semua orang dalam perjalanan melihat rencana yang sama.',
      'keputusan perjalanan dibuat tanpa menunggu balasan chat.',
      'informasi penting tetap dapat diakses di koneksi yang buruk.',
      'biaya bersama selesai tanpa kalkulasi manual yang canggung.',
      'perjalanan terasa lebih aman dan tenang.',
    ],
    openQuestions: [
      'Apakah booking transaksional langsung masuk ruang lingkup MVP?',
      'Wilayah mana yang menjadi fokus konten lokal pertama?',
      'Bagaimana kebijakan data lokasi pengguna di negara dengan regulasi berbeda?',
    ],
    fishboneProblem: 'Mengapa perencanaan perjalanan bersama masih terasa rumit?',
    extraScopeOut: ['Pemesanan tiket langsung dengan settlement penuh', 'Asuransi perjalanan'],
  },
  social: {
    key: 'social',
    label: 'Komunitas',
    productType: 'ruang komunitas yang menempatkan kualitas percakapan di depan',
    tagline: 'Tempat untuk menemukan orang yang benar-benar relevan.',
    audience: 'komunitas niche, creator, dan organizer event',
    problem:
      'Platform sosial besar mengoptimalkan waktu layar, bukan koneksi yang bermakna. Komunitas kecil kesulitan membangun ruang aman, konteks, dan ritme percakapan yang sehat.',
    solution:
      'Kombinasi feed terkurasi, komunitas fokus, dan event yang memberi alasan nyata untuk hadir. Moderasi hadir sebagai lapisan produk, bukan setelah masalah terjadi.',
    goals: [
      'Meningkatkan percakapan bermakna per anggota minimal dua kali.',
      'Membuat moderator menemukan sinyal risiko lebih cepat.',
      'Membantu komunitas niche mempertahankan anggota aktif.',
    ],
    metrics: [
      { name: 'Meaningful conversations', target: '≥ 2.2 / member', description: 'Thread dengan lebih dari tiga balasan substantif per bulan.' },
      { name: 'Moderation response', target: '< 15 menit', description: 'Waktu dari laporan ke tindakan moderator.' },
      { name: 'Member retention', target: '48%', description: 'Anggota aktif yang kembali pada bulan kedua.' },
    ],
    personas: personas([
      ['Nara Aditya', 'Community manager', 'Saya ingin ruang yang hangat tanpa kehilangan kendali.', 'Moderasi manual dan notifikasi yang tidak relevan menguras energi.', 'Membangun komunitas yang tumbuh dengan aturan yang jelas.'],
      ['Rio Saputra', 'Creator niche', 'Saya ingin karya saya ditemukan orang yang tepat, bukan semua orang.', 'Feed ramai tetapi sedikit percakapan yang benar-benar berarti.', 'Membangun audiens yang terlibat dan loyal.'],
      ['Intan Permata', 'Anggota komunitas', 'Saya bergabung untuk belajar, bukan untuk berdebat tanpa arah.', 'Percakapan toksik dan spam membuat saya berhenti berpartisipasi.', 'Menemukan teman dan mentor dengan minat yang sama.'],
    ]),
    features: [
      spec('Profil & onboarding', 'Profil minat, identitas, dan preferensi privasi yang membantu pencocokan komunitas.', 'P0', 'Rendah', 1, [], ['Onboarding dapat selesai dalam < 3 menit.', 'Pengguna memilih visibilitas tiap bagian profil.', 'Minat dapat diubah tanpa kehilangan riwayat.']),
      spec('Feed personal', 'Feed kronologis dan terkurasi dengan kontrol kualitas daripada engagement maksimum.', 'P0', 'Tinggi', 2, [0], ['Pengguna dapat memilih sinyal yang membentuk feed.', 'Konten yang dibayar atau disponsori diberi label.', 'Konten dari komunitas yang diblokir tidak muncul.']),
      spec('Komunitas & topik', 'Ruang komunitas dengan aturan, peran, dan identitas yang jelas.', 'P0', 'Sedang', 2, [0], ['Setiap komunitas memiliki aturan yang tampil sebelum bergabung.', 'Moderator dapat memberi peran khusus.', 'Konten dapat dipindahkan ke topik yang relevan.']),
      spec('Pesan realtime', 'Percakapan langsung dan thread dengan kontrol notifikasi.', 'P1', 'Tinggi', 2, [0, 1], ['Pesan yang gagal terkirim dapat dicoba ulang.', 'Status dibaca dapat dinonaktifkan.', 'Pesan dari pengguna yang diblokir tidak dikirim.']),
      spec('Notifikasi pintar', 'Notifikasi yang menggabungkan sinyal relevansi dengan kontrol pengguna.', 'P1', 'Sedang', 3, [1, 2], ['Pengguna dapat memilih frekuensi per jenis sinyal.', 'Notifikasi duplikat digabungkan.', 'Mode fokus tersedia tanpa perlu membuka pengaturan.']),
      spec('Moderasi & keamanan', 'Antrean laporan, klasifikasi risiko, dan aksi moderasi yang dapat diaudit.', 'P0', 'Tinggi', 2, [1, 2], ['Laporan memiliki prioritas berdasarkan risiko.', 'Keputusan moderator menyimpan alasan dan aktor.', 'Konten sensitif dapat disembunyikan sebelum review.']),
      spec('Creator analytics', 'Metrik audiens dan kesehatan komunitas yang menghindari vanity metrics.', 'P2', 'Sedang', 3, [1, 3], ['Metrik kesehatan komunitas memiliki definisi yang terlihat.', 'Creator dapat mengekspor data agregat.', 'Data individu anggota tidak ditampilkan.']),
      spec('Event komunitas', 'Event online dan offline dengan RSVP, izin, dan recap.', 'P2', 'Sedang', 3, [2], ['Peserta menerima pengingat dan perubahan jadwal.', 'Kapasitas event tidak boleh terlampaui.', 'Recap hanya membagikan konten yang diizinkan.']),
    ],
    stack: ['Next.js 15', 'TypeScript', 'PostgreSQL', 'Redis', 'WebSocket'],
    integrations: ['Google Calendar', 'Stripe', 'Cloudflare Stream', 'Discord'],
    entities: [
      { name: 'Profile', fields: 'id, user_id, handle, interests, privacy_json' },
      { name: 'Community', fields: 'id, name, slug, owner_id, rules_version' },
      { name: 'Post', fields: 'id, author_id, community_id, content, visibility, status' },
      { name: 'Conversation', fields: 'id, participant_ids, last_message_at, muted_by' },
      { name: 'ModerationCase', fields: 'id, report_id, priority, status, reviewer_id' },
    ],
    endpoints: [
      { method: 'POST', path: '/v1/communities', purpose: 'Membuat komunitas baru.' },
      { method: 'POST', path: '/v1/posts', purpose: 'Menerbitkan konten ke feed.' },
      { method: 'GET', path: '/v1/feed', purpose: 'Mengambil feed sesuai preferensi pengguna.' },
      { method: 'POST', path: '/v1/reports', purpose: 'Mengirim laporan moderasi.' },
      { method: 'POST', path: '/v1/events/:id/rsvp', purpose: 'Mendaftar ke event komunitas.' },
    ],
    storyOutcomes: [
      'anggota menemukan percakapan yang relevan tanpa tenggelam dalam noise.',
      'moderator menjaga ruang tetap sehat tanpa kelelahan berlebih.',
      'creator membangun koneksi yang bertahan lebih lama dari satu unggahan.',
      'setiap interaksi terasa aman dan memiliki konteks.',
      'komunitas tumbuh dengan ritme yang sehat.',
    ],
    openQuestions: [
      'Apakah konten komunitas dapat diindeks mesin pencari?',
      'Bagaimana kebijakan anonimitas untuk topik sensitif?',
      'Apakah event berbayar masuk ruang lingkup MVP?',
    ],
    fishboneProblem: 'Mengapa interaksi anggota dan retensi komunitas masih rendah?',
    extraScopeOut: ['Iklan self-serve untuk brand', 'Live streaming skala besar'],
  },
  generic: {
    key: 'generic',
    label: 'Produk digital',
    productType: 'produk digital yang menyatukan alur kerja inti pengguna',
    tagline: 'Satu alur yang jernih untuk pekerjaan yang berarti.',
    audience: 'tim produk dan pengguna yang membutuhkan alur kerja yang lebih sederhana',
    problem:
      'Pengguna harus berpindah-pindah alat untuk menyelesaikan satu pekerjaan. Konteks hilang, langkah berulang menumpuk, dan nilai produk sulit terasa dalam sesi pertama.',
    solution:
      'Satu alur yang memusatkan pekerjaan inti, konteks, dan tindak lanjut. Produk menghilangkan langkah yang tidak perlu dan membantu pengguna mencapai hasil pertama dengan cepat.',
    goals: [
      'Mempercepat time-to-value untuk pengguna baru.',
      'Mengurangi pekerjaan manual berulang di alur utama.',
      'Menciptakan fondasi yang aman dan dapat diskalakan untuk fitur berikutnya.',
    ],
    metrics: [
      { name: 'Activation rate', target: '≥ 55%', description: 'Pengguna yang menyelesaikan aksi inti pertama dalam 24 jam.' },
      { name: 'Task completion', target: '≥ 78%', description: 'Alur inti yang berhasil diselesaikan tanpa bantuan.' },
      { name: '30-day retention', target: '42%', description: 'Pengguna yang kembali pada hari ke-30.' },
    ],
    personas: personas([
      ['Alya Pradipta', 'Product Manager', 'Saya perlu tim bergerak cepat tanpa kehilangan konteks.', 'Pekerjaan tersebar dan keputusan sulit dilacak.', 'Memiliki satu sumber kebenaran untuk alur kerja inti.'],
      ['Dimas Arviansyah', 'Operations Lead', 'Saya ingin proses yang sederhana tetapi cukup kuat untuk skala.', 'Alat yang ada terlalu rumit atau terlalu terbatas.', 'Mengurangi pekerjaan manual tanpa menambah risiko.'],
      ['Nina Larasati', 'Pengguna akhir', 'Saya ingin menyelesaikan pekerjaan tanpa belajar tool baru seminggu.', 'Langkah berulang dan antarmuka yang membingungkan.', 'Merasakan hasil pertama dengan cepat dan tanpa frustrasi.'],
    ]),
    features: [
      spec('Onboarding & akun', 'Alur masuk, profil, dan setup awal yang mengarahkan pengguna ke nilai pertama.', 'P0', 'Sedang', 1, [], ['Pengguna mencapai aksi inti pertama dalam < 5 menit.', 'Progres onboarding dapat dilanjutkan setelah meninggalkan aplikasi.', 'Pengguna dapat memilih untuk tidak mengisi data opsional.']),
      spec('Ruang kerja inti', 'Permukaan utama tempat pengguna membuat, mengatur, dan menyelesaikan pekerjaan.', 'P0', 'Tinggi', 2, [0], ['Aksi inti dapat diselesaikan dalam maksimal tiga langkah.', 'Status dan error selalu memiliki langkah lanjutan.', 'Data tersimpan otomatis tanpa kehilangan input.']),
      spec('Kolaborasi real-time', 'Undang rekan, bagikan konteks, dan bekerja pada objek yang sama tanpa konflik.', 'P0', 'Sedang', 2, [0, 1], ['Perubahan pengguna lain muncul dalam < 3 detik.', 'Konflik resolusi menjaga data terbaru dan riwayat.', 'Izin akses konsisten di UI dan API.']),
      spec('Pencarian & knowledge', 'Cari objek, orang, dan konteks dengan hasil yang relevan serta akses yang aman.', 'P1', 'Sedang', 2, [1], ['Hasil pencarian mengikuti izin pengguna.', 'Query kosong menampilkan aktivitas terbaru.', 'Hasil dapat difilter berdasarkan tipe objek.']),
      spec('Notifikasi kontekstual', 'Notifikasi yang menghubungkan aktivitas penting tanpa menciptakan noise.', 'P1', 'Rendah', 3, [1, 2], ['Pengguna dapat mengatur frekuensi notifikasi.', 'Notifikasi duplikat digabungkan dalam 10 menit.', 'Klik notifikasi membuka konteks yang tepat.']),
      spec('Dashboard analitik', 'Ringkasan penggunaan, kualitas alur, dan metrik keberhasilan pengguna.', 'P1', 'Sedang', 3, [1], ['Metrik memiliki definisi yang dapat dibuka.', 'Dashboard memuat dalam < 2 detik pada data 90 hari.', 'Data dapat diekspor ke CSV.']),
      spec('Admin, peran & audit', 'Kontrol organisasi, peran pengguna, dan jejak perubahan untuk operasi yang aman.', 'P0', 'Sedang', 1, [], ['Peran dapat diubah tanpa mengubah kepemilikan data.', 'Aksi admin tercatat di audit log.', 'Akses dicabut dalam < 60 detik.']),
      spec('Integrasi & API', 'Koneksi ke alat pendukung dengan API yang terdokumentasi dan webhook.', 'P2', 'Tinggi', 3, [1], ['API memiliki versioning dan dokumentasi contoh.', 'Webhook dapat diverifikasi dan dicoba ulang.', 'Integrasi gagal tidak memblokir alur inti.']),
    ],
    stack: ['React 19', 'TypeScript', 'Node.js', 'PostgreSQL', 'Redis'],
    integrations: ['Slack', 'Google Workspace', 'Stripe', 'Zapier'],
    entities: [
      { name: 'User', fields: 'id, name, email, status, created_at' },
      { name: 'Workspace', fields: 'id, name, owner_id, plan, settings_json' },
      { name: 'Object', fields: 'id, workspace_id, type, title, state, owner_id' },
      { name: 'Membership', fields: 'id, workspace_id, user_id, role, invited_at' },
      { name: 'AuditEvent', fields: 'id, actor_id, action, target, created_at' },
    ],
    endpoints: [
      { method: 'POST', path: '/v1/onboarding', purpose: 'Menyimpan progres onboarding.' },
      { method: 'POST', path: '/v1/workspaces', purpose: 'Membuat workspace baru.' },
      { method: 'GET', path: '/v1/search', purpose: 'Mencari objek dan orang dengan izin aktif.' },
      { method: 'PATCH', path: '/v1/objects/:id', purpose: 'Memperbarui objek dan mencatat aktivitas.' },
      { method: 'GET', path: '/v1/analytics/overview', purpose: 'Mengambil ringkasan metrik produk.' },
    ],
    storyOutcomes: [
      'pengguna mencapai hasil pertama tanpa kebingungan.',
      'kerja tim tetap selaras tanpa bertambahnya rapat.',
      'informasi penting dapat ditemukan saat dibutuhkan.',
      'pengambil keputusan melihat kesehatan alur secara jelas.',
      'produk dapat tumbuh tanpa mengorbankan kepercayaan.',
    ],
    openQuestions: [
      'Siapa pengguna utama yang harus dilayani pada rilis pertama?',
      'Aksi inti mana yang menjadi definisi aktivasi?',
      'Bagaimana produk menangani data sensitif dan retensinya?',
    ],
    fishboneProblem: 'Mengapa pengguna belum mencapai nilai inti dan bertahan?',
    extraScopeOut: ['Aplikasi native terpisah', 'Kustomisasi enterprise tingkat lanjut'],
  },
}

const domainRules: Array<{ key: DomainKey; words: string[]; weight?: number }> = [
  { key: 'finance', words: ['keuangan', 'finansial', 'financial', 'budget', 'anggaran', 'pengeluaran', 'investasi', 'tabungan', 'expense', 'money', 'dompet', 'cashflow', 'pajak'] },
  { key: 'commerce', words: ['e-commerce', 'ecommerce', 'toko', 'jualan', 'marketplace', 'penjualan', 'checkout', 'produk fisik', 'brand', 'retail', 'merchant', 'stok', 'order'] },
  { key: 'productivity', words: ['task', 'tugas', 'project', 'proyek', 'tim', 'team', 'kolaborasi', 'kanban', 'workflow', 'produktivitas', 'manajemen kerja', 'todo', 'okr'] },
  { key: 'crm', words: ['crm', 'sales', 'penjualan b2b', 'pipeline', 'prospek', 'lead', 'customer', 'pelanggan', 'deal', 'account executive'] },
  { key: 'education', words: ['belajar', 'kursus', 'edukasi', 'pendidikan', 'sekolah', 'kampus', 'guru', 'siswa', 'mahasiswa', 'learning', 'course', 'lms'] },
  { key: 'health', words: ['kesehatan', 'health', 'fitness', 'olahraga', 'wellness', 'nutrisi', 'tidur', 'habit', 'kebiasaan', 'dokter', 'coach'] },
  { key: 'travel', words: ['travel', 'perjalanan', 'wisata', 'liburan', 'itinerary', 'tiket', 'hotel', 'trip'] },
  { key: 'social', words: ['sosial', 'komunitas', 'community', 'social', 'feed', 'forum', 'event', 'creator', 'followers'] },
  { key: 'ai', words: ['ai', 'llm', 'chatbot', 'copilot', 'asisten', 'generatif', 'prompt', 'machine learning', 'model'], weight: 0.8 },
]

function detectDomain(prompt: string): DomainConfig {
  const text = ` ${prompt.toLowerCase()} `
  let best: DomainKey = 'generic'
  let bestScore = 0
  for (const rule of domainRules) {
    const score = rule.words.reduce((sum, word) => sum + (text.includes(word) ? 1 : 0), 0) * (rule.weight ?? 1)
    if (score > bestScore) {
      bestScore = score
      best = rule.key
    }
  }
  return domainConfigs[best]
}

const domainTitles: Record<DomainKey, string> = {
  productivity: 'Ruang Kerja Tim',
  finance: 'Asisten Keuangan Pribadi',
  commerce: 'Operasional Toko',
  ai: 'Ruang Kerja Riset AI',
  education: 'Ruang Belajar Terarah',
  health: 'Pendamping Hidup Sehat',
  crm: 'Ruang Kerja Pelanggan',
  travel: 'Perencana Perjalanan',
  social: 'Ruang Komunitas',
  generic: 'Produk Digital',
}

const cleanPrompt = (prompt: string) =>
  prompt
    .replace(/^(tolong|please|saya ingin|aku ingin|i want to|i'd like to)\s+/i, '')
    .replace(/^(buatlah|buatkan|buat|desain|rancang|create|build)\s+/i, '')
    .trim()

function makeTitle(prompt: string, domain: DomainConfig): string {
  const named = prompt.match(/(?:bernama|disebut|named|called)\s+["“]?([\p{L}\d][\p{L}\d\s'-]{1,28})/iu)
  if (named) return named[1].trim().replace(/["”]$/, '')
  if (domain.key !== 'generic') return domainTitles[domain.key]
  const cleaned = cleanPrompt(prompt)
    .replace(/^(aplikasi|platform|layanan|sistem|website|tools?|produk)\s+/i, '')
    .replace(/\s+/g, ' ')
    .split(/[.!?\n,]/)[0]
    .trim()
  if (!cleaned) return domainTitles.generic
  let title = cleaned.replace(/^(sebuah|a|an)\s+/i, '')
  title = title.charAt(0).toUpperCase() + title.slice(1)
  if (title.length > 58) title = title.slice(0, 58).replace(/\s+\S*$/, '') + '…'
  return title
}

function detectAudience(prompt: string, fallback: string): string {
  const match = prompt.match(/(?:untuk|bagi|for)\s+([^,.;\n]+)/i)
  if (!match) return fallback
  let phrase = match[1]
    .split(/\s+(?:dengan|yang|agar|supaya|serta|melalui|menggunakan|berbasis)\s+/i)[0]
    .trim()
  phrase = phrase.replace(/^(membantu|memudahkan|mengelola|para)\s+/i, '')
  const audienceStart = /^(tim|pengguna|pemilik|freelancer|profesional|guru|siswa|mahasiswa|pelajar|dokter|pasien|agen|creator|komunitas|bisnis|umkm|perusahaan|karyawan|manajer|desainer|developer|orang tua|merchant|penjual|marketer|sales|coach|traveler|pasangan|klien|organisasi|founder)\b/i
  if (!audienceStart.test(phrase) || phrase.length > 58) return fallback
  return phrase.charAt(0).toLowerCase() + phrase.slice(1)
}

function detectPlatform(prompt: string): string {
  const text = prompt.toLowerCase()
  if (/(ios|android|mobile|ponsel|smartphone)/.test(text)) return 'Mobile-first · iOS & Android · web pendamping'
  if (/(desktop|macos|windows)/.test(text)) return 'Desktop app · Web'
  return 'Web app responsif'
}

function detectTimeline(prompt: string): string {
  const match = prompt.match(/(\d+)\s*(minggu|week|bulan|month)/i)
  if (match) {
    const unit = /minggu|week/i.test(match[2]) ? 'minggu' : 'bulan'
    return `${match[1]} ${unit} · MVP di fase pertama`
  }
  return '8 minggu · MVP dalam 4 minggu'
}

function featureFromSpec(item: FeatureSpec, index: number, phaseNames: string[], allFeatures: FeatureSpec[]): Feature {
  return {
    id: `F-${String(index + 1).padStart(2, '0')}`,
    name: item.name,
    description: item.description,
    priority: item.priority,
    complexity: item.complexity,
    phase: phaseNames[item.phase - 1],
    dependencies: item.dependsOn.map((dep) => `F-${String(dep + 1).padStart(2, '0')}`).filter((id) => id !== `F-${String(index + 1).padStart(2, '0')}`),
    acceptance: item.acceptance,
  }
}

function extraFeatures(prompt: string, specs: FeatureSpec[]): FeatureSpec[] {
  const text = prompt.toLowerCase()
  const additions: FeatureSpec[] = []
  const has = (term: string) => specs.some((item) => item.name.toLowerCase().includes(term))
  if (/(ai|asisten|assistant|llm|copilot)/.test(text) && !has('ai') && !has('cerdas') && !has('asisten')) {
    additions.push(spec('Asisten cerdas', 'Copilot kontekstual yang membantu pengguna menyelesaikan pekerjaan lebih cepat dengan saran yang dapat ditinjau.', 'P2', 'Tinggi', 3, [0], ['Setiap saran menampilkan sumber konteks.', 'Pengguna harus menyetujui sebelum saran diterapkan.', 'Data pelanggan tidak digunakan untuk pelatihan model.']))
  }
  if (/(offline|luring|tanpa koneksi)/.test(text) && !has('offline')) {
    additions.push(spec('Mode offline', 'Akses inti tetap berfungsi saat koneksi terputus dengan sinkronisasi yang aman saat kembali online.', 'P1', 'Tinggi', 3, [0], ['Aktivitas inti dapat dibuka tanpa koneksi.', 'Konflik sinkronisasi diselesaikan tanpa kehilangan data.', 'Status data offline terlihat jelas oleh pengguna.']))
  }
  if (/(langganan|subscription|pembayaran|payment|billing)/.test(text) && !has('pembayaran') && !has('langganan') && !has('billing')) {
    additions.push(spec('Langganan & pembayaran', 'Paket harga, pembayaran berulang, dan pengelolaan status langganan yang transparan.', 'P1', 'Tinggi', 3, [0], ['Status langganan selalu dapat dilihat pengguna.', 'Pembayaran gagal memiliki alur pemulihan.', 'Akses fitur mengikuti entitlement yang aktif.']))
  }
  return additions.slice(0, 2)
}

function buildRisks(domain: DomainConfig, features: Feature[]): Risk[] {
  const first = features[0]?.name.toLowerCase() ?? 'alur utama'
  const integration = domain.integrations[0] ?? 'vendor eksternal'
  return [
    { id: 'R-01', category: 'Orang', cause: `Kurva belajar ${first} menghambat adopsi pengguna non-teknis.`, impact: 'Aktivasi minggu pertama turun dan tim kembali ke alat lama.', mitigation: 'Onboarding terpandu, template siap pakai, dan ukur drop-off per langkah.' },
    { id: 'R-02', category: 'Proses', cause: 'Keputusan produk dan prioritas tersebar tanpa ritual review yang konsisten.', impact: 'Ruang lingkup melebar dan kualitas rilis tidak merata.', mitigation: 'Tetapkan RFC ringan, decision log, dan review mingguan dengan batas waktu.' },
    { id: 'R-03', category: 'Platform', cause: `Ketergantungan pada ${integration} berpotensi menambah latensi dan titik gagal.`, impact: 'Alur inti terhambat saat vendor bermasalah.', mitigation: 'Terapkan fallback, retry idempoten, serta observability pada batas integrasi.' },
    { id: 'R-04', category: 'Data', cause: 'Definisi data dan metrik belum seragam sejak fase awal.', impact: 'Laporan tidak dapat dipercaya untuk pengambilan keputusan.', mitigation: 'Buat data dictionary, validasi schema, dan review definisi metrik.' },
    { id: 'R-05', category: 'Produk', cause: 'Ruang lingkup MVP berpotensi melebar karena banyak permintaan fitur.', impact: 'Tim kehilangan fokus dan waktu peluncuran mundur.', mitigation: 'Kunci trade-off di PRD, gunakan kriteria P0, dan jadwalkan re-evaluasi setelah beta.' },
    { id: 'R-06', category: 'Eksternal', cause: 'Perubahan kebijakan vendor atau regulasi dapat memengaruhi data dan integrasi.', impact: 'Perlu perubahan arsitektur mendadak atau penundaan peluncuran.', mitigation: 'Pantau perubahan kebijakan, buat lapisan abstraksi, dan siapkan rencana kontingensi.' },
  ]
}

function buildNonFunctional(platform: string): PRD['nonFunctional'] {
  const mobile = platform.toLowerCase().includes('mobile')
  return [
    { id: 'NFR-01', category: 'Performa', target: 'P95 < 300 ms', detail: 'Interaksi utama merespons cepat; first contentful paint < 1,5 detik pada koneksi 4G.' },
    { id: 'NFR-02', category: 'Keamanan', target: 'OWASP ASVS L2', detail: 'Validasi input, otorisasi per objek, rate limiting, serta enkripsi data saat transit dan diam.' },
    { id: 'NFR-03', category: 'Ketersediaan', target: '99,9% / bulan', detail: 'Health check, graceful degradation, dan runbook pemulihan untuk alur kritis.' },
    { id: 'NFR-04', category: 'Aksesibilitas', target: 'WCAG 2.2 AA', detail: 'Navigasi keyboard, fokus terlihat, kontras memadai, dan label untuk setiap kontrol.' },
    { id: 'NFR-05', category: 'Skalabilitas', target: '10.000 pengguna aktif', detail: 'Desain stateless, caching terukur, serta query dan indeks yang dipantau.' },
    { id: 'NFR-06', category: 'Privasi', target: 'UU PDP · GDPR-ready', detail: mobile ? 'Consent granular untuk data sensitif, ekspor data, dan penghapusan akun yang jelas.' : 'Data minimization, audit akses, ekspor data, dan kebijakan retensi yang eksplisit.' },
  ]
}

function buildMilestones(features: Feature[]): PRD['milestones'] {
  const byPhase = (phase: string) => features.filter((f) => f.phase.includes(phase)).map((f) => f.name).slice(0, 3)
  const initial = byPhase('Fondasi')
  const core = byPhase('Alur inti')
  const scale = byPhase('Skala')
  return [
    { phase: 'Discovery', duration: 'Minggu 1', focus: 'Validasi masalah dan keputusan produk', deliverables: ['Wawancara 8 calon pengguna', 'Review PRD & ruang lingkup', 'Success metric disepakati'] },
    { phase: 'Fondasi', duration: 'Minggu 2–3', focus: 'Fondasi teknis dan kepercayaan', deliverables: initial.length ? initial : ['Arsitektur inti', 'Observability dasar', 'Alur autentikasi'] },
    { phase: 'MVP', duration: 'Minggu 4–6', focus: 'Alur inti end-to-end', deliverables: core.length ? core : ['Use case utama berjalan', 'Instrumentasi event', 'Beta internal'] },
    { phase: 'Beta & launch', duration: 'Minggu 7–8', focus: 'Validasi, hardening, dan peluncuran', deliverables: scale.length ? scale : ['Uji dengan 30 beta user', 'Review keamanan', 'Peluncuran terukur'] },
  ]
}

const sectionTitles: Record<string, string> = {
  summary: 'Ringkasan Eksekutif',
  goals: 'Tujuan & Metrik',
  personas: 'Persona & Pengguna',
  features: 'Lingkup Fitur',
  stories: 'User Stories',
  functional: 'Kebutuhan Fungsional',
  nonFunctional: 'Kebutuhan Non-Fungsional',
  tech: 'Arsitektur & Parameter Teknis',
  risks: 'Risiko & Asumsi',
  milestones: 'Rencana Rilis',
  openQuestions: 'Pertanyaan Terbuka',
}

export function generateLocalPRD(prompt: string): PRD {
  const domain = detectDomain(prompt)
  const title = makeTitle(prompt, domain)
  const audience = detectAudience(prompt, domain.audience)
  const platform = detectPlatform(prompt)
  const timeline = detectTimeline(prompt)
  const rawSpecs = [...domain.features, ...extraFeatures(prompt, domain.features)]
  const phaseNames = ['Fase 1 · Fondasi', 'Fase 2 · Alur inti', 'Fase 3 · Skala']
  const features = rawSpecs.map((item, i) => featureFromSpec(item, i, phaseNames, rawSpecs))
  const personasList = domain.personas.map((p) => ({ ...p }))
  const risks = buildRisks(domain, features)
  const userStories = features.slice(0, 5).map((feature, i) => {
    const persona = personasList[i % personasList.length]
    return {
      id: `US-${String(i + 1).padStart(2, '0')}`,
      persona: persona.name,
      role: persona.role,
      action: `menggunakan ${feature.name.toLowerCase()} dengan konteks yang utuh`,
      outcome: domain.storyOutcomes[i % domain.storyOutcomes.length],
      priority: feature.priority,
    }
  })
  const functional = features.map((feature, i) => ({
    id: `FR-${String(i + 1).padStart(2, '0')}`,
    title: feature.name,
    detail: `${feature.description} Validasi utama: ${feature.acceptance[0]}`,
    priority: feature.priority,
  }))
  const goalsText = domain.goals
  const executiveSummary = `${title} membantu ${audience} menyatukan ${features[0]?.name.toLowerCase()}, ${features[1]?.name.toLowerCase()}, dan ${features[2]?.name.toLowerCase()} dalam satu alur yang mengurangi perpindahan konteks. Sebagai ${domain.productType}, fokus rilis pertama adalah membuktikan nilai inti, menjaga kepercayaan pengguna, dan membangun fondasi yang dapat diskalakan.`
  const solution = `${domain.solution} Pendekatan rilis: mulai dari alur ${features[0]?.name.toLowerCase()} yang sempit namun utuh, ukur aktivasi dan retensi, lalu perluas ke otomasi dan integrasi berdasarkan sinyal penggunaan.`
  const now = new Date().toISOString()
  return {
    id: `prd-${Date.now().toString(36)}`,
    createdAt: now,
    updatedAt: now,
    prompt: prompt.trim(),
    title,
    tagline: domain.tagline,
    status: 'Draft',
    productType: domain.productType,
    audience,
    platform,
    timeline,
    team: '4–6 orang · Product, Design, Engineering, QA',
    executiveSummary,
    problem: domain.problem,
    solution,
    goals: goalsText,
    metrics: domain.metrics.map((m) => ({ ...m })),
    personas: personasList,
    features,
    userStories,
    functional,
    nonFunctional: buildNonFunctional(platform),
    tech: {
      architecture: `Arsitektur modular dengan domain boundary yang jelas, API-first, dan alur asynchronous untuk tugas berat. ${domain.productType.charAt(0).toUpperCase() + domain.productType.slice(1)} harus dapat diuji secara lokal, diamati di produksi, dan dideploy tanpa downtime.`,
      stack: [...domain.stack],
      integrations: [...domain.integrations],
      entities: domain.entities.map((e) => ({ ...e })),
      endpoints: domain.endpoints.map((e) => ({ ...e })),
    },
    risks,
    milestones: buildMilestones(features),
    openQuestions: [...domain.openQuestions, 'Metrik apa yang akan menghentikan ekspansi fitur setelah beta?'],
    customSections: [],
    sectionTitles: { ...sectionTitles },
    fishboneProblem: domain.fishboneProblem,
  }
}

async function generateWithModel(prompt: string, settings: ModelSettings): Promise<PRD> {
  const base = generateLocalPRD(prompt)
  const system = `Kamu adalah product strategist senior. Ubah brief menjadi PRD berbahasa Indonesia yang ringkas, spesifik, dan siap dieksekusi agen AI. Kembalikan HANYA JSON valid tanpa markdown. Skema: {title, tagline, executiveSummary, problem, solution, audience, platform, timeline, goals: string[], metrics: [{name,target,description}], personas: [{name,role,quote,pain,goal}], features: [{name,description,priority,complexity,phase,dependencies: string[],acceptance: string[]}], userStories: [{persona,role,action,outcome,priority}], functional: [{title,detail,priority}], nonFunctional: [{category,target,detail}], tech: {architecture,stack: string[],integrations: string[],entities: [{name,fields}],endpoints: [{method,path,purpose}]}, risks: [{category,cause,impact,mitigation}], milestones: [{phase,duration,focus,deliverables: string[]}], openQuestions: string[], fishboneProblem}. priority hanya P0/P1/P2. complexity hanya Rendah/Sedang/Tinggi.`
  const response = await fetch(`${settings.baseUrl.replace(/\/$/, '')}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${settings.apiKey}`,
    },
    body: JSON.stringify({
      model: settings.model,
      temperature: 0.4,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: `Brief produk:\n${prompt}\n\nGunakan referensi kualitas berikut sebagai arah, tetapi tulis ulang agar spesifik pada brief:\n${JSON.stringify(base).slice(0, 7000)}` },
      ],
    }),
  })
  if (!response.ok) throw new Error(`Model API menolak permintaan (${response.status}).`)
  const payload = await response.json()
  const content = payload.choices?.[0]?.message?.content
  if (!content) throw new Error('Model tidak mengembalikan konten.')
  const parsed = JSON.parse(content)
  return mergeGeneratedPRD(base, parsed)
}

function arrayOr<T>(value: unknown, fallback: T[]): T[] {
  return Array.isArray(value) && value.length ? (value as T[]) : fallback
}

function stringOr(value: unknown, fallback: string): string {
  return typeof value === 'string' && value.trim() ? value : fallback
}

function mergeGeneratedPRD(base: PRD, source: Record<string, unknown>): PRD {
  const featuresSource = Array.isArray(source.features) ? source.features : []
  const features: Feature[] = featuresSource.map((raw, i) => {
    const item = raw as Record<string, unknown>
    const fallback = base.features[i % base.features.length]
    return {
      id: `F-${String(i + 1).padStart(2, '0')}`,
      name: stringOr(item.name, fallback.name),
      description: stringOr(item.description, fallback.description),
      priority: (['P0', 'P1', 'P2'].includes(String(item.priority)) ? item.priority : fallback.priority) as Priority,
      complexity: (['Rendah', 'Sedang', 'Tinggi'].includes(String(item.complexity)) ? item.complexity : fallback.complexity) as Complexity,
      phase: stringOr(item.phase, fallback.phase),
      dependencies: Array.isArray(item.dependencies) ? (item.dependencies as string[]) : fallback.dependencies,
      acceptance: arrayOr(item.acceptance, fallback.acceptance).map(String),
    }
  })
  const techSource = (source.tech && typeof source.tech === 'object' ? source.tech : {}) as Record<string, unknown>
  return {
    ...base,
    title: stringOr(source.title, base.title),
    tagline: stringOr(source.tagline, base.tagline),
    executiveSummary: stringOr(source.executiveSummary, base.executiveSummary),
    problem: stringOr(source.problem, base.problem),
    solution: stringOr(source.solution, base.solution),
    audience: stringOr(source.audience, base.audience),
    platform: stringOr(source.platform, base.platform),
    timeline: stringOr(source.timeline, base.timeline),
    goals: arrayOr(source.goals, base.goals).map(String),
    metrics: arrayOr(source.metrics, base.metrics),
    personas: arrayOr(source.personas, base.personas),
    features: features.length ? features : base.features,
    userStories: arrayOr(source.userStories, base.userStories).map((s, i) => ({
      ...(s as PRD['userStories'][number]),
      id: `US-${String(i + 1).padStart(2, '0')}`,
      priority: (['P0', 'P1', 'P2'].includes(String((s as unknown as Record<string, unknown>).priority)) ? (s as unknown as Record<string, unknown>).priority : 'P1') as Priority,
    })),
    functional: arrayOr(source.functional, base.functional).map((f, i) => ({
      ...(f as PRD['functional'][number]),
      id: `FR-${String(i + 1).padStart(2, '0')}`,
      priority: (['P0', 'P1', 'P2'].includes(String((f as unknown as Record<string, unknown>).priority)) ? (f as unknown as Record<string, unknown>).priority : 'P1') as Priority,
    })),
    nonFunctional: arrayOr(source.nonFunctional, base.nonFunctional).map((n, i) => ({ ...(n as PRD['nonFunctional'][number]), id: `NFR-${String(i + 1).padStart(2, '0')}` })),
    tech: {
      architecture: stringOr(techSource.architecture, base.tech.architecture),
      stack: arrayOr(techSource.stack, base.tech.stack).map(String),
      integrations: arrayOr(techSource.integrations, base.tech.integrations).map(String),
      entities: arrayOr(techSource.entities, base.tech.entities),
      endpoints: arrayOr(techSource.endpoints, base.tech.endpoints),
    },
    risks: arrayOr(source.risks, base.risks).map((r, i) => ({
      ...(r as PRD['risks'][number]),
      id: `R-${String(i + 1).padStart(2, '0')}`,
    })),
    milestones: arrayOr(source.milestones, base.milestones),
    openQuestions: arrayOr(source.openQuestions, base.openQuestions).map(String),
    fishboneProblem: stringOr(source.fishboneProblem, base.fishboneProblem),
    updatedAt: new Date().toISOString(),
  }
}

export async function generatePRD(
  prompt: string,
  settings: ModelSettings,
  onProgress: (step: number) => void,
): Promise<PRD> {
  const start = Date.now()
  const progress = async (step: number, delay = 480) => {
    onProgress(step)
    await new Promise((resolve) => setTimeout(resolve, delay))
  }
  await progress(0)
  const local = generateLocalPRD(prompt)
  await progress(1)
  let result = local
  let usedFallback = settings.provider === 'local'
  if (settings.provider === 'openai' && settings.apiKey.trim()) {
    try {
      result = await generateWithModel(prompt, settings)
      usedFallback = false
    } catch (error) {
      console.warn(error)
      usedFallback = true
    }
  }
  await progress(2)
  await progress(3)
  const elapsed = Date.now() - start
  if (elapsed < 2300) await new Promise((resolve) => setTimeout(resolve, 2300 - elapsed))
  await progress(4, 220)
  return { ...result, id: local.id, createdAt: local.createdAt, prompt, updatedAt: new Date().toISOString(), title: usedFallback ? result.title : result.title }
}

export const SUPPLEMENTARY_CAUSES: Record<string, string> = {
  Orang: 'Kepemilikan proses antar peran belum dinyatakan secara eksplisit.',
  Proses: 'Belum ada ritual review yang konsisten sebelum keputusan diambil.',
  Platform: 'Observability end-to-end dan fallback layanan belum memadai.',
  Data: 'Definisi metrik dan sumber kebenaran data belum seragam.',
  Produk: 'Prioritas roadmap bergeser tanpa kriteria trade-off yang jelas.',
  Eksternal: 'Ketergantungan pada vendor pihak ketiga menambah risiko perubahan.',
}

export function getDomainLabel(prompt: string): string {
  return detectDomain(prompt).label
}
