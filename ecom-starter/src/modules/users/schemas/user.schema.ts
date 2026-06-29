import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

export enum UserRole {
  CUSTOMER = 'customer',
  ADMIN = 'admin',
}

/**
 * User account.
 *
 * Conventions match the rest of the app: timestamps + soft delete, and a
 * `toJSON` transform that exposes `id`, drops `__v`, and NEVER leaks the
 * password hash.
 */
@Schema({
  collection: 'users',
  timestamps: true,
  toJSON: {
    virtuals: true,
    versionKey: false,
    transform: (_doc, ret: Record<string, any>) => {
      ret.id = ret._id?.toString();
      delete ret._id;
      delete ret.passwordHash;
      return ret;
    },
  },
})
export class User {
  @Prop({ required: true, trim: true, lowercase: true, unique: true, index: true })
  email: string;

  @Prop({ required: true })
  passwordHash: string;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({
    type: String,
    enum: Object.values(UserRole),
    default: UserRole.CUSTOMER,
    index: true,
  })
  role: UserRole;

  @Prop({ type: Date, default: null, index: true })
  deletedAt: Date | null;
}

export const UserSchema = SchemaFactory.createForClass(User);
