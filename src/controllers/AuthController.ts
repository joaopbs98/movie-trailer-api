import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User, { IUser } from "../models/UserModel";
import { AuthService } from "../services/AuthService";
import { ApiError } from "../utils/ApiError";

export class AuthController {
  static async register(req: Request, res: Response) {
    try {
      const { username, email, password } = req.body;
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = new User({ username, email, password: hashedPassword });

      await user.save();
      res.status(201).json({ message: "Registration successful" });
    } catch (error: any) {
      res.status(400).json({
        message: "Registration failed",
        error: (error as Error).message,
      });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });

      if (!user) throw new ApiError(404, "User not found");

      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) throw new ApiError(401, "Invalid password");

      const token = AuthService.generateToken(user);
      res.status(200).json({ token });
    } catch (error: any) {
      res
        .status((error as ApiError).status || 500)
        .json({ message: (error as Error).message });
    }
  }
}
