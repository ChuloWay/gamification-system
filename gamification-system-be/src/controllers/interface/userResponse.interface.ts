import { IUser } from "../../models/userModel";

export interface CreateUserResponse {
  message: string;
  user: IUser;
}
