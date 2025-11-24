# Setup Guide RIMS Dashboard

## Langkah-langkah Setup

### 1. Install Dependencies

```bash
cd rims-dashboard
npm install
```

### 2. Setup Environment Variables

Buat file `.env` di root folder `rims-dashboard` dengan isi berikut:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**Cara mendapatkan credentials Supabase:**
1. Login ke [Supabase Dashboard](https://app.supabase.com)
2. Pilih project Anda
3. Buka Settings → API
4. Copy `Project URL` untuk `VITE_SUPABASE_URL`
5. Copy `anon public` key untuk `VITE_SUPABASE_ANON_KEY`

### 3. Konfigurasi Supabase Authentication

#### A. Aktifkan Email Authentication

1. Buka Supabase Dashboard → Authentication → Providers
2. Klik pada "Email"
3. Pastikan "Enable Email provider" diaktifkan
4. Klik "Save"

#### B. Setup Row Level Security (RLS)

Untuk memberikan akses membaca data ke authenticated users, buat policies berikut di Supabase SQL Editor:

```sql
-- Policy untuk rental_transactions
CREATE POLICY "Allow authenticated users to read rental_transactions"
ON rental_transactions
FOR SELECT
TO authenticated
USING (true);

-- Policy untuk rental_transaction_details
CREATE POLICY "Allow authenticated users to read rental_transaction_details"
ON rental_transaction_details
FOR SELECT
TO authenticated
USING (true);

-- Policy untuk sales_transactions
CREATE POLICY "Allow authenticated users to read sales_transactions"
ON sales_transactions
FOR SELECT
TO authenticated
USING (true);

-- Policy untuk sales_transaction_details
CREATE POLICY "Allow authenticated users to read sales_transaction_details"
ON sales_transaction_details
FOR SELECT
TO authenticated
USING (true);

-- Policy untuk payments
CREATE POLICY "Allow authenticated users to read payments"
ON payments
FOR SELECT
TO authenticated
USING (true);

-- Policy untuk stock_movements
CREATE POLICY "Allow authenticated users to read stock_movements"
ON stock_movements
FOR SELECT
TO authenticated
USING (true);
```

**Catatan:** Pastikan RLS sudah diaktifkan untuk semua tabel. Cek di Supabase Dashboard → Table Editor → pilih tabel → Settings → Enable RLS.

### 4. Jalankan Development Server

```bash
npm run dev
```

Dashboard akan berjalan di `http://localhost:3000`

**Menggunakan Port Lain:**

Jika port 3000 sudah digunakan atau ingin menggunakan port lain, gunakan salah satu cara berikut:

**Cara 1: Environment Variable (Direkomendasikan)**
```bash
# Linux/Mac
PORT=3001 npm run dev

# Windows (PowerShell)
$env:PORT=3001; npm run dev

# Windows (Command Prompt)
set PORT=3001 && npm run dev
```

**Cara 2: Command Line Flag**
```bash
npm run dev -- --port 3001
```

**Cara 3: Menggunakan NPM Scripts**
```bash
npm run dev:3001  # Port 3001
npm run dev:3002  # Port 3002
npm run dev:5000  # Port 5000
```

**Catatan:** Jika menggunakan port selain 3000, pastikan untuk mengupdate URL di Supabase Auth → URL Configuration jika diperlukan.

### 5. Membuat Akun Pengguna

1. Buka `http://localhost:3000`
2. Klik "Daftar di sini" di halaman login
3. Isi email dan password
4. Klik "Daftar"
5. Cek email untuk verifikasi (jika email confirmation diaktifkan)
6. Login dengan email dan password yang sudah didaftarkan

### 6. Build untuk Production

```bash
npm run build
```

File hasil build akan ada di folder `dist/`. Deploy folder `dist/` ke hosting Anda (Vercel, Netlify, dll).

**Jangan lupa untuk:**
- Menambahkan domain production ke Supabase Auth → URL Configuration
- Mengganti `VITE_SUPABASE_URL` dengan URL production jika berbeda

## Troubleshooting

### Error: "Missing Supabase environment variables"
- Pastikan file `.env` sudah dibuat di root folder
- Pastikan nama variabel dimulai dengan `VITE_`
- Restart development server setelah membuat/mengubah `.env`

### Error: "Failed to fetch" saat load data
- Cek apakah RLS policies sudah dibuat dengan benar
- Cek apakah user sudah login
- Cek console browser untuk error detail

### Error: "Email already registered"
- Email sudah terdaftar, gunakan email lain atau reset password

### Data tidak muncul
- Pastikan sync service sudah mengirim data ke Supabase
- Cek apakah tabel-tabel sudah ada di Supabase
- Cek RLS policies apakah sudah memberikan akses read ke authenticated users

