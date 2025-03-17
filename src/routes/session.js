import express from 'express'
import { addSession, getSessions } from '../controllers/session.js'

const router = express.Router();

// create session assigent admin 
router.post("/create",addSession);

router.get('/:date',getSessions)

export default router;