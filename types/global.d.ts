import { User as IUser } from "src/user/user.model";

declare global {
  namespace Express {
    interface Request {
      user: IUser;
    }
  }
}
export default global;
