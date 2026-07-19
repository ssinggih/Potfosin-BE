import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload, RpcException } from '@nestjs/microservices';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';

@Controller()
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  @MessagePattern('auth.register')
  async register(@Payload() dto: RegisterDto) {
    try {
      return await this.authService.register(dto);
    } catch (error) {
      throw new RpcException({ message: error.message, status: error.status || 400 });
    }
  }

  @MessagePattern('auth.login')
  async login(@Payload() dto: LoginDto) {
    try {
      return await this.authService.login(dto);
    } catch (error) {
      throw new RpcException({ message: error.message, status: error.status || 401 });
    }
  }

  @MessagePattern('auth.profile')
  async getProfile(@Payload() payload: { userId: string }) {
    try {
      return await this.authService.getProfile(payload.userId);
    } catch (error) {
      throw new RpcException({ message: error.message, status: error.status || 404 });
    }
  }
}
