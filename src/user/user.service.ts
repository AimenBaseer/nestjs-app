import { ConflictException, Injectable, Post } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';

import { IUser } from './user.model';

@Injectable()
export class UserService {
  constructor(@InjectModel('User') private readonly userModel: Model<IUser>) {}

  createUser = async (user: IUser) => {
    const saltOrRounds = 10;
    const userExists = await this.getUserByEmail(user.email);
    if (userExists) {
      throw new ConflictException('User with this email already exists');
    }
    const hash = await bcrypt.hash(user.password, saltOrRounds);
    user.password = hash;
    return this.userModel.create(user);
  };

  getUserByEmail = async (email: string) => this.userModel.findOne({ email });

  getAllUsers = () => this.userModel.find({});

  deleteUser = (id: string) => this.userModel.deleteOne({ id });

  findById = (id: string) => this.userModel.findById(id);

  updateUser = (id: string, user: IUser) =>
    this.userModel.findOneAndUpdate({ id }, user, {
      new: true,
      runValidators: true,
    });
}
