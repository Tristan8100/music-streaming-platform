import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type SongDocument = HydratedDocument<Song>;

@Schema({ 
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
})
export class Song {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  music_url: string;

  @Prop({ type: Types.ObjectId, ref: 'Album', required: true })
  album_id: Types.ObjectId;

  @Prop({ type: [String], default: [] })
  genre_song: [];

  @Prop()
  photo_local_path?: string;

  @Prop()
  photo_url?: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  likes: Types.ObjectId[];
}

export const SongSchema = SchemaFactory.createForClass(Song);