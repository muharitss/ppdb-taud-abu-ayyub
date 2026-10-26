# 🏫 Website PPDB TAUD SaQu Abu Ayyub

Website resmi Penerimaan Peserta Didik Baru (PPDB) TAUD SaQu Abu Ayyub Tahun Pelajaran 2027-2028. Dibangun dengan teknologi modern untuk memberikan pengalaman terbaik bagi calon orang tua siswa.

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
- npm 

### Langkah-langkah
```bash
# Clone repository
git clone https://github.com/muharitss/ppdb-taud-abu-ayyub.git
cd ppdb-taud-abu-ayyub

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
