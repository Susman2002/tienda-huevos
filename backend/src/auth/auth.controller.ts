import {
  Controller,
  Post,
  Get,
  UseGuards,
  Body,
  UnauthorizedException,
} from '@nestjs/common'
import { AuthService } from './auth.service'
import { LocalAuthGuard } from './guards/local-auth.guard'
import { JwtAuthGuard } from './guards/jwt-auth.guard'
import { CurrentUser } from './decorators/current-user.decorator'
import { LoginDto } from './dto/login.dto'
import axios from 'axios'

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto & { turnstileToken: string }) {
    // 1. Verificar Turnstile
    const turnstileRes = await axios.post(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      new URLSearchParams({
        secret: process.env.TURNSTILE_SECRET_KEY ?? '',
        response: loginDto.turnstileToken ?? '',
      }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
    )

    if (!turnstileRes.data.success) {
      throw new UnauthorizedException('Verificación CAPTCHA fallida')
    }

    // 2. Validar credenciales manualmente (sin LocalAuthGuard para poder leer el body primero)
    const user = await this.authService.validateUser(
      loginDto.email,
      loginDto.password,
    )

    if (!user) {
      throw new UnauthorizedException('Credenciales incorrectas')
    }

    return this.authService.login(user)
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMe(@CurrentUser() user: any) {
    return user
  }
}