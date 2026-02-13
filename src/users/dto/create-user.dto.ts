import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    example: 'user@gmail',
    description: 'Email address of the user',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'user',
    description: 'Name of the user',
  })
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'userpassword123',
    description: 'Password of the user',
  })
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}
