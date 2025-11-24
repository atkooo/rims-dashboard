# RIMS Dashboard

Dashboard web untuk melihat data yang dikirim dari sync service RIMS dengan integrasi autentikasi Supabase.

## Fitur

- 🔐 Autentikasi dengan Supabase
- 📊 Dashboard dengan statistik transaksi
- 📈 Visualisasi data dengan Chart.js
- 🔄 Data real-time dari Supabase
- 📱 Responsive design

## Setup

1. Install dependencies:
```bash
npm install
```

2. Buat file `.env` dari `.env.example`:
```bash
cp .env.example .env
```

3. Isi file `.env` dengan credentials Supabase:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
```

4. Jalankan development server:
```bash
npm run dev
```

**Menggunakan Port Lain:**

Ada beberapa cara untuk menggunakan port selain 3000:

**Cara 1: Menggunakan environment variable PORT**
```bash
# Linux/Mac
PORT=3001 npm run dev

# Windows (PowerShell)
$env:PORT=3001; npm run dev

# Windows (Command Prompt)
set PORT=3001 && npm run dev
```

**Cara 2: Menggunakan command line flag**
```bash
npm run dev -- --port 3001
# atau
npx vite --port 3001
```

**Cara 3: Menggunakan npm scripts yang sudah disediakan**
```bash
npm run dev:3001  # Port 3001
npm run dev:3002  # Port 3002
npm run dev:5000  # Port 5000
```

**Cara 4: Mengubah di file `.env` (opsional)**
Tambahkan `PORT=3001` ke file `.env` (tapi Vite tidak otomatis membaca PORT dari .env, gunakan cara 1-3)

5. Build untuk production:
```bash
npm run build
```

## Struktur Project

- `src/main.js` - Entry point aplikasi
- `src/App.vue` - Komponen utama
- `src/config/supabase.js` - Konfigurasi Supabase
- `src/stores/auth.js` - Pinia store untuk authentication
- `src/services/api.js` - Service untuk fetch data dari Supabase
- `src/views/` - Halaman-halaman dashboard
- `src/components/` - Komponen-komponen reusable
- `src/router/` - Konfigurasi routing

## Supabase Setup

### 1. Database Tables

Pastikan tabel-tabel berikut sudah ada di Supabase:
- `rental_transactions`
- `rental_transaction_details`
- `sales_transactions`
- `sales_transaction_details`
- `payments`
- `stock_movements`

### 2. Authentication Setup

1. **Aktifkan Supabase Auth:**
   - Buka Supabase Dashboard → Authentication
   - Pastikan Authentication sudah diaktifkan

2. **Konfigurasi Email Authentication:**
   - Buka Authentication → Providers
   - Aktifkan Email provider
   - Konfigurasi SMTP jika ingin menggunakan email custom (opsional)

3. **Set URL Redirect (Opsional):**
   - Buka Authentication → URL Configuration
   - Tambahkan `http://localhost:3000` ke Site URL untuk development
   - Tambahkan domain production untuk production

4. **Row Level Security (RLS):**
   - Pastikan RLS policies sudah dikonfigurasi dengan benar
   - Untuk dashboard, Anda mungkin perlu membuat policies yang memungkinkan authenticated users membaca data:
     ```sql
     -- Contoh policy untuk rental_transactions
     CREATE POLICY "Allow authenticated users to read rental_transactions"
     ON rental_transactions
     FOR SELECT
     TO authenticated
     USING (true);
     ```

### 3. Environment Variables

Buat file `.env` di root project dengan content berikut:
```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

Anda bisa mendapatkan URL dan Anon Key dari:
- Supabase Dashboard → Settings → API

