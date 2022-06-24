import { faker } from '@faker-js/faker';
import { Types } from 'mongoose';

import { Role, User } from '../../src/user/user.model';

export const userStub = (role?: Role): User => {
  const { name, internet, phone } = faker;
  return {
    _id: new Types.ObjectId(),
    firstname: name.firstName(),
    lastname: name.lastName(),
    email: internet.email(),
    type: role || Role.client,
    password: internet.password(),
    phone: phone.phoneNumber(),
    status_id: '0',
  };
};
