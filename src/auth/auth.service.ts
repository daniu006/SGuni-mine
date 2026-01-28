import { Injectable, BadRequestException, UnauthorizedException, InternalServerErrorException, ConflictException, } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcryptjs";
import { ConfigService } from "@nestjs/config";
import { PrismaUsersService } from "src/prisma/PrismaUsersService";
import { PrismaProfilesService } from "src/prisma/PrismaProfilesService";

interface JwtPayload {
	id: number;
	role: string;
}

interface LoginDto {
	email: string;
	password: string;
}

interface RefreshDto {
	refreshToken: string;
}

interface RegisterTeacherDto {
  name: string;
  email: string;
  password: string;
  phone?: string;
  age?: number;
  specialityId: number;
  careerId: number;
  employmentType?: string;
}

interface RegisterStudentDto {
	name: string;
	email: string;
	password: string;
	phone?: string;
	age?: number;
	careerId: number;
	currentCicle: number;
}

@Injectable()
export class AuthService {
	constructor(private readonly prismaUsers: PrismaUsersService, private readonly prismaProfiles: PrismaProfilesService, private readonly jwtService: JwtService, private readonly configService: ConfigService,
	) { }

	async registerStudent(registerStudentDto: RegisterStudentDto) {
		try {
			// Verificar si el email ya existe
			const existingUser = await this.prismaUsers.user.findFirst({
				where: { email: registerStudentDto.email },
			});

			if (existingUser) {
				throw new ConflictException("Email already registered");
			}

			// Hash de la contraseña
			const hashedPassword = bcrypt.hashSync(registerStudentDto.password, 10);

			// Crear usuario en la base de datos USERS
			const user = await this.prismaUsers.user.create({
				data: {
					name: registerStudentDto.name,
					email: registerStudentDto.email,
					password: hashedPassword,
					phone: registerStudentDto.phone,
					age: registerStudentDto.age,
					roleId: 3, // 3 = STUDENT
				},
				include: {
					role: true,
				},
			});

			// Crear UserReference y StudentProfile en la base de datos PROFILES
			await this.prismaProfiles.userReference.create({
				data: {
					id: user.id,
					name: user.name,
					email: user.email,
					roleId: user.roleId,
					status: "active",
					studentProfile: {
						create: {
							careerId: registerStudentDto.careerId,
							currentCicle: registerStudentDto.currentCicle,
						},
					},
				},
			});

			// Remover password de la respuesta
			const { password, ...userWithoutPassword } = user;
			return userWithoutPassword;
		} catch (error) {
			this.handleDBErrors(error);
		}
	}


	async registerTeacher(registerTeacherDto: RegisterTeacherDto) {
		try {
			// Verificar si el email ya existe
			const existingUser = await this.prismaUsers.user.findFirst({
				where: { email: registerTeacherDto.email },
			});

			if (existingUser) {
				throw new ConflictException("Email already registered");
			}

			// Hash de la contraseña
			const hashedPassword = bcrypt.hashSync(registerTeacherDto.password, 10);

			// Crear usuario en la base de datos USERS
			const user = await this.prismaUsers.user.create({
				data: {
					name: registerTeacherDto.name,
					email: registerTeacherDto.email,
					password: hashedPassword,
					phone: registerTeacherDto.phone,
					age: registerTeacherDto.age,
					roleId: 2, // 2 = TEACHER
				},
				include: {
					role: true,
				},
			});

			// Crear UserReference y TeacherProfile en la base de datos PROFILES
			await this.prismaProfiles.userReference.create({
				data: {
					id: user.id,
					name: user.name,
					email: user.email,
					roleId: user.roleId,
					status: "active",
					teacherProfile: {
						create: {
							specialityId: registerTeacherDto.specialityId,
							careerId: registerTeacherDto.careerId,
							employmentType: 'FULL_TIME',
						},
					},
				},
			});

			// Remover password de la respuesta
			const { password, ...userWithoutPassword } = user;
			return userWithoutPassword;
		} catch (error) {
			this.handleDBErrors(error);
		}
	}


	async login(loginDto: LoginDto) {
		const { password, email } = loginDto;

		// Buscar usuario en la base de datos USERS
		const user = await this.prismaUsers.user.findFirst({
			where: { email },
			include: {
				role: true,
			},
		});

		if (!user) {
			throw new UnauthorizedException("Credentials are not valid");
		}

		// Verificar contraseña
		if (!bcrypt.compareSync(password, user.password)) {
			throw new UnauthorizedException("Credentials are not valid");
		}

		const roleName = user.role.name;

		// Generar tokens
		const accessToken = this.getJwtToken(
			{ id: user.id, role: roleName },
			{ expiresIn: "2d" },
		);
		const refreshToken = this.getJwtToken(
			{ id: user.id, role: roleName },
			{ expiresIn: "7d" }
		);

		return {
			userId: user.id,
			roleName,
			accessToken,
			refreshToken,
		};
	}
	private getJwtToken(payload: JwtPayload, options?: { expiresIn: string }) {
		const signOptions = {
			secret: this.configService.get<string>("JWT_SECRET"),
			expiresIn: options?.expiresIn || "2d",
		};
		const token = this.jwtService.sign(payload, signOptions as any);
		return token;
	}

	async refreshToken(refreshDto: RefreshDto) {
		try {
			const payload = this.jwtService.verify(refreshDto.refreshToken, {
				secret: this.configService.get<string>("JWT_SECRET"),
			});

			const user = await this.prismaUsers.user.findFirst({
				where: { id: payload.id },
				include: {
					role: true,
				},
			});

			if (!user) {
				throw new UnauthorizedException("Invalid refresh token");
			}

			const roleName = user.role.name;

			const accessToken = this.getJwtToken(
				{ id: user.id, role: roleName },
				{ expiresIn: "2d" },
			);
			const refreshToken = this.getJwtToken(
				{ id: user.id, role: roleName },
				{ expiresIn: "7d" },
			);

			return {
				id: user.id,
				email: user.email,
				accessToken,
				refreshToken,
			};
		} catch (error) {
			throw error;
		}
	}

	private handleDBErrors(error): never {
		if (error.code === "23505") {
			throw new BadRequestException(error.detail);
		}

		console.log(error);

		throw new InternalServerErrorException("Please check server logs");
	}
}