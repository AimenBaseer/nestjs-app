import {
  ConflictException,
  Injectable,
  NotFoundException,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

import { User } from './user.model';

@Injectable()
export class UserService {
  constructor(
    @InjectModel('User') private readonly userModel: Model<User>,
    private jwtService: JwtService,
  ) {}

  createUser = async (user: User) => {
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

  getAllUsers = (userType) => {
    const query = userType ? { type: userType } : {};
    return this.userModel.find(query);
  };

  deleteUser = (id: string) => this.userModel.deleteOne({ id });

  findById = (id: string) => this.userModel.findById(id);

  updateUser = (id: string, user: User) =>
    this.userModel.findOneAndUpdate({ id }, user, {
      new: true,
      runValidators: true,
    });

  login = async (email: string, password: string) => {
    const user = await this.getUserByEmail(email);
    if (!user) {
      throw new NotFoundException();
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException();
    }
    const payload = { email: user.email, type: user.type, id: user._id };
    const jwt = this.jwtService.signAsync(payload);
    return jwt;
  };
}
