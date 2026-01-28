import 'dotenv/config';
import bcryptjs from 'bcryptjs';
import { PrismaClient as PrismaUsersClient } from '@prisma/client-users';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL_USERS,
});

const adapter = new PrismaPg(pool);

const prismaUsers = new PrismaUsersClient({ adapter });

async function main() {
    console.log('Iniciando seed de la base de datos USERS...\n');

    try {
        // Crear roles
        console.log('Creando roles...');
        const roles = await Promise.all([
            prismaUsers.role.upsert({
                where: { name: 'ADMIN' },
                update: {},
                create: { name: 'ADMIN' }
            }),
            prismaUsers.role.upsert({
                where: { name: 'TEACHER' },
                update: {},
                create: { name: 'TEACHER' }
            }),
            prismaUsers.role.upsert({
                where: { name: 'STUDENT' },
                update: {},
                create: { name: 'STUDENT' }
            })
        ]);

        console.log('Roles creados');

        // Hash de contraseña
        const hashedPassword = await bcryptjs.hash('password123', 10);

        // Crear usuarios
        console.log('Creando usuarios...');
        const users = await Promise.all([
            // Admin
            prismaUsers.user.upsert({
                where: { email: 'admin@sguni.com' },
                update: {},
                create: {
                    name: 'Administrador',
                    email: 'admin@sguni.com',
                    password: hashedPassword,
                    phone: '+591-1234567',
                    age: 35,
                    status: 'active',
                    roleId: roles[0].id // ADMIN
                }
            }),
            // Docentes
            prismaUsers.user.upsert({
                where: { email: 'docente1@sguni.com' },
                update: {},
                create: {
                    name: 'Dr. Juan Pérez',
                    email: 'docente1@sguni.com',
                    password: hashedPassword,
                    phone: '+591-7123456',
                    age: 42,
                    status: 'active',
                    roleId: roles[1].id // TEACHER
                }
            }),
            prismaUsers.user.upsert({
                where: { email: 'docente2@sguni.com' },
                update: {},
                create: {
                    name: 'Ing. María García',
                    email: 'docente2@sguni.com',
                    password: hashedPassword,
                    phone: '+591-7234567',
                    age: 38,
                    status: 'active',
                    roleId: roles[1].id // TEACHER
                }
            }),
            prismaUsers.user.upsert({
                where: { email: 'docente3@sguni.com' },
                update: {},
                create: {
                    name: 'Lic. Carlos López',
                    email: 'docente3@sguni.com',
                    password: hashedPassword,
                    phone: '+591-7345678',
                    age: 40,
                    status: 'active',
                    roleId: roles[1].id // TEACHER
                }
            }),
            // Estudiantes
            prismaUsers.user.upsert({
                where: { email: 'estudiante1@sguni.com' },
                update: {},
                create: {
                    name: 'Ana Rodríguez',
                    email: 'estudiante1@sguni.com',
                    password: hashedPassword,
                    phone: '+591-72345678',
                    age: 20,
                    status: 'active',
                    roleId: roles[2].id // STUDENT
                }
            }),
            prismaUsers.user.upsert({
                where: { email: 'estudiante2@sguni.com' },
                update: {},
                create: {
                    name: 'Luis Morales',
                    email: 'estudiante2@sguni.com',
                    password: hashedPassword,
                    phone: '+591-72456789',
                    age: 21,
                    status: 'active',
                    roleId: roles[2].id // STUDENT
                }
            }),
            prismaUsers.user.upsert({
                where: { email: 'estudiante3@sguni.com' },
                update: {},
                create: {
                    name: 'Sofia Martínez',
                    email: 'estudiante3@sguni.com',
                    password: hashedPassword,
                    phone: '+591-72567890',
                    age: 19,
                    status: 'active',
                    roleId: roles[2].id // STUDENT
                }
            }),
            prismaUsers.user.upsert({
                where: { email: 'estudiante4@sguni.com' },
                update: {},
                create: {
                    name: 'Roberto Flores',
                    email: 'estudiante4@sguni.com',
                    password: hashedPassword,
                    phone: '+591-72678901',
                    age: 20,
                    status: 'inactive',
                    roleId: roles[2].id // STUDENT
                }
            })
        ]);

        console.log('Usuarios creados');

        console.log('\nSeed de USERS completado exitosamente!\n');
        console.log('Resumen:');
        console.log(`   - ${roles.length} roles creados`);
        console.log(`   - ${users.length} usuarios creados\n`);
        console.log('Credenciales de prueba:');
        console.log('   Email: admin@sguni.com');
        console.log('   Contraseña: password123\n');
        console.log('   Email: docente1@sguni.com');
        console.log('   Contraseña: password123\n');
        console.log('   Email: estudiante1@sguni.com');
        console.log('   Contraseña: password123\n');

    } catch (error) {
        console.error('Error durante el seed de USERS:', error);
        throw error;
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prismaUsers.$disconnect();
    });
