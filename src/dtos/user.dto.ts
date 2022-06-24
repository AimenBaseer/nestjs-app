import {
  IsEmail,
  IsEnum,
  IsNumber,
  IsString,
} from 'class-validator';
import { Types } from 'mongoose';
import { Role } from '../user/user.model';
import { ApiHideProperty, ApiPropertyOptional, PickType } from '@nestjs/swagger';

export class UserDto {

  @ApiHideProperty()
  @IsString()
  _id?: Types.ObjectId;

  @IsString()
  firstname: string;

  @IsString()
  lastname: string;

  @IsEnum([Role.client, Role.advisor])
  type: Role;

  @ApiPropertyOptional()
  @IsString()
  phone: string;

  @IsNumber()
  status_id: string;

  @IsEmail()
  email: string;

  @IsString()
  password: string;
}

export class LoginDto extends PickType(UserDto, ['email', 'password']) {}
