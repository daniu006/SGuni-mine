import { Global, Module } from '@nestjs/common';
import { PrismaUsersService } from './PrismaUsersService';
import { PrismaProfilesService } from './PrismaProfilesService';
import { PrismaAcademicService } from './PrismaAcademicService';

@Global()
@Module({
  providers: [PrismaUsersService, PrismaProfilesService, PrismaAcademicService], 
  exports: [PrismaUsersService, PrismaProfilesService, PrismaAcademicService],   
})
export class PrismaModule { }