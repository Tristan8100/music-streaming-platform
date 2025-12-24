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

  @Prop({ type: Types.ObjectId, ref: 'Album', required: true })
  album_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user_id: Types.ObjectId; //for faster access

  @Prop({ type: [String], default: [] })
  genre_song: string[];

  @Prop({type: Number, default: 0 })
  plays: number;

  @Prop({ type: Number, default: 0 })
  likes_count: number;

  @Prop({ required: true })
  song_local_path: string;

  @Prop({ required: true })
  song_url: string;

  //@Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  //likes: Types.ObjectId[];
}

export const SongSchema = SchemaFactory.createForClass(Song);


export type LikeDocument = HydratedDocument<Like>
@Schema({ 
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
})
export class Like {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Song', required: true })
  song_id: Types.ObjectId;
}

export const LikeSchema = SchemaFactory.createForClass(Like);

LikeSchema.index({ user_id: 1, song_id: 1 }, { unique: true });
