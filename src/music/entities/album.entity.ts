import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Song, SongSchema } from './song.entity';

export type AlbumDocument = HydratedDocument<Album>;

@Schema({ 
  collection: 'albums',
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
})
export class Album {
  @Prop({ required: true })
  title: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  owner: Types.ObjectId;

  @Prop({ type: [SongSchema], default: [] }) // arrays of songs, whole object
  songs: Song[];

  @Prop({ type: [String], default: [] })
  genre_album: [];

  @Prop()
  photo_url?: string;

  @Prop()
  description?: string;
}

export const AlbumSchema = SchemaFactory.createForClass(Album);
AlbumSchema.index({ owner: 1 });
AlbumSchema.index({ title: 1 });