import { Router } from "express";
import { registeruser } from "../controllers/User.Controller.js";
const router = Router();

router.route("/Register").post(registeruser)

export {router}