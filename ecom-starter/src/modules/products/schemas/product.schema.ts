import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ProductDocument = HydratedDocument<Product>;

/**
 * Product collection.
 *
 * Conventions carried over from COSMONYX-BE-001:
 *  - timestamps (createdAt / updatedAt) managed automatically
 *  - soft delete via `deletedAt` (null = active) rather than hard deletes
 */
@Schema({
  collection: 'products',
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
export class Product {
  @Prop({ required: true, trim: true, index: true })
  name: string;

  @Prop({ trim: true, default: '' })
  description: string;

  @Prop({ required: true, min: 0 })
  price: number;

  @Prop({ required: true, uppercase: true, trim: true, unique: true })
  sku: string;

  @Prop({ default: 0, min: 0 })
  stock: number;

  @Prop({ trim: true, default: 'general', index: true })
  category: string;

  @Prop({ trim: true, default: '' })
  imageUrl: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: Date, default: null, index: true })
  deletedAt: Date | null;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
