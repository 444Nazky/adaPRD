# adaPRD

adaPRD adalah sebuah platform web interaktif yang dirancang untuk mengonversi prompt teks mentah dari pengguna menjadi dokumen Product Requirements Document (PRD) yang komprehensif, terstruktur, dan siap dieksekusi oleh agen AI.

## Fitur Utama

- **Prompt-to-PRD Engine**: Mengubah deskripsi teks bebas menjadi dokumen PRD lengkap yang mencakup ringkasan eksekutif, ruang lingkup fitur, user stories, spesifikasi fungsional, dan parameter teknis.
- **Inline Editing**: Mendukung penyuntingan langsung secara real-time pada setiap bagian dokumen yang dihasilkan sebelum tahap finalisasi.
- **Modul Visualisasi Diagram**: Menerjemahkan struktur PRD ke dalam bentuk diagram interaktif, termasuk flowchart alur sistem, diagram fishbone untuk analisis kendala, serta dependency graph.
- **Ekspor dan Salin Cepat**: Memungkinkan pengguna mengunduh artefak dalam format Markdown, PDF, JSON, serta menyediakan tombol salin cepat ke clipboard untuk agen AI eksternal.

## Teknologi yang Digunakan

- **Frontend**: React, Next.js, TypeScript, Tailwind CSS
- **Visualisasi**: Pustaka diagram berbasis web yang responsif
- **Manajemen State**: State management modern untuk penyuntingan dokumen secara real-time

## Memulai Cepat

Ikuti langkah-langkah di bawah ini untuk menjalankan proyek secara lokal:

1. Salin repositori ini:
   ```bash
   git clone https://github.com/444Nazky/adaPRD.git
   ```
2. Masuk ke direktori proyek:
   ```bash
   cd adaPRD
   ```
3. Pasang dependensi yang diperlukan:
   ```bash
   npm install
   ```
4. Jalankan server pengembangan lokal:
   ```bash
   npm run dev
   ```

## Lisensi

Proyek ini dilindungi di bawah lisensi MIT.
