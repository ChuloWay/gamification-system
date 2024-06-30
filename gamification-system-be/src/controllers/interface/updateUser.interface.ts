import { Request } from "express";
export interface UpdateUserRequest extends Request {
  params: {
    id: string;
  };
  body: {
    points: number;
  };
}
