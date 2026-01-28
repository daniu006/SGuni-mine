import 'dotenv/config';
import { PrismaClient as PrismaUsersClient } from '@prisma/client-users';
import { PrismaClient as PrismaAcademicClient } from '@prisma/client-academic';
import { PrismaClient as PrismaProfilesClient } from '@prisma/client-profiles';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const poolUsers = new Pool({
    connectionString: process.env.DATABASE_URL_USERS,
});

const poolAcademic = new Pool({
    connectionString: process.env.DATABASE_URL_ACADEMIC,
});

const poolProfiles = new Pool({
    connectionString: process.env.DATABASE_URL_PROFILES,
});

const adapterUsers = new PrismaPg(poolUsers);
const adapterAcademic = new PrismaPg(poolAcademic);
const adapterProfiles = new PrismaPg(poolProfiles);

const prismaUsers = new PrismaUsersClient({ adapter: adapterUsers });
const prismaAcademic = new PrismaAcademicClient({ adapter: adapterAcademic });
const prismaProfiles = new PrismaProfilesClient({ adapter: adapterProfiles });

async function main() {
    console.log('Iniciando seed de la base de datos PROFILES...\n');

    try {
        // Obtener datos de las otras bases de datos
        console.log('Obteniendo datos de la base de datos USERS...');
        const users = await prismaUsers.user.findMany({
            include: { role: true }
        });

        console.log('Obteniendo datos de la base de datos ACADEMIC...');
        const especialidades = await prismaAcademic.speciality.findMany();
        const carreras = await prismaAcademic.career.findMany();
        const ciclos = await prismaAcademic.cycle.findMany();
        const materias = await prismaAcademic.subject.findMany();

        // Cerrar conexiones anteriores para evitar limits
        await prismaUsers.$disconnect();
        await prismaAcademic.$disconnect();
        
        console.log('Sincronizando referencias de usuarios...');
        for (const user of users) {
            await prismaProfiles.userReference.upsert({
                where: { id: user.id },
                update: { name: user.name, email: user.email, roleId: user.roleId, status: user.status },
                create: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    roleId: user.roleId,
                    status: user.status
                }
            });
        }

        console.log('Referencias de usuarios sincronizadas');

        // Sincronizar referencias de especialidades
        console.log('Sincronizando referencias de especialidades...');
        for (const esp of especialidades) {
            await prismaProfiles.specialityReference.upsert({
                where: { id: esp.id },
                update: { name: esp.name },
                create: { id: esp.id, name: esp.name }
            });
        }

        console.log('Referencias de especialidades sincronizadas');

        // Sincronizar referencias de carreras
        console.log('Sincronizando referencias de carreras...');
        for (const car of carreras) {
            await prismaProfiles.careerReference.upsert({
                where: { id: car.id },
                update: { name: car.name, totalCicles: car.totalCicles },
                create: { id: car.id, name: car.name, totalCicles: car.totalCicles }
            });
        }

        console.log('Referencias de carreras sincronizadas');

        // Sincronizar referencias de materias
        console.log('Sincronizando referencias de materias...');
        for (const mat of materias) {
            await prismaProfiles.subjectReference.upsert({
                where: { id: mat.id },
                update: { name: mat.name, careerId: mat.careerId, cicleNumber: mat.cicleNumber },
                create: {
                    id: mat.id,
                    name: mat.name,
                    careerId: mat.careerId,
                    cicleNumber: mat.cicleNumber
                }
            });
        }

        console.log('Referencias de materias sincronizadas');

        // Sincronizar referencias de ciclos
        console.log('Sincronizando referencias de ciclos...');
        for (const ciclo of ciclos) {
            await prismaProfiles.cycleReference.upsert({
                where: { id: ciclo.id },
                update: { name: ciclo.name, year: ciclo.year, period: ciclo.period },
                create: {
                    id: ciclo.id,
                    name: ciclo.name,
                    year: ciclo.year,
                    period: ciclo.period
                }
            });
        }

        console.log('Referencias de ciclos sincronizadas');

        // Crear perfiles de docentes
        console.log('Creando perfiles de docentes...');
        const teachers = users.filter(u => u.role.name === 'TEACHER');

        const teacherProfiles: Array<{ id: number; userId: number; specialityId: number; careerId: number; employmentType: string; }> = [];
        for (const teacher of teachers.slice(0, 2)) {
            const profile = await prismaProfiles.teacherProfile.upsert({
                where: { userId: teacher.id },
                update: {},
                create: {
                    userId: teacher.id,
                    specialityId: especialidades[0].id,
                    careerId: carreras[0].id,
                    employmentType: 'FULL_TIME'
                }
            });
            teacherProfiles.push(profile as any);
        }

        console.log('Perfiles de docentes creados');

        // Asignar materias a docentes
        console.log('Asignando materias a docentes...');
        for (let i = 0; i < teacherProfiles.length && i < materias.length; i++) {
            await prismaProfiles.subjectAssignment.upsert({
                where: {
                    teacherProfileId_subjectId: {
                        teacherProfileId: teacherProfiles[i].id,
                        subjectId: materias[i].id
                    }
                },
                update: {},
                create: {
                    teacherProfileId: teacherProfiles[i].id,
                    subjectId: materias[i].id
                }
            });
        }

        console.log('Materias asignadas a docentes');

        // Crear perfiles de estudiantes
        console.log('Creando perfiles de estudiantes...');
        const students = users.filter(u => u.role.name === 'STUDENT');

        const studentProfiles: Array<{ id: number; userId: number; careerId: number; currentCicle: number; }> = [];
        for (const student of students.slice(0, 2)) {
            const profile = await prismaProfiles.studentProfile.upsert({
                where: { userId: student.id },
                update: {},
                create: {
                    userId: student.id,
                    careerId: carreras[0].id,
                    currentCicle: 1
                }
            });
            studentProfiles.push(profile as any);
        }

        console.log('Perfiles de estudiantes creados');

        // Inscribir estudiantes en materias
        console.log('Inscribiendo estudiantes en materias...');
        for (let i = 0; i < studentProfiles.length; i++) {
            for (let j = 0; j < materias.slice(0, 2).length; j++) {
                const subject = materias[j];
                const grade = i === 1 ? 85.50 : undefined;
                const status = i === 1 ? 'completed' : 'enrolled';
                
                await prismaProfiles.studentSubject.upsert({
                    where: {
                        studentProfileId_subjectId: {
                            studentProfileId: studentProfiles[i].id,
                            subjectId: subject.id
                        }
                    },
                    update: {},
                    create: {
                        studentProfileId: studentProfiles[i].id,
                        subjectId: subject.id,
                        cycleId: ciclos[0].id,
                        grade,
                        status
                    }
                });
            }
        }

        console.log('Estudiantes inscritos en materias');

        console.log('\nSeed de PROFILES completado exitosamente!\n');
        console.log('Resumen:');
        console.log(`   - ${users.length} referencias de usuarios`);
        console.log(`   - ${especialidades.length} referencias de especialidades`);
        console.log(`   - ${carreras.length} referencias de carreras`);
        console.log(`   - ${materias.length} referencias de materias`);
        console.log(`   - ${ciclos.length} referencias de ciclos`);
        console.log(`   - ${teacherProfiles.length} perfiles de docentes`);
        console.log(`   - ${studentProfiles.length} perfiles de estudiantes\n`);

    } catch (error) {
        console.error('Error durante el seed de PROFILES:', error);
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
        await prismaAcademic.$disconnect();
        await prismaProfiles.$disconnect();
    });
