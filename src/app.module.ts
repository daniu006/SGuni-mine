import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { LoginModule } from './login/login.module';
import { CarreraModule } from './carrera/carrera.module';
import { CicloModule } from './ciclo/ciclo.module';
import { EspecialidadModule } from './especialidad/especialidad.module';
import { DocenteModule } from './docente/docente.module';
import { EstudianteModule } from './estudiante/estudiante.module';
import { MateriasModule } from './materias/materias.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    LoginModule,
    CarreraModule,
    CicloModule,
    EspecialidadModule,
    DocenteModule,
    EstudianteModule,
    MateriasModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
