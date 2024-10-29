import { jest } from '@jest/globals';

import { Profile } from '../profile.js'; 
import { prisma } from '../../src/PrismaClient.js';

jest.mock('../../src/PrismaClient.js', () => ({
    prisma: {
        profile: {
            create: jest.fn(),
            findUnique: jest.fn(),
            delete: jest.fn(),
        },
    },
}));

describe('Profile Class', () => {

    // menguji fungsi create
    test('Membuat Profile Baru', async() => {
        const user_id = 1;
        const identity_type = 'KTP';
        const identity_number = '123321';
        const address = 'Bogor';

        const mockProfile = { 
            id: 1,
            user_id: user_id,
            identity_type: identity_type,
            identity_number: identity_number,
            address: address
        };
    
        // memmock prisma.profile.create untuk mengembalikan data profile yang dibuat
        prisma.profile.create.mockResolvedValue(mockProfile);
    
        const profile = new Profile(user_id, identity_type, identity_number, address);
        await profile.create();
    
        expect(prisma.profile.create).toHaveBeenCalledWith({
            data: { 
                identity_type: 'KTP', 
                identity_number: '123321', 
                address: "Bogor",
                user: { connect: { id: user_id }, },
            },
        });
        expect(await profile.create()).toEqual(mockProfile); // memastikan hasil Profile sesuai mock 
    });

    // menguji fungsi getProfile
    test('Mendapatkan Profile User Berdasarkan User ID', async() => {
        const user_id = 1;
        const identity_type = 'KTP';
        const identity_number = '123321';
        const address = 'Bogor';

        const mockProfile = { 
            id: 1,
            user_id: user_id,
            identity_type: identity_type,
            identity_number: identity_number,
            address: address
        };

        prisma.profile.findUnique.mockResolvedValue(mockProfile);

        const profile = await Profile.getProfile(1);

        expect(prisma.profile.findUnique).toHaveBeenCalledWith({
            where: { user_id: 1 },
            include: { user: true },
        });
        expect(profile).toEqual(mockProfile);
    });

    // menguji fungsi deleteProfile
    test('Menghapus Profile User Berdasarkan User ID', async() => {
        const user_id = 1;
        const identity_type = 'KTP';
        const identity_number = '123321';
        const address = 'Bogor';

        const mockProfile = { 
            id: 1,
            user_id: user_id,
            identity_type: identity_type,
            identity_number: identity_number,
            address: address
        };

        // memmock prisma.user.delete
        prisma.profile.delete.mockResolvedValue(mockProfile);

        await Profile.deleteProfile(1);

        expect(prisma.profile.delete).toHaveBeenCalledWith({
            where: { user_id: 1 },
        });
    });
});