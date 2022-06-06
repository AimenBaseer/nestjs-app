import { IsDefined, IsEmail, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { Role } from 'src/user/user.model';

export class UserDto {
  @IsString()
  _id: string;

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
