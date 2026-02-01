import { Controller, Body, Post, Get, Request } from '@nestjs/common';
import { SignInDto } from './dto/sign-in-dto';
import { AuthService } from './auth.service';
import { json } from 'stream/consumers';
import { AuthGuard } from './auth.guard';
import { UseGuards } from '@nestjs/common';
import { ResetPasswordDto, SendOtpDto, VerifyEmailDto } from './dto/send-otp-dto';
import { Send } from 'express';
import { RolesGuard } from './auth.user';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@Controller('api')
export class AuthController {
    constructor(private authService: AuthService) {}

    @ApiOperation({ summary: 'User Login' })
    @Post('login')
    signIn(@Body() signInDto:SignInDto) {
       const val = this.authService.signIn(signInDto.email, signInDto.password);
       return val;
    }

    @ApiOperation({ summary: 'Protected route sample' })
    @UseGuards(AuthGuard)
    @Get('protected')
    getProtectedResource(@Request() req) {
        return { message: 'This is a protected resource', user: req.user };
    }

    @ApiOperation({ summary: 'User Registration' })
    @Post('register')
    register(@Body() registerDto) {
        const val = this.authService.register(registerDto);
        return val;
    }

    @ApiOperation({ summary: 'Send OTP for email verification' })
    @Post('send-otp')
    sendOtp(@Body() data : SendOtpDto) {
        const val = this.authService.sendOtp(data);
        return val;
    }

    @ApiOperation({ summary: 'Verify OTP for email verification' })
    @Post('verify-otp')
    verifyEmail(@Body() data : VerifyEmailDto) {
        const val = this.authService.verifyEmail(data.email, data.otp);
        return val;
    }

    @ApiOperation({ summary: 'Send OTP for password reset' })
    @Post('forgot-password')
    resetLink(@Body() data : SendOtpDto) {
        const val = this.authService.resetLink(data);
        return val;
    }

    @ApiOperation({ summary: 'Verify OTP for password reset' })
    @Post('forgot-password-token')
    verifyResetCode(@Body() data : VerifyEmailDto) {
        const val = this.authService.verifyResetCode(data);
        return val;
    }

    @ApiOperation({ summary: 'Reset Password' })
    @Post('reset-password')
    resetPassword(@Body() data : ResetPasswordDto) {
        const val = this.authService.resetPassword(data);
        return val;
    }

    @ApiOperation({ summary: 'Get user details, Next js layout.tsx' })
    @UseGuards(AuthGuard, RolesGuard) // for roles
    @Get('verify-user')
    setUser(@Request() req) {
        return this.authService.user(req.user);
    }
}
