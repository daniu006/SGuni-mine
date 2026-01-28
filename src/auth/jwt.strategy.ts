import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaUsersService } from 'src/prisma/PrismaUsersService';

interface JwtPayload {
  id: number;     // user id
  role: string;   // role name
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private prismaUsers: PrismaUsersService,
  ) {
    const jwtSecret = configService.get<string>('JWT_SECRET');
    
    if (!jwtSecret) {
      throw new Error('JWT_SECRET no está definido en las variables de entorno');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
  }

  async validate(payload: JwtPayload) {
    // Validar que el payload tiene la estructura esperada
    if (!payload.id) {
      throw new UnauthorizedException('Token inválido: falta identificador de usuario');
    }

    // Buscar el usuario en la base de datos USERS
    const user = await this.prismaUsers.user.findUnique({
      where: { id: payload.id },
      include: {
        role: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Token inválido: usuario no encontrado');
    }

    // Remover contraseña del objeto antes de retornar
    const { password, ...userWithoutPassword } = user;

    // Este objeto será adjuntado a req.user en los controladores
    return userWithoutPassword;
  }
}