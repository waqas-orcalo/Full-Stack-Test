import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
import { Category, CategoryDocument } from './schemas/category.schema';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name)
    private readonly categoryModel: Model<CategoryDocument>,
  ) {}

  findAll(): Promise<Category[]> {
    return this.categoryModel.find({ deletedAt: null }).sort({ name: 1 }).exec();
  }

  async create(dto: CreateCategoryDto): Promise<Category> {
    const name = dto.name.trim();
    const exists = await this.categoryModel.exists({
      name: new RegExp(`^${escapeRegExp(name)}$`, 'i'),
      deletedAt: null,
    });
    if (exists) {
      throw new ConflictException(`Category "${name}" already exists`);
    }
    return this.categoryModel.create({ name, description: dto.description ?? '' });
  }

  async update(id: string, dto: UpdateCategoryDto): Promise<Category> {
    if (!isValidObjectId(id)) throw new NotFoundException('Category not found');
    const category = await this.categoryModel
      .findOneAndUpdate({ _id: id, deletedAt: null }, dto, { new: true })
      .exec();
    if (!category) throw new NotFoundException('Category not found');
    return category;
  }

  async remove(id: string): Promise<{ id: string; deleted: boolean }> {
    if (!isValidObjectId(id)) throw new NotFoundException('Category not found');
    const category = await this.categoryModel
      .findOneAndUpdate(
        { _id: id, deletedAt: null },
        { deletedAt: new Date() },
        { new: true },
      )
      .exec();
    if (!category) throw new NotFoundException('Category not found');
    return { id, deleted: true };
  }
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
