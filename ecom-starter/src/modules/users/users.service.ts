import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument, UserRole } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  /** Includes passwordHash (select:false) — only used for credential checks. */
  findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel
      .findOne({ email: email.trim().toLowerCase(), deletedAt: null })
      .select('+passwordHash')
      .exec();
  }

  findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ _id: id, deletedAt: null }).exec();
  }

  exists(email: string): Promise<{ _id: unknown } | null> {
    return this.userModel
      .exists({ email: email.trim().toLowerCase(), deletedAt: null })
      .exec();
  }

  create(data: {
    email: string;
    passwordHash: string;
    name: string;
    role?: UserRole;
  }): Promise<UserDocument> {
    return this.userModel.create({
      ...data,
      email: data.email.trim().toLowerCase(),
      role: data.role ?? UserRole.CUSTOMER,
    });
  }
}
