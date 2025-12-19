import { PartialType } from '@nestjs/mapped-types';
import { IsString, IsOptional, IsArray, IsNotEmpty, IsNumber } from 'class-validator';

export class CreateMusicDto {
    title: string;
    artist: string;
    album?: string;
    genre?: string;
}

export class CreateAlbumDto {
    @IsNotEmpty()
    @IsString()
    title: string;

    @IsOptional()
    genre_album?: string[];

    @IsOptional()
    description?: string;
}

export class UpdateAlbumDto extends PartialType(CreateAlbumDto) {}
