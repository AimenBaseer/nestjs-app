import {
  IsEmail,
  IsEnum,
  IsNumber,
  IsString,
} from 'class-validator';
import { Types } from 'mongoose';
import { Role } from '../user/user.model';

export class UserDto {
  @IsString()
  _id?: Types.ObjectId;

  @IsString()
  firstname: string;

  @IsString()
  lastname: string;

  @IsEnum([Role.client, Role.advisor])
  type: Role;

  @IsString()
  phone: string;

  @IsNumber()
  status_id: string;

  @IsEmail()
  email: string;

  @IsString()
  password: string;
}
