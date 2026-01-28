import { Module } from '@nestjs/common';
import { EspecialidadService } from './especialidad.service';
import { EspecialidadController } from './especialidad.controller';
import { PrismaModule } from 'src/prisma/prisma.module';


@Module({
  imports: [PrismaModule],
  controllers: [EspecialidadController],
  providers: [EspecialidadService],
  exports: [EspecialidadService]
})
export class EspecialidadModule {}

