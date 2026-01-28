import { Controller, Get, Post, Body, Patch, Param, Delete,HttpCode,HttpStatus, ParseIntPipe,Query } from '@nestjs/common';
import { EspecialidadService } from './especialidad.service';
import { CreateEspecialidadDto } from './dto/create-especialidad.dto';
import { UpdateEspecialidadDto } from './dto/update-especialidad.dto';

@Controller('especialidad')
export class EspecialidadController {
  constructor(private readonly especialidadService: EspecialidadService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createEspecialidadDto: CreateEspecialidadDto) {
    return this.especialidadService.create(createEspecialidadDto);
  }

  @Get()
  findAll(
    @Query ('page') page?:1,
    @Query ('limit') limit?:10,
  ) {
    return this.especialidadService.findAll(page? +page:1, limit? +limit:10);
  }

  @Get(':id')
findOne(@Param('id', ParseIntPipe) id: number) {
  return this.especialidadService.findOne(id);
}

  @Patch(':id')
  update(@Param('id',ParseIntPipe) id: number, @Body() updateEspecialidadDto: UpdateEspecialidadDto) {
    return this.especialidadService.update(+id, updateEspecialidadDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: number) {
    return this.especialidadService.remove(+id);
  }
}
