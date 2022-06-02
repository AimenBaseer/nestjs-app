import * as bcrypt from 'bcrypt';

import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { User } from './user.model';
import { UserService } from './user.service';
import { CURRENT_USER } from 'src/constants';
import { Request } from 'express';

@Controller()
export class UserController {
  constructor(private userService: UserService) {}

  @Post('login')
  async login(@Body() login: Pick<User, 'email' | 'password'>) {
    return this.userService.login(login.email, login.password);
  }

  /**
   * Create and update route
   */
  @Post('user/:id/:status_id?')
  async createOrUpdateUser(
    @Param('id') userId,
    @Param('status_id') statusId,
    @Body() user: User,
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

  @Get('user/:id')
  getProfile(@Param('id') userId, @Req() request: Request) {
    let id = userId === CURRENT_USER ? request.user?._id : userId;
    return this.userService.findById(id);
  }

  @Get('user')
  getAllUsersProfiles(@Query('type') userType: string) {
    return this.userService.getAllUsers(userType);
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
