import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Logger,
  NotFoundException,
  Param,
  Post,
  Query,
  Request as Req,
  UseGuards,
} from '@nestjs/common';
import { Role, User } from './user.model';
import { UserService } from './user.service';
import { CURRENT_USER } from '../constants';
import { Public } from '../decorators/public.decorator';
import { AuthService } from '../auth/auth.service';
import { LocalAuthGuard } from '../guards/local-auth.guard';
import { UserDto, LoginDto } from '../dtos/user.dto';
import { Types } from 'mongoose';
import { Roles } from '../decorators/roles.decorator';

import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
} from '@nestjs/swagger';
import { LoginUser } from '../decorators/login-user.decorator';
@ApiBearerAuth()
@Controller()
export class UserController {
  constructor(
    private userService: UserService,
    private readonly authService: AuthService,
  ) {}

  @Public()
  @UseGuards(LocalAuthGuard)
  @ApiBody({ type: LoginDto })
  @Post('login')
  login(@LoginUser() user: User) {
    Logger.debug('req.user', user);
    return this.authService.login(user);
  }

  /**
   * Create and update route
   */

  @Roles(Role.advisor)
  @Post('user/:id/:status_id?')
  @ApiCreatedResponse({ type: UserDto })
  async createOrUpdateUser(
    @Param('id') userId: string | Types.ObjectId,
    @Param('status_id') statusId: string,
    @Body() user: UserDto,
  ) {
    if (userId === '0') {
      return this.userService.createUser(user);
    }

    const { _id, ...otherFields } = user;
    let updateObject: any = otherFields;

    if (statusId) {
      updateObject = { status_id: statusId };
    }

    const result = await this.userService.updateUser(
      userId as Types.ObjectId,
      updateObject,
    );
    if (!result) {
      throw new HttpException('Error Updating User', HttpStatus.NOT_FOUND);
    }
    return result;
  }

  @Get('user/:id')
  @ApiOkResponse({ type: UserDto })
  async getProfile(
    @Param('id') userId: string | Types.ObjectId,
    @LoginUser('_id') _id: string,
  ) {
    let id = (userId === CURRENT_USER ? _id : userId) as Types.ObjectId;
    const result = await this.userService.findById(id);
    if (!result) {
      throw new NotFoundException();
    }
    return result;
  }

  @Get('user')
  @ApiOkResponse({ type: [UserDto] })
  getAllUsersProfiles(@Query('type') userType: string) {
    return this.userService.getAllUsers(userType);
  }

  @Roles(Role.advisor)
  @Delete('user/:id')
  async deleteUser(@Param('id') userId: string) {
    const deletedUser = await this.userService.deleteUser(userId);
    if (!deletedUser) {
      throw new HttpException('Error Deleting Resource', HttpStatus.NOT_FOUND);
    }
    return deletedUser;
  }
}
