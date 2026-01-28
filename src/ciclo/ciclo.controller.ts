import { Controller, Get, Post, Body, Patch, Param, Delete,HttpCode,HttpStatus,ParseIntPipe, Query} from '@nestjs/common';
import { CicloService} from './ciclo.service';
import { CreateCicloDto } from './dto/create-ciclo.dto';
import { UpdateCicloDto } from './dto/update-ciclo.dto';

@Controller('ciclo')
export class CicloController {
  constructor(private readonly cicloService: CicloService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createCicloDto: CreateCicloDto) {
    return this.cicloService.create(createCicloDto);
  }

  @Get()
  findAll(
    @Query ('page') page?:1,
    @Query ('limit') limit?:10,
  ) {
    return this.cicloService.findAll(page? +page:1, limit? +limit:10);
  }

 @Get(':id')
findOne(@Param('id', ParseIntPipe) id: number) {
  return this.cicloService.findOne(id);
}
  @Patch(':id')
  update(@Param('id',ParseIntPipe) id: string, @Body() updateCicloDto: UpdateCicloDto) {
    return this.cicloService.update(+id, updateCicloDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.cicloService.remove(+id);
  }
}
