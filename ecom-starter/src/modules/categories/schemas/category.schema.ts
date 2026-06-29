import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type CategoryDocument = HydratedDocument<Category>;

@Schema({
  collection: 'categories',
  timestamps: true,
  toJSON: {
    virtuals: true,
    versionKey: false,
    transform: (_doc, ret: Record<string, any>) => {
      ret.id = ret._id?.toString();
      delete ret._id;
      return ret;
    },
  },
})
export class Category {
  @Prop({ required: true, trim: true, unique: true, index: true })
  name: string;

  @Prop({ trim: true, default: '' })
  description: string;

  @Prop({ type: Date, default: null, index: true })
  deletedAt: Date | null;
}

export const CategorySchema = SchemaFactory.createForClass(Category);
