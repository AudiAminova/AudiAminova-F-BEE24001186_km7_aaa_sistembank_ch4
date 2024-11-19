BASIC BANKING SYSTEM

Repository ini merupakan implementasi dari sistem perbankan sederhana menggunakan teknologi Express.js dan Prisma.js. Sistem ini mencakup berbagai endpoint untuk mengelola data pengguna, akun, dan transaksi.

A. Fitur Utama
User Management: Tambah dan tampilkan data pengguna serta profilnya.
Account Management: Kelola akun bank yang terhubung dengan pengguna.
Transaction Management: Lakukan transaksi antara akun, serta lihat riwayat dan detail transaksi.

B. Teknologi yang Digunakan
Node.js: Runtime untuk menjalankan aplikasi.
Express.js: Framework web untuk membuat server dan API.
Prisma: ORM (Object-Relational Mapping) untuk berinteraksi dengan basis data PostgreSQL.

C. Cara Menjalankan Program
1. Membuat User dan Profile
POST http://localhost:4000/api/v1/users
{
    "name": "audi",
    "email": "audi@gmail.com",
    "password": "audi23",
    "profile": {
        "identity_type": "KTP",
        "identity_number": "1234567890123456",
        "address": "Bogor"
    }
}

2. Menampilkan Daftar Users
GET http://localhost:4000/api/v1/users

3. Menampilkan Detail User dan Profile
GET http://localhost:4000/api/v1/users/:userId
user Id sesuaikan dengan id user yanng ingin ditampilkan

4. Menghapus Data User dan Profile
DELETE http://localhost:4000/api/v1/users/:userId 
userId ganti sesuai id user yang ingin dihapus
jika ingin menghapus user, hapus terlebih dahulu profilenya

5. Menampilkan Profile Berdasarkan userId
GET http://localhost:4000/api/v1/profiles/:userId

6. Membuat Profile Baru
POST http://localhost:4000/api/v1/profiles/:userId/profile
{
    "identity_type": "KTP",
    "identity_number": "1234567890123456",
    "address": "Jl. Contoh No. 1"
}

7. Menghapus Profile
DELETE http://localhost:4000/api/v1/profiles/:userId/profile

8. Membuat Akun Baru
POST http://localhost:4000/api/v1/accounts
{
    "user_id": 1,
    "bank_name": "Bank A",
    "bank_account_number": "1234567890"
}

9. Menampilkan Daftar Akun
GET http://localhost:4000/api/v1/accounts

10. Menampilkan Detail Akun
GET http://localhost:4000/api/v1/accounts/:accountId
accountId ganti dengan id akun yang ingin ditampilkan

11. Melakukan Deposit dan WIthdraw
POST http://localhost:4000/api/v1/accounts/deposit(atau /withdraw jika ingin melakukan pengurangan saldo)
{
    "accountId": 1,
    "amount": 5000
}

12. Mengirimkan Uang dari Satu Akun ke Akun Lain
POST http://localhost:4000/api/v1/transactions
{
    "source_account_id": 1,
    "destination_account_id": 2,
    "amount": 100000
}

13. Menampilkan Daftar Transaksi
GET http://localhost:4000/api/v1/transactions

14. Menampilkan Detail Transaksi Berdasarkan transactionId
http://localhost:4000/api/v1/transactions/:transactionId

*CHALLENGE CHAPTER 5*
1. Registerasi User
POST http://localhost:4000/api/v1/auth/register
{
    "name": "bubu",
    "email": "bubu@gmail",
    "password": "bubu23"
}

2. Login User
POST http://localhost:4000/api/v1/auth/login
{
    "email": "bubu@gmail",
    "password": "bubu23"
}

respons: akan mendapatkan token

3. Whoami
GET http://localhost:4000/api/v1/auth/whoami
Copy token -> pilih Auth -> Bearer token -> masukkan token -> send

4. Menggunakan JWT untuk request ke Bank Account
Belum berhasil, error:
PrismaClientValidationError: 
Invalid `prisma.bankAccount.findUnique()` invocation:

{
  where: {
+   id: Int
  }
}

Argument `id` is missing.

5. Melihat API Documentation
/ch_4 -> node app.js -> follow link http://localhost:4000/api-docs

6. Unit Testing (jest) 
/ch_4 -> npm run test

*CHALLENGE CHAPTER 6*
1. Upload Gambar
POST https://binar-km-7.et.r.appspot.com/api/v1/images
Pilih tipe body form-data di Postman: 
Key: title, description, image (file)
value: 
- Masukkan judul gambar
- Masukkan deskripsi gambar
- Pilih gambar yang akan diunggah dari komputer

2. Melihat Daftar Gambar
GET https://binar-km-7.et.r.appspot.com/api/v1/images

3. Melihat Detail Gambar Berdasarkan ID
GET https://binar-km-7.et.r.appspot.com/api/v1/images/:id

4. Menghapus Gambar Berdasarkan ID 
DELETE https://binar-km-7.et.r.appspot.com/api/v1/images/:id

5. Edit Judul dan Deskripsi Gambar Berdasarkan ID
PUT https://binar-km-7.et.r.appspot.com/api/v1/images/:id
Pilih tipe body raw dan format JSON,
{
  "title": "Judul baru",
  "description": "Deskripsi baru gambar"
}

*CHALLENGE CHAPTER 7*
1. Register
POST https://binar-km-7.et.r.appspot.com/api/v1/auth/register
{
    "name": "bubu",
    "email": "bubu@gmail.com",
    "password": "bubu"
}

2. Lupa Password
POST https://binar-km-7.et.r.appspot.com/api/v1/auth/forgot-password
{
    "email": "bubu@gmail"
}

Token baru akan dikirimkan ke email Anda. Setelah menekan tombol 'Reset Password', Anda akan diarahkan ke http://localhost:4000/api/v1/auth/reset-password/${token}, kemudian salin token tersebut.

3. Reset Password
POST https://binar-km-7.et.r.appspot.com/api/v1/auth/reset-password
{
    "resetToken": "your_token",
    "newPassword": "bubu23"
}

Masukkan token yang diterima melalui email yang telah dikirimkan dan buatlah password baru, kemudian coba lagi untuk melakukan login.

4. Notifications
GET https://binar-km-7.et.r.appspot.com/notifications
Pastikan user sudah terkoneksi "A user connected to /notifications".
Lakukan registrasi atau reset password, anda akan mendapatkan notifikasi telah berhasil register atau reset password.

Jika mengalami error seperti ini:
"Can't reach database server at `ep-falling-heart-a1tr9b97.ap-southeast-1.aws.neon.tech:5432`
Please make sure your database server is running at `ep-falling-heart-a1tr9b97.ap-southeast-1.aws.neon.tech:5432`."
Mohon mengirim ulang permintaan.



