import * as jwt from 'jsonwebtoken';

import {
  HttpException,
  HttpStatus,
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { JWT_SECRET } from 'src/constants';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthenticationMiddleware implements NestMiddleware {
  constructor(private readonly userService: UserService) {}

  async use(req: Request, res: Response, next: Function) {
    try {
      const authHeaders = req.headers.authorization;
      if (!authHeaders || !authHeaders.split(' ')[1]) {
        throw new UnauthorizedException()
      }
      const token = authHeaders.split(' ')[1];
      const decoded: any = jwt.verify(token, JWT_SECRET);
      const user = await this.userService.findById(decoded.id);

      if (!user) {
        throw new HttpException('User not found.', HttpStatus.UNAUTHORIZED);
      }
      req.user = user;
      next();
    } catch (e) {
      throw new UnauthorizedException()
    }
  }
}
