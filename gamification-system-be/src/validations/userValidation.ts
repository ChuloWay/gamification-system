import { object, string, number } from "zod";

const createUserSchema = object({
  name: string().min(3).max(50),
  email: string().email(),
  password: string().min(6),
});

const updatePointsSchema = object({
  points: number().positive().int(),
});

export { createUserSchema, updatePointsSchema };
