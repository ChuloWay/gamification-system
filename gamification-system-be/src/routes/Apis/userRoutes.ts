import { Router, Request, Response } from "express";
import isAuthenticated from "../../middlewares/isAuthenticated";
import * as userController from "../../controllers/userController";

const router = Router();

router.post("/", (req: Request, res: Response) => {
  userController.createUser(req, res);
});

router.post("/login", (req: Request, res: Response) => {
  userController.loginUser(req, res);
});

router.use(isAuthenticated);

router.get("/all", (req: Request, res: Response) => {
  userController.getAllUsers(req, res);
});

router.get("/:id", (req: Request, res: Response) => {
  userController.getUser(req, res);
});

router.put("/:id", (req: Request, res: Response) => {
  userController.updateUser(req, res);
});

router.delete("/:id", (req: Request, res: Response) => {
  userController.deleteUser(req, res);
});

export default router;
