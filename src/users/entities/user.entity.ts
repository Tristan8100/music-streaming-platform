import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({
  collection: 'users',
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
})
export class User {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  password: string;

  @Prop({ type: Date, default: null })
  email_verified_at: Date | null;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  follows: Types.ObjectId[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  followers: Types.ObjectId[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  members: Types.ObjectId[];

  @Prop()
  photo_local_path?: string; //CHANGED FOR SUPABASE

  @Prop()
  photo_url?: string;

  @Prop({ type: [String], default: [] })
  genre_artist: [];

  @Prop()
  bio?: string;

  @Prop({ default: true })
  isActive: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Indexes
//UserSchema.index({ email: 1 }); //not needed since email is unique probably idk
UserSchema.index({ follows: 1 });
UserSchema.index({ followers: 1 });