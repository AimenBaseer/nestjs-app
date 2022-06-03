import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { AllExceptionsFilter } from './exceptions/exception.filter';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';

import { UserModule } from './user/user.module';
import {
  Module,
} from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    UserModule,
    MongooseModule.forRoot(process.env.MONGODB_URL),
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {

}
