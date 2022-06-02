import * as bcrypt from 'bcrypt';

export const hashPassword = (password, saltOrRounds) =>
  bcrypt.hash(password, saltOrRounds);
