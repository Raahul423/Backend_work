import { Router } from "express";
import { registeruser } from "../controllers/User.Controller.js";
const router = Router();

router.route("/register").post(registeruser)

export {router}