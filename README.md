# Portfolio — Ikhsan Nur Pratama

Website portfolio statis (HTML + CSS + JS). Tidak perlu build, tidak perlu server khusus. Bisa dibuka langsung dengan dobel-klik maupun di-host di GitHub Pages.

---

## Struktur File

```
Portfolio-New-design1/
├── index.html            # halaman utama (karya ditulis langsung di sini)
├── README.md             # file ini
└── assets/
    ├── css/style.css     # semua styling
    ├── js/main.js        # animasi, filter, lightbox, musik latar
    ├── audio/background.mp3
    ├── img/              # gambar yang dipakai website
    └── video/            # video + thumbnail
```

---

## Cara Menambah Karya Baru

**Langkah 1 — Siapkan file**

- **Gambar:** taruh di `assets/img/`, lebar maksimal 1600px.
- **Video:** taruh di `assets/video/`, idealnya di bawah 10 MB. Kompres dulu kalau lebih:

```bash
ffmpeg -i video-asli.mp4 -vf "scale=-2:720" -c:v libx264 -preset slow -crf 25 ^
  -c:a aac -b:a 96k -movflags +faststart assets/video/nama-baru.mp4
```

- **Thumbnail video** (ambil satu frame):

```bash
ffmpeg -ss 3 -i video.mp4 -frames:v 1 -q:v 3 assets/video/nama-baru.jpg
```

**Langkah 2 — Copy satu blok kartu di `index.html`**

Cari `<div class="grid" id="grid">`, lalu copy salah satu blok `<button class="card ...">` dan ubah nilainya.

Contoh **gambar**:

```html
<button class="card reveal" data-cat="design" data-type="image"
  data-src="assets/img/poster-konser.jpg"
  data-title="Poster Konser Akustik"
  data-desc="Poster untuk acara akustik kampus. Tipografi besar dipilih supaya nama band terbaca dari jarak jauh."
  data-meta="Design · Poster">
  <span class="card-media clip-reveal">
    <img src="assets/img/poster-konser.jpg" alt="Poster konser akustik dengan ilustrasi gitar" width="1400" height="1750" loading="lazy">
  </span>
  <span class="card-info">
    <span class="card-title">Poster Konser Akustik</span>
    <span class="card-meta">Design · Poster</span>
  </span>
</button>
```

Contoh **video** (ada `<span class="play">` dan thumbnail terpisah):

```html
<button class="card reveal" data-cat="video" data-type="video"
  data-src="assets/video/aftermovie.mp4"
  data-title="After Movie Meetup"
  data-desc="Rekap acara meetup dalam 60 detik, dipotong cepat mengikuti tempo musik."
  data-meta="Video · Event">
  <span class="card-media clip-reveal">
    <img src="assets/video/aftermovie.jpg" alt="Thumbnail after movie meetup" width="1280" height="720" loading="lazy">
    <span class="play" aria-hidden="true"></span>
  </span>
  <span class="card-info">
    <span class="card-title">After Movie Meetup</span>
    <span class="card-meta">Video · Event</span>
  </span>
</button>
```

**Langkah 3 — Atur ukuran kartu (opsional)**

Tambahkan class di `<button>`:

| Class | Efek |
|---|---|
| `card-wide` | kartu selebar 2 kolom |
| `card-tall` | kartu lebih tinggi |
| (kosong) | ukuran normal |

**Langkah 4 — Daftarkan filternya**

Nilai `data-cat` menentukan filter mana yang menampilkan kartu:

- `design` → tab **Design**
- `video` → tab **Video**
- `photo` → tab **Foto**

Simpan, refresh browser. Selesai.

---

## Musik Latar

File: `assets/audio/background.mp3` (loop otomatis).

Tombol **"Nyalakan musik"** ada di bawah tombol hero. Browser melarang audio main otomatis sebelum ada interaksi pengguna, jadi musik baru jalan setelah tombol itu diklik. Klik lagi untuk mematikan (dengan fade-out halus).

Untuk mengganti lagu: timpa file `assets/audio/background.mp3` dengan nama yang sama.

> Pastikan lagu yang dipakai bebas royalti atau kamu punya izinnya, karena repo ini publik.

---

## Menambah Foto Profil di Hero

Cari `id="hero-slides"`, lalu tambah satu baris:

```html
<img src="assets/img/profile-4.jpg" alt="Ikhsan Nur Pratama, foto profil 4" width="1200" height="1600" loading="lazy">
```

Slideshow menyesuaikan jumlah foto otomatis.

---

## Menjalankan Secara Lokal

Bisa langsung dobel-klik `index.html`.

Kalau ingin lewat server lokal:

```bash
python -m http.server 8788
```

Lalu buka `http://localhost:8788/`.

---

## Deploy di GitHub Pages

1. Push perubahan ke branch `main`.
2. Buka **Settings → Pages**.
3. **Source:** _Deploy from a branch_.
4. Branch: `main`, folder: `/ (root)`. Klik **Save**.
5. Tunggu 1–2 menit. Situs live di `https://USERNAME.github.io/NAMA-REPO/`

Setiap kali push ke `main`, situs otomatis diperbarui.

### Ukuran file

- Batas GitHub: 100 MB per file.
- Folder `assets/` sekitar 13 MB. Aman.
- Jangan masukkan file mentah (video asli besar, `.pptx`, folder foto sumber).

---

## Catatan Teknis

- Palet terkunci ke warna PPT: cocoa `#4B312B`, plum `#7B2D9F`, cream `#F1EFEC`, amber `#FDD82E`.
- Font: Archivo (judul) dan Space Grotesk (teks), dari Google Fonts.
- Animasi menghormati `prefers-reduced-motion`.
- Tanpa framework, tanpa dependency.
