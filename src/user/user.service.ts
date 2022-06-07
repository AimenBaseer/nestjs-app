import * as bcrypt from 'bcrypt';

import {
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { User } from './user.model';
import { hashPassword } from '../utils/helper';
import { UserDto } from '../dtos/user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectModel('User') private readonly userModel: Model<User>,
  ) {}

  createUser = async (user: UserDto) => {
    const saltOrRounds = 10;
    const userExists = await this.getUserByEmail(user.email);
    if (userExists) {
      throw new ConflictException('User with this email already exists');
    }
    user.password = await hashPassword(user.password, saltOrRounds);
    return this.userModel.create(user);
  };

  getUserByEmail = async (email: string) => this.userModel.findOne({ email }).lean();

  getAllUsers = (userType) => {
    const query = userType ? { type: userType } : {};
    return this.userModel.find(query);
  };

  deleteUser = (id: string) => this.userModel.deleteOne({ id });

  findById = (id: Types.ObjectId) => this.userModel.findById(id);

  updateUser = (id: string, user: User) =>
    this.userModel.findOneAndUpdate({ id }, user, {
      new: true,
      runValidators: true,
    });

}
