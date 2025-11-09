# 📋 Template README.md untuk Website PPDB TAUD SaQu Abu Ayyub

```markdown
# 🏫 Website PPDB TAUD SaQu Abu Ayyub

Website resmi Penerimaan Peserta Didik Baru (PPDB) TAUD SaQu Abu Ayyub Tahun Pelajaran 2026-2027. Dibangun dengan teknologi modern untuk memberikan pengalaman terbaik bagi calon orang tua siswa.

## ✨ Fitur Utama

- ✅ **Landing Page Responsif** - Tampil optimal di semua device
- ✅ **Formulir Pendaftaran Online** - Terintegrasi dengan Google Form
- ✅ **Galeri Dokumentasi** - Foto & video kegiatan sekolah
- ✅ **Informasi Lengkap** - Visi, misi, program, dan syarat pendaftaran
- ✅ **Integrasi WhatsApp** - Langsung terhubung dengan admin
- ✅ **Peta Lokasi** - Google Maps embed
- ✅ **Design Islami** - Nuansa Islamic dengan ornamen geometris

## 🛠️ Teknologi yang Digunakan

- **Frontend Framework:** React 18 + TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS v4
- **UI Components:** shadcn/ui
- **Deployment:** Vercel/Netlify
- **Font:** Inter & Amiri (Arabic)

## 🎨 Color Palette

| Warna | Kode | Penggunaan |
|-------|------|------------|
| Primary Orange | `#EF7722` | Header, tombol utama, aksen |
| Secondary Orange | `#FAA533` | Gradient, hover states |
| Light Gray | `#EBEBEB` | Background, card |
| Accent Blue | `#0BA6DF` | Tombol sekunder, links |

## 📁 Struktur Project

```
ppdb-taud-saqu/
├── public/
│   ├── images/
│   │   ├── kegiatan-1.jpg sampai kegiatan-10.jpg
│   │   ├── anak-anak.png
│   │   └── ornamen.png
│   ├── videos/
│   │   ├── video-1.mp4 sampai video-3.mp4
│   └── logo.png
├── src/
│   ├── components/
│   │   ├── Navbar.tsx
│   │   ├── Hero.tsx
│   │   ├── Documentation.tsx
│   │   ├── GraduateStandards.tsx
│   │   ├── About.tsx
│   │   ├── VisionMission.tsx
│   │   ├── Programs.tsx
│   │   ├── RegistrationRequirements.tsx
│   │   ├── ContactInfo.tsx
│   │   ├── Location.tsx
│   │   ├── Footer.tsx
│   │   └── DeveloperCredit.tsx
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
```

## 🚀 Instalasi & Menjalankan

### Prerequisites
- Node.js 18+ 
- npm atau yarn

### Langkah-langkah
```bash
# Clone repository
git clone [url-repository]
cd ppdb-taud-saqu

# Install dependencies
npm install

# Jalankan development server
npm run dev

# Build untuk production
npm run build

# Preview production build
npm run preview
```

## 📱 Sections Website

1. **Navbar** - Logo & CTA Daftar Sekarang
2. **Hero Section** - Header utama dengan gradient & ornamen islami
3. **Dokumentasi** - Galeri foto & video kegiatan
4. **Standar Kelulusan** - Output yang diharapkan
5. **Tentang Sekolah** - Profil singkat TAUD SaQu
6. **Visi & Misi** - Tujuan dan nilai sekolah
7. **Program Kegiatan** - Kurikulum dan aktivitas
8. **Syarat Pendaftaran** - Requirements administrasi & non-administrasi
9. **Kontak & Informasi** - WhatsApp admin & formulir online
10. **Lokasi** - Google Maps embed
11. **Footer** - Info lengkap & credit developer

## 🌐 Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Netlify
- Drag & drop folder `dist` ke Netlify
- Atau connect GitHub repository

## 📞 Informasi Kontak

- **Website:** [taud-saqu-abu-ayyub.vercel.app](https://taud-saqu-abu-ayyub.vercel.app)
- **Formulir:** [bit.ly/PPDB-TAUDSaqu-A4](https://bit.ly/PPDB-TAUDSaqu-A4)
- **WhatsApp Admin:** [0821-6959-9979](https://wa.me/6282169599979)
- **Lokasi:** Jl. Sakura Gg. Mufakat 3, Duri Barat, Mandau, Bengkalis

## 👨‍💻 Developer

**Muhammad Harits**
- GitHub: [muharits](https://github.com/muharits)
- Email: [your-email@example.com]

## 📄 Lisensi

Project ini dikembangkan untuk TAUD SaQu Abu Ayyub © 2024

---

<div align="center">
Dibangun dengan ❤️ untuk pendidikan Islami generasi muda
</div>
```

## 🎯 **Informasi yang Perlu Anda Isi:**

### **1. Repository URL** (jika mau di GitHub)
```markdown
git clone [url-repository]
```

### **2. Live Website URL**
```markdown
**Website:** [taud-saqu-abu-ayyub.vercel.app](https://taud-saqu-abu-ayyub.vercel.app)
```

### **3. Informasi Kontak Developer**
```markdown
**Muhammad Harits**
- GitHub: [muharits](https://github.com/muharits)
- Email: [your-email@example.com]  <!-- Ganti dengan email Anda -->
- Portfolio: [your-portfolio-link]  <!-- Optional -->
```

### **4. Badges (Optional)**
```markdown
![React](https://img.shields.io/badge/React-18.2.0-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0.2-blue)
![Tailwind](https://img.shields.io/badge/Tailwind-CSS-v4-orange)
![Vite](https://img.shields.io/badge/Vite-4.4.5-purple)
```

## 📝 **Customization Tips:**

1. **Ganti semua `[placeholder]`** dengan informasi aktual
2. **Tambahkan screenshot** di bagian atas README
3. **Update versi dependencies** jika perlu
4. **Tambahkan section "Development"** jika mau menjelaskan technical details
5. **Include environment variables** jika ada

Mau saya tambahkan section khusus untuk deployment instructions atau environment setup?