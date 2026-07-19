import {
  Injectable,
  Logger,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { DatabaseService } from '@database/database.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly db: DatabaseService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.db.query(
      'SELECT id FROM users WHERE email = $1',
      [dto.email],
    );

    if (existing.rows.length > 0) {
      throw new ConflictException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const result = await this.db.query(
      `INSERT INTO users (email, name, password, role)
       VALUES ($1, $2, $3, 'user')
       RETURNING id, email, name, role, created_at`,
      [dto.email, dto.name, hashedPassword],
    );

    const user = result.rows[0];
    const token = this.generateToken(user);

    this.logger.log(`User registered: ${user.email} (${user.role})`);

    return { user, accessToken: token };
  }

  async login(dto: LoginDto) {
    const result = await this.db.query(
      'SELECT * FROM users WHERE email = $1',
      [dto.email],
    );

    const user = result.rows[0];
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isValid = await bcrypt.compare(dto.password, user.password);
    if (!isValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const token = this.generateToken(user);
    const { password, refresh_token, ...safeUser } = user;

    this.logger.log(`User logged in: ${user.email}`);

    return { user: safeUser, accessToken: token };
  }

  async getProfile(userId: string) {
    const result = await this.db.query(
      'SELECT id, email, name, role, created_at, updated_at FROM users WHERE id = $1',
      [userId],
    );

    const user = result.rows[0];
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  private generateToken(user: any): string {
    return this.jwtService.sign({
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });
  }
}
