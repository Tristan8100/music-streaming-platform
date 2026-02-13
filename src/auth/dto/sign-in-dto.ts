import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SignInDto {
    @ApiProperty({
        example: 'user@gmail.com',
        description: 'Email address of the user',
    })
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiProperty({
        example: 'userpassword123',
        description: 'Password of the user',
    })
    @MinLength(6)
    @IsNotEmpty()
    password: string;
}