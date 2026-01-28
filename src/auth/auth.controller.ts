import { 
  Controller, 
  Post, 
  Body, 
  Get, 
  UseGuards, 
  Request 
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateLoginDto } from 'src/login/dto/create-login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: CreateLoginDto) {
    return this.authService.login(loginDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return {
      message: 'Perfil del usuario autenticado',
      user: req.user,
    };
  }
}
