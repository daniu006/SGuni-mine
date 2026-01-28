import 'dotenv/config';
import { PrismaClient as PrismaAcademicClient } from '@prisma/client-academic';

const prismaAcademic = new PrismaAcademicClient();

async function main() {
    console.log('Iniciando seed de la base de datos ACADEMIC...\n');

    try {
        // Crear especialidades
        const especialidades = await Promise.all([
            prismaAcademic.speciality.upsert({
                where: { name: 'Matemáticas' },
                update: {},
                create: {
                    name: 'Matemáticas',
                    description: 'Especialidad en matemáticas y álgebra'
                }
            }),
            prismaAcademic.speciality.upsert({
                where: { name: 'Programación' },
                update: {},
                create: {
                    name: 'Programación',
                    description: 'Especialidad en desarrollo de software'
                }
            }),
            prismaAcademic.speciality.upsert({
                where: { name: 'Bases de Datos' },
                update: {},
                create: {
                    name: 'Bases de Datos',
                    description: 'Especialidad en gestión de bases de datos'
                }
            })
        ]);

        console.log('Especialidades creadas');

        // Crear carreras
        const carreras = await Promise.all([
            prismaAcademic.career.upsert({
                where: { name: 'Ingeniería en Sistemas' },
                update: {},
                create: {
                    name: 'Ingeniería en Sistemas',
                    totalCicles: 10,
                    durationYears: 5
                }
            }),
            prismaAcademic.career.upsert({
                where: { name: 'Ingeniería Industrial' },
                update: {},
                create: {
                    name: 'Ingeniería Industrial',
                    totalCicles: 10,
                    durationYears: 5
                }
            })
        ]);

        console.log('Carreras creadas');

        // Crear ciclos
        const ciclos = await Promise.all([
            prismaAcademic.cycle.upsert({
                where: { year_period: { year: 2025, period: 1 } },
                update: {},
                create: {
                    name: 'Ciclo 2025-I',
                    year: 2025,
                    period: 1,
                    startDate: new Date('2025-01-15'),
                    endDate: new Date('2025-06-30'),
                    isActive: true
                }
            }),
            prismaAcademic.cycle.upsert({
                where: { year_period: { year: 2025, period: 2 } },
                update: {},
                create: {
                    name: 'Ciclo 2025-II',
                    year: 2025,
                    period: 2,
                    startDate: new Date('2025-07-15'),
                    endDate: new Date('2025-12-20'),
                    isActive: false
                }
            })
        ]);

        console.log('Ciclos creados');

        // Crear materias
        const materias = await Promise.all([
            prismaAcademic.subject.upsert({
                where: {
                    careerId_cicleNumber_name: {
                        careerId: carreras[0].id,
                        cicleNumber: 1,
                        name: 'Cálculo I'
                    }
                },
                update: {},
                create: {
                    name: 'Cálculo I',
                    careerId: carreras[0].id,
                    cicleNumber: 1,
                    cycleId: ciclos[0].id
                }
            }),
            prismaAcademic.subject.upsert({
                where: {
                    careerId_cicleNumber_name: {
                        careerId: carreras[0].id,
                        cicleNumber: 1,
                        name: 'Programación I'
                    }
                },
                update: {},
                create: {
                    name: 'Programación I',
                    careerId: carreras[0].id,
                    cicleNumber: 1,
                    cycleId: ciclos[0].id
                }
            }),
            prismaAcademic.subject.upsert({
                where: {
                    careerId_cicleNumber_name: {
                        careerId: carreras[0].id,
                        cicleNumber: 2,
                        name: 'Bases de Datos'
                    }
                },
                update: {},
                create: {
                    name: 'Bases de Datos',
                    careerId: carreras[0].id,
                    cicleNumber: 2,
                    cycleId: ciclos[0].id
                }
            })
        ]);

        console.log('Materias creadas');

        console.log('\nSeed de ACADEMIC completado exitosamente!\n');
        console.log('Resumen:');
        console.log(`   - ${especialidades.length} especialidades`);
        console.log(`   - ${carreras.length} carreras`);
        console.log(`   - ${ciclos.length} ciclos`);
        console.log(`   - ${materias.length} materias\n`);

    } catch (error) {
        console.error('Error durante el seed de ACADEMIC:', error);
        throw error;
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prismaAcademic.$disconnect();
    });
