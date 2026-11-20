# Novil Resume (CV as Code)

CV **Moh. Novil Ma'arij** dalam bentuk kode berbasis **JSON + HTML/CSS** yang ATS-friendly, rapi saat dicetak ke PDF (A4), dan mudah diperbarui kapan saja.

## Link Cepat

- **Web CV (GitHub Pages):** https://nvl123.github.io/novil-resume/
- **Download PDF Terbaru (GitHub Release):** https://github.com/Nvl123/novil-resume/releases/latest/download/CV_Moh_Novil_Maarij.pdf
- **Download PDF via GitHub Pages:** https://nvl123.github.io/novil-resume/CV_Moh_Novil_Maarij.pdf

> **Catatan GitHub Pages:** Workflow sudah mencoba mengaktifkan GitHub Pages secara otomatis (`enablement: true`). Jika web CV belum aktif saat deploy pertama, buka tab **Settings -> Pages** di repositori GitHub dan pastikan **Source** diatur ke **GitHub Actions**.

## Cara Update CV dengan Mudah

Seluruh isi CV tersimpan di satu file: [`data/cv.json`](./data/cv.json).

### Opsi 1: Langsung lewat GitHub Web
1. Buka [`data/cv.json`](./data/cv.json) di GitHub lalu klik ikon edit (pensil).
2. Ubah atau tambahkan teks (pengalaman kerja, pendidikan, kepanitiaan, skill, ringkasan, dll.).
3. Klik **Commit changes** ke branch `main`.
4. GitHub Actions otomatis membuat PDF terbaru, mengupdate GitHub Release `latest`, dan memperbarui Web CV di GitHub Pages.

### Opsi 2: Dari Lokal
1. Edit [`data/cv.json`](./data/cv.json).
2. Preview atau build di lokal jika ingin cek hasilnya terlebih dahulu.
3. Commit dan push ke `main`:
   ```bash
   git add data/cv.json
   git commit -m "update: pembaruan isi CV"
   git push
   ```

## Perintah Lokal

Membutuhkan **Node.js** dan browser **Google Chrome** atau **Microsoft Edge** (tanpa perlu `npm install` karena zero-dependency).

- **Preview CV di browser (auto-rebuild saat `data/cv.json` atau `src/styles.css` diubah):**
  ```bash
  npm run dev
  ```
  Lalu buka `http://localhost:3000`.

- **Build HTML + PDF ke folder `dist/`:**
  ```bash
  npm run build
  ```

- **Build HTML saja ke folder `dist/`:**
  ```bash
  npm run build:html
  ```

## Struktur Proyek

```text
.
├── .github/workflows/
│   └── build-and-deploy.yml  # Auto-build PDF, update Release, & deploy Pages
├── data/
│   └── cv.json               # Single source of truth untuk semua isi CV
├── scripts/
│   ├── build-html.mjs        # Generate dist/index.html & dist/styles.css
│   ├── build-pdf.mjs         # Render PDF A4 via headless Chrome/Edge
│   └── dev.mjs               # Server preview lokal
├── src/
│   ├── render.mjs            # Template renderer JSON -> HTML5
│   └── styles.css            # Styling layar & layout print A4 ATS-friendly
└── package.json
```
