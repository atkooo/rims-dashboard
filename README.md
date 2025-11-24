# RIMS Dashboard

Dashboard untuk melihat data yang dikirim dari sync service RIMS.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Buat file `.env` di root folder dengan isi:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

3. Untuk membuat akun default, buat file `.env` tambahan atau tambahkan di file `.env` yang sama:
```
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

4. Install dotenv untuk script:
```bash
npm install dotenv
```

5. Jalankan script untuk membuat akun default:
```bash
node scripts/create-default-accounts.js
```

### Konfigurasi Supabase Row Level Security (RLS)

Untuk keamanan, rims-dashboard menggunakan **Anon Key** yang subject to RLS (Row Level Security). Ini berarti semua operasi akan dibatasi oleh RLS policies.

#### Mengaktifkan Row Level Security (RLS) untuk View Only Access

**Langkah 1: Aktifkan RLS di Supabase**

1. Buka **Supabase Dashboard** → **SQL Editor**
2. Buka file `supabase-rls-policies.sql` di folder project ini
3. Copy seluruh isi file SQL tersebut
4. Paste ke SQL Editor di Supabase Dashboard
5. Klik **Run** untuk menjalankan query
6. Pastikan tidak ada error

**Langkah 2: Verifikasi RLS sudah aktif**

Jalankan query berikut di SQL Editor untuk memverifikasi:

```sql
SELECT 
  tablename, 
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN (
    'rental_transactions',
    'rental_transaction_details',
    'sales_transactions',
    'sales_transaction_details',
    'payments',
    'stock_movements'
  )
ORDER BY tablename;
```

Semua tabel harus menampilkan `rls_enabled = true`.

**Langkah 3: Verifikasi Policies**

Jalankan query berikut untuk melihat semua policies:

```sql
SELECT 
  tablename,
  policyname,
  roles,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN (
    'rental_transactions',
    'rental_transaction_details',
    'sales_transactions',
    'sales_transaction_details',
    'payments',
    'stock_movements'
  )
ORDER BY tablename, policyname;
```

**Catatan Penting tentang RLS Policies:**

- ✅ **View Only Access**: Policies yang dibuat hanya memberikan akses **SELECT (view)** untuk membaca data
- ✅ **No Write Access**: Dashboard tidak dapat melakukan INSERT, UPDATE, atau DELETE
- ✅ **Aman untuk Client-Side**: Anon key aman digunakan di frontend karena dibatasi oleh RLS
- ✅ **Subject to RLS**: Semua operasi akan dicek oleh RLS policies

**Testing setelah enable RLS:**

1. Pastikan `.env` sudah berisi `VITE_SUPABASE_ANON_KEY`
2. Restart development server (`npm run dev`)
3. Test semua fitur dashboard (view transactions, payments, stock movements)
4. Monitor browser console untuk memastikan tidak ada error permission denied
5. Jika ada masalah, cek policies di Supabase Dashboard → Authentication → Policies

## Akun Default

Setelah menjalankan script, 2 akun default akan dibuat:

1. **Admin**
   - Email: `admin@rims.local`
   - Password: `admin123`

2. **User**
   - Email: `user@rims.local`
   - Password: `user123`

⚠️ **PENTING**: Ganti password setelah login pertama kali melalui menu "Ganti Password" di dashboard!

## Development

```bash
npm run dev
```

## Build

```bash
npm run build
```

