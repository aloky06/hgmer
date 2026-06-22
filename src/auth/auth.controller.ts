import { Controller, Post, Get, Patch, Body, UnauthorizedException, HttpCode, HttpStatus, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() body: any) {
    return this.authService.register(body);
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() body: any) {
    const user = await this.authService.validateUser(body.email, body.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.authService.login(user);
  }

  @Post('send-otp')
  async sendOtp(@Body('email') email: string) {
    return this.authService.sendOtp(email);
  }

  @HttpCode(HttpStatus.OK)
  @Post('verify-otp')
  async verifyOtp(@Body('email') email: string, @Body('otp') otp: string) {
    return this.authService.verifyOtp(email, otp);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  async getProfile(@Request() req) {
    // req.user is populated by JwtStrategy (usually contains userId, email, role)
    // We can fetch fresh details from DB if needed, but the JWT payload is usually enough
    // if role is included. Let's fetch the latest from DB just in case.
    return this.authService.getUserById(req.user.userId || req.user.id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('push-token')
  async updatePushToken(@Request() req, @Body('token') token: string) {
    return this.authService.updatePushToken(req.user.userId || req.user.id, token);
  }
}
