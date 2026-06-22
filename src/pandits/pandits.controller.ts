import { Controller, Post, Get, Put, Body, Param, UseGuards, Request, Query } from '@nestjs/common';
import { PanditsService } from './pandits.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Status } from '@prisma/client';

@Controller('pandits')
export class PanditsController {
  constructor(private readonly panditsService: PanditsService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post('register')
  register(@Request() req, @Body() body: any) {
    return this.panditsService.register(req.user.userId, body);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  @Get('pending')
  getPending() {
    return this.panditsService.getPending();
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  @Get('all')
  getAllAdmin() {
    return this.panditsService.getAllAdmin();
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  @Put(':id/status')
  updateStatus(@Param('id') id: string, @Body('status') status: Status) {
    return this.panditsService.updateStatus(+id, status);
  }

  @Get('approved')
  getApproved(@Query('city') city?: string) {
    return this.panditsService.getApproved(city);
  }

  @Get('profile/:id')
  getById(@Param('id') id: string) {
    return this.panditsService.getById(+id);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  @Put(':id/profile')
  updateProfile(@Param('id') id: string, @Body() data: any) {
    return this.panditsService.updateProfile(+id, data);
  }
}
