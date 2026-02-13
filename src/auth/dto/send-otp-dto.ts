import { IsEmail, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendOtpDto{
    @ApiProperty({
        example: 'user@gmail.com',
        description: 'Email address of the user',
      })
    @IsEmail()
    email: string;
}

export class VerifyEmailDto{
    @ApiProperty({
        example: 'user@gmail.com',
        description: 'Email address of the user',
    })
    @IsEmail()
    email: string;

    @ApiProperty({
        example: '123456',
        description: 'OTP code sent to the user',
    })
    @IsString()
    @Length(6, 6)
    otp: string;
}

export class VetifyCodeDto{
    @ApiProperty({
        example: 'user@gmail.com',
        description: 'Email address of the user',
    })
    @IsEmail()
    email: string;

    @ApiProperty({
        example: '123456',
        description: 'OTP code sent to the user',
    })
    @IsString()
    @Length(6, 6)
    otp: string; //changed
}

export class ResetPasswordDto{
    @ApiProperty({
        example: 'user@gmail.com',
        description: 'Email address of the user',
    })
    @IsEmail()
    email: string;

    @ApiProperty({
        example: '123456',
        description: 'OTP code sent to the user',
    })
    @IsString()
    token: string;

    @ApiProperty({
        example: 'userpassword123',
        description: 'New password for the user',
    })
    @IsString()
    @Length(8, 32)
    password: string;
}