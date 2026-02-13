import { PartialType } from '@nestjs/mapped-types';
import { IsString, IsOptional, IsArray, IsNotEmpty, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateMusicDto {
    title: string;
    artist: string;
    album?: string;
    genre?: string;
}

export class CreateAlbumDto {
    @ApiProperty({
        example: 'My Album',
        description: 'Title of the album',
    })
    @IsNotEmpty()
    @IsString()
    title: string;

    @ApiPropertyOptional({
        example: ['Pop', 'Rock'],
        description: 'Genre of the album',
    })
    @IsArray()
    @IsOptional()
    genre_album?: string[];

    @ApiPropertyOptional({
        example: 'A description of the album',
        description: 'Description of the album',
    })
    @IsString()
    @IsOptional()
    description?: string;
}

export class UpdateAlbumDto extends PartialType(CreateAlbumDto) {}

export class CreateSongsDto {
    @ApiProperty({
        example: 'My Song',
        description: 'Title of the song',
    })
    @IsNotEmpty()
    @IsString()
    name: string;

    @ApiPropertyOptional({
        example: ['Pop', 'Rock'],
        description: 'Genre of the song',
    })
    @IsArray()
    @IsOptional()
    genre_song?: string[];
}

export class UpdateSongDto extends PartialType(CreateSongsDto) {}
