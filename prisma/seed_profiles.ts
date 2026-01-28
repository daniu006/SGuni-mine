import 'dotenv/config';
import { PrismaClient as PrismaUsersClient } from '@prisma/client-users';
import { PrismaClient as PrismaAcademicClient } from '@prisma/client-academic';
import { PrismaClient as PrismaProfilesClient } from '@prisma/client-profiles';

const prismaUsers = new PrismaUsersClient();
const prismaAcademic = new PrismaAcademicClient();
const prismaProfiles = new PrismaProfilesClient();

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
        const materias = await prismaAcademic.subject.findMany();
        const ciclos = await prismaAcademic.cycle.findMany();

        // Sincronizar referencias de usuarios
        console.log('Sincronizando referencias de usuarios...');
        await Promise.all(
            users.map(user =>
                prismaProfiles.userReference.upsert({
                    where: { id: user.id },
                    update: { name: user.name, email: user.email, roleId: user.roleId, status: user.status },
                    create: {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        roleId: user.roleId,
                        status: user.status
                    }
                })
            )
        );

        console.log('Referencias de usuarios sincronizadas');

        // Sincronizar referencias de especialidades
        console.log('Sincronizando referencias de especialidades...');
        await Promise.all(
            especialidades.map(esp =>
                prismaProfiles.specialityReference.upsert({
                    where: { id: esp.id },
                    update: { name: esp.name },
                    create: { id: esp.id, name: esp.name }
                })
            )
        );

        console.log('Referencias de especialidades sincronizadas');

        // Sincronizar referencias de carreras
        console.log('Sincronizando referencias de carreras...');
        await Promise.all(
            carreras.map(car =>
                prismaProfiles.careerReference.upsert({
                    where: { id: car.id },
                    update: { name: car.name, totalCicles: car.totalCicles },
                    create: { id: car.id, name: car.name, totalCicles: car.totalCicles }
                })
            )
        );

        console.log('Referencias de carreras sincronizadas');

        // Sincronizar referencias de materias
        console.log('Sincronizando referencias de materias...');
        await Promise.all(
            materias.map(mat =>
                prismaProfiles.subjectReference.upsert({
                    where: { id: mat.id },
                    update: { name: mat.name, careerId: mat.careerId, cicleNumber: mat.cicleNumber },
                    create: {
                        id: mat.id,
                        name: mat.name,
                        careerId: mat.careerId,
                        cicleNumber: mat.cicleNumber
                    }
                })
            )
        );

        console.log('Referencias de materias sincronizadas');

        // Sincronizar referencias de ciclos
        console.log('Sincronizando referencias de ciclos...');
        await Promise.all(
            ciclos.map(ciclo =>
                prismaProfiles.cycleReference.upsert({
                    where: { id: ciclo.id },
                    update: { name: ciclo.name, year: ciclo.year, period: ciclo.period },
                    create: {
                        id: ciclo.id,
                        name: ciclo.name,
                        year: ciclo.year,
                        period: ciclo.period
                    }
                })
            )
        );

        console.log('Referencias de ciclos sincronizadas');

        // Crear perfiles de docentes
        console.log('Creando perfiles de docentes...');
        const teachers = users.filter(u => u.role.name === 'TEACHER');

        const teacherProfiles = await Promise.all([
            prismaProfiles.teacherProfile.upsert({
                where: { userId: teachers[0].id },
                update: {},
                create: {
                    userId: teachers[0].id,
                    specialityId: especialidades[0].id,
                    careerId: carreras[0].id,
                    employmentType: 'FULL_TIME'
                }
            }),
            prismaProfiles.teacherProfile.upsert({
                where: { userId: teachers[1].id },
                update: {},
                create: {
                    userId: teachers[1].id,
                    specialityId: especialidades[1].id,
                    careerId: carreras[0].id,
                    employmentType: 'PART_TIME'
                }
            })
        ]);

        console.log('Perfiles de docentes creados');

        // Asignar materias a docentes
        console.log('Asignando materias a docentes...');
        await Promise.all([
            prismaProfiles.subjectAssignment.upsert({
                where: {
                    teacherProfileId_subjectId: {
                        teacherProfileId: teacherProfiles[0].id,
                        subjectId: materias[0].id
                    }
                },
                update: {},
                create: {
                    teacherProfileId: teacherProfiles[0].id,
                    subjectId: materias[0].id
                }
            }),
            prismaProfiles.subjectAssignment.upsert({
                where: {
                    teacherProfileId_subjectId: {
                        teacherProfileId: teacherProfiles[1].id,
                        subjectId: materias[1].id
                    }
                },
                update: {},
                create: {
                    teacherProfileId: teacherProfiles[1].id,
                    subjectId: materias[1].id
                }
            })
        ]);

        console.log('Materias asignadas a docentes');

        // Crear perfiles de estudiantes
        console.log('Creando perfiles de estudiantes...');
        const students = users.filter(u => u.role.name === 'STUDENT');

        const studentProfiles = await Promise.all([
            prismaProfiles.studentProfile.upsert({
                where: { userId: students[0].id },
                update: {},
                create: {
                    userId: students[0].id,
                    careerId: carreras[0].id,
                    currentCicle: 1
                }
            }),
            prismaProfiles.studentProfile.upsert({
                where: { userId: students[1].id },
                update: {},
                create: {
                    userId: students[1].id,
                    careerId: carreras[0].id,
                    currentCicle: 1
                }
            })
        ]);

        console.log('Perfiles de estudiantes creados');

        // Inscribir estudiantes en materias
        console.log('Inscribiendo estudiantes en materias...');
        await Promise.all([
            prismaProfiles.studentSubject.upsert({
                where: {
                    studentProfileId_subjectId: {
                        studentProfileId: studentProfiles[0].id,
                        subjectId: materias[0].id
                    }
                },
                update: {},
                create: {
                    studentProfileId: studentProfiles[0].id,
                    subjectId: materias[0].id,
                    cycleId: ciclos[0].id,
                    status: 'enrolled'
                }
            }),
            prismaProfiles.studentSubject.upsert({
                where: {
                    studentProfileId_subjectId: {
                        studentProfileId: studentProfiles[0].id,
                        subjectId: materias[1].id
                    }
                },
                update: {},
                create: {
                    studentProfileId: studentProfiles[0].id,
                    subjectId: materias[1].id,
                    cycleId: ciclos[0].id,
                    status: 'enrolled'
                }
            }),
            prismaProfiles.studentSubject.upsert({
                where: {
                    studentProfileId_subjectId: {
                        studentProfileId: studentProfiles[1].id,
                        subjectId: materias[0].id
                    }
                },
                update: {},
                create: {
                    studentProfileId: studentProfiles[1].id,
                    subjectId: materias[0].id,
                    cycleId: ciclos[0].id,
                    grade: 85.50,
                    status: 'completed'
                }
            })
        ]);

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
