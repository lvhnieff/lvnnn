# NEXURA PRESET FINDER

Website minimalis untuk mencari tautan preset Alight Motion dari komentar video TikTok.

## Penting: koneksi data komentar

Website ini tidak melakukan scraping langsung terhadap TikTok. Untuk mengambil komentar, hubungkan penyedia API komentar yang sah dan sesuai ketentuan platform.

API provider harus:
- menerima `GET` dengan query `url=<TikTok video URL>`
- menerima header `x-api-key: <API key>`
- mengembalikan JSON dengan format:

```json
{
  "comments": [
    { "text": "Preset ini https://alight.link/xxxx", "author": "nama" },
    { "text": "Komentar lain tanpa link" }
  ]
}
```

## Deploy ke Vercel

1. Upload folder project ini ke repository GitHub.
2. Buka https://vercel.com dan pilih **Add New → Project**.
3. Import repository tersebut.
4. Framework Preset pilih **Other**. Build Command dan Output Directory dapat dikosongkan.
5. Tambahkan Environment Variables:
   - `TIKTOK_COMMENTS_API_URL` = URL endpoint API provider komentar.
   - `TIKTOK_COMMENTS_API_KEY` = API key provider.
6. Klik **Deploy**.

Jika variabel API belum diisi, halaman tetap tampil tetapi pencarian akan memberi pesan bahwa API belum dikonfigurasi.

## Jalankan lokal

Gunakan Node.js 18 atau lebih baru:

```bash
npm start
```

Buka http://localhost:3000.

## Catatan

- Hanya URL dari domain `alight.link` dan `alightmotion.com` yang ditampilkan sebagai hasil.
- Hasil bergantung pada komentar yang dikembalikan penyedia API.
- Jangan gunakan layanan untuk mengambil data privat, melewati login, atau melanggar ketentuan TikTok.
