import * as bcrypt from 'bcrypt';

import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  NotFoundException,
  Param,
  Patch,
  Post,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { IUser } from './user.model';
import { UserService } from './user.service';
import { JwtService } from '@nestjs/jwt';
import { CURRENT_USER } from 'src/constants';
import { Request } from 'express';

@Controller()
export class UserController {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  @Post('login')
  async login(@Body() login: Pick<IUser, 'email' | 'password'>) {
    const user = await this.userService.getUserByEmail(login.email);
    if (!user) {
      throw new NotFoundException();
    }
    const isMatch = await bcrypt.compare(login.password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException();
    }
    const payload = { email: user.email, type: user.type, id: user._id };
    const jwt = this.jwtService.signAsync(payload);
    return jwt;
  }

  /**
   * Create and update route
   */
  @Post('user/:id/:status_id?')
  async createOrUpdateUser(
    @Param('id') userId,
    @Param('status_id') statusId,
    @Body() user: IUser,
  ) {
    if (userId == 0) {
      return this.userService.createUser(user);
    }

    const { _id, ...otherFields } = user;
    let updateObject: any = otherFields;

    if (statusId) {
      updateObject = { status_id: statusId };
    }
    const result = await this.userService.updateUser(userId, updateObject);
    if (!result) {
      throw new HttpException('Error Updating User', HttpStatus.NOT_FOUND);
    }
    return result;
  }

  @Get('user/:id/')
  getProfile(@Param('id') userId, @Req() request: Request) {
    let id = userId === CURRENT_USER ? request.user?._id : userId;
    return this.userService.findById(id);
  }

  @Get('user')
  getAllUsersProfiles() {
    return this.userService.getAllUsers();
  }

  @Delete('user/:id')
  async deleteUser(@Param('id') userId: string) {
    const deletedUser = await this.userService.deleteUser(userId);
    if (!deletedUser) {
      throw new HttpException('Error Deleting Resource', HttpStatus.NOT_FOUND);
    }
    return deletedUser;
  }
}
