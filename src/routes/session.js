import express from 'express'
import { addSession } from '../controllers/session.js'

const router = express.Router();

// create session assigent admin 
router.use("/create",addSession);



export default router;