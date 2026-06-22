import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector, private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    const { user } = request;
    
    if (!user) return false;

    let actualRole = user.role;
    try {
      const dbUser = await this.prisma.user.findUnique({
        where: { id: user.userId || user.id }
      });
      if (dbUser) {
        actualRole = dbUser.role;
      }
    } catch (err) {
      console.error('[RolesGuard] Error fetching user role from DB:', err);
    }

    console.log(`[RolesGuard] Checking roles for user:`, user?.email, `Latest Role:`, actualRole);
    console.log(`[RolesGuard] Required roles:`, requiredRoles);
    
    const hasRole = requiredRoles.some((role) => actualRole === role);
    console.log(`[RolesGuard] Access granted?`, hasRole);
    
    // Attach fresh role to request for later use
    if (user) user.role = actualRole;

    return hasRole;
  }
}
