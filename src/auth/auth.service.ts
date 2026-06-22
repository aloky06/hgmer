import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as nodemailer from 'nodemailer';

@Injectable()
export class AuthService {
  private otpStore = new Map<string, { otp: string; expires: number }>();
  private transporter: nodemailer.Transporter;

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService
  ) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }

  async getUserById(id: number) {
    const user = await this.usersService.findById(id);
    if (user) {
      const { passwordHash, ...result } = user;
      return result;
    }
    return null;
  }

  async updatePushToken(userId: number, token: string) {
    return this.usersService.update(userId, { pushToken: token });
  }

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findOne(email);
    if (user && await bcrypt.compare(pass, user.passwordHash)) {
      const { passwordHash, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async register(data: any) {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = await this.usersService.create({
      email: data.email,
      passwordHash: hashedPassword,
      name: data.name,
      phone: data.phone,
      role: data.role || 'CUSTOMER'
    });
    
    return this.login(user);
  }

  async sendOtp(email: string) {
    // Generate a 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store in memory with 5 minutes expiration
    this.otpStore.set(email, {
      otp,
      expires: Date.now() + 5 * 60 * 1000,
    });

    const mailOptions = {
      from: process.env.SMTP_EMAIL,
      to: email,
      subject: 'Your HGM Login OTP',
      text: `Your OTP for login is: ${otp}. It is valid for 5 minutes.`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #ff9933;">HGM Login Verification</h2>
          <p>Your One-Time Password (OTP) for login is:</p>
          <h1 style="background: #f4f4f4; padding: 10px; display: inline-block; letter-spacing: 2px;">${otp}</h1>
          <p>This OTP is valid for 5 minutes. Please do not share this with anyone.</p>
        </div>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`OTP sent to ${email}: ${otp}`); // For debugging
      return { message: 'OTP sent successfully' };
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error('Failed to send OTP');
    }
  }

  async verifyOtp(email: string, otp: string) {
    const record = this.otpStore.get(email);
    
    if (!record) {
      throw new UnauthorizedException('OTP not requested or expired');
    }
    
    if (Date.now() > record.expires) {
      this.otpStore.delete(email);
      throw new UnauthorizedException('OTP expired');
    }
    
    if (record.otp !== otp) {
      throw new UnauthorizedException('Invalid OTP');
    }

    // OTP is valid, clear it
    this.otpStore.delete(email);

    // Find or create user
    let user = await this.usersService.findOne(email);
    
    if (!user) {
      // Create user if they don't exist
      user = await this.usersService.create({
        email: email,
        passwordHash: await bcrypt.hash(Math.random().toString(36), 10), // Random password since they login via OTP
        name: email.split('@')[0], // Default name
        role: 'CUSTOMER',
      });
    }

    return this.login(user);
  }
}
