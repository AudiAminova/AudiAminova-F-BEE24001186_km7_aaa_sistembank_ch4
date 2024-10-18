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
userId ganti sesuia id user yang ingin dihapus

5. Menampilkan Profil Berdasarkan userId
GET http://localhost:4000/api/v1/profiles/:userId

6. Membuat Profil Baru
POST http://localhost:4000/api/v1/profiles/:userId/profile
{
    "identity_type": "KTP",
    "identity_number": "1234567890123456",
    "address": "Jl. Contoh No. 1"
}

7. Membuat Akun Baru
POST http://localhost:4000/api/v1/accounts
{
    "user_id": 1,
    "bank_name": "Bank A",
    "bank_account_number": "1234567890"
}

8. Menampilkan Daftar Akun
GET http://localhost:4000/api/v1/accounts

9. Menampilkan Detail Akun
GET http://localhost:4000/api/v1/accounts/:accountId
accountId ganti dengan id akun yang ingin ditampilkan

10. Melakukan Deposit dan WIthdraw
POST http://localhost:4000/api/v1/accounts/deposit(atau /withdraw jika ingin melakukan pengurangan saldo)
{
    "accountId": 1,
    "amount": 5000
}

11. Mengirimkan Uang dari Satu Akun ke Akun Lain
POST http://localhost:4000/api/v1/transactions
{
    "source_account_id": 1,
    "destination_account_id": 2,
    "amount": 100000
}

12. Menampilkan Daftar Transaksi
GET http://localhost:4000/api/v1/transactions

13. Menampilkan Detail Transaksi Berdasarkan transactionId
http://localhost:4000/api/v1/transactions/:transactionId