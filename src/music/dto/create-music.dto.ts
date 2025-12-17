export class CreateMusicDto {
    title: string;
    artist: string;
    album?: string;
    genre?: string;
}

export class CreateAlbumDto {
    title: string;
    genre_album?: string[];
    description?: string;
}
