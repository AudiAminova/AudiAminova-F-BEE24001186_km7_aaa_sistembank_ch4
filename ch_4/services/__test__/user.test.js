import { jest } from '@jest/globals';
import { User } from '../user.js'; 
import { prisma } from '../../src/PrismaClient.js';
import bcrypt from 'bcrypt';

jest.mock('../../src/PrismaClient.js', () => ({
    prisma: {
        user: {
            create: jest.fn(),
            findUnique: jest.fn(),
            findMany: jest.fn(),
            delete: jest.fn(),
        },
        profile: {
            findUnique: jest.fn(),
        },
    },
}));

describe('User Class', () => {
    afterEach(() => { // untuk memastikan bahwa hasil dari satu tes tidak mempengaruhi tes berikutnya
        jest.clearAllMocks(); // untuk membersihkan mocks setelah setiap dilakukan testing
    });

    // menguji fungsi register
    test('Membuat User Baru', async() => {
        const name = 'Audi';
        const email = 'audi@example.com';
        const password = 'audi123';

        const hashedPassword = await bcrypt.hash(password, 10);
    
        // memmock prisma.user.create untuk mengembalikan data user yang dibuat
        // mockResolvedValue untuk mengontrol hasil dari pemanggilan fungsi tanpa bergantung pada database nyata
        prisma.user.create.mockResolvedValue({ id: 1, name, email, password: hashedPassword }); 
    
        const user = new User(name, email, password);
        await user.register();
    
        // toHaveBeenCalledWith untuk memverifikasi bahwa fungsi dipanggil dengan argumen yang benar
        expect(prisma.user.create).toHaveBeenCalledWith({
            data: { 
                name: 'Audi', 
                email: 'audi@example.com', 
                password: expect.any(String) 
            },
        });

        expect(await bcrypt.compare(password, hashedPassword)).toBe(true); // memastikan password yang di-hash sesuai
        expect(user.getID()).toBe(1); // mengecek apakah ID user sudah di set
    });
    
    // menguji fungsi getUser
    test('Mendapatkan User Berdasarkan ID', async() => {
        const name = 'Audi';
        const email = 'audi@example.com';
        const password = 'audi123';

        const mockUser = {
            id: 1,
            name: name,
            email: email,
            password: password,
        };

        // memmock prisma.user.findUnique
        prisma.user.findUnique.mockResolvedValue(mockUser);

        const user = await User.getUser(1);

        expect(prisma.user.findUnique).toHaveBeenCalledWith({
            where: { id: 1 },
            include: { profile: true },
        });

        expect(user).toEqual(mockUser); // memastikan hasil User sesuai mock
    });

    // menguji fungsi getAllUsers
    test('Mendapatkan Semua User', async() => {
        const mockUsers = [
            {
                name: 'Audi',
                email: 'audi@example.com',
                password: 'audi123',
            },
            {
                name: 'Aini',
                email: 'aini@example.com',
                password: 'aini321',
            }
        ];

        // memmock prima.user.findMany
        prisma.user.findMany.mockResolvedValue(mockUsers);
        const users = await User.getAllUsers();

        expect(prisma.user.findMany).toHaveBeenCalled();
        expect(users).toEqual(mockUsers); // memastikan hasil User sesuai mock
    });

    // menguji fungsi deleteUser
    test('Hapus User Berdasarkan ID', async() => {
        const name = 'Audi';
        const email = 'audi@example.com';
        const password = 'audi123';

        const mockUser = {
            id: 1,
            name: name,
            email: email,
            password: password,
        };

        // memmock prisma.user.findUnique
        prisma.user.findUnique.mockResolvedValue(mockUser);
        // memmock prisma.user.delete
        prisma.user.delete.mockResolvedValue(mockUser);

        await User.deleteUser(1);

        expect(prisma.user.findUnique).toHaveBeenCalledWith({
            where: { id: 1 },
        });
        expect(prisma.user.delete).toHaveBeenCalledWith({
            where: { id: 1 },
        });
    });

    // menguji error saat mencoba menghapus user yang tidak ada
    test('Memunculkan Error Saat Mencoba Menghapus User yang Tidak Ada', async() => {
        prisma.user.findUnique.mockResolvedValue(null);

        await expect(User.deleteUser(999)).rejects.toThrow('User not found');

        expect(prisma.user.findUnique).toHaveBeenCalledWith({
            where: { id: 999 },
        });
        expect(prisma.user.delete).not.toHaveBeenCalled();
    });
});