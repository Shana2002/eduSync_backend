import express from 'express'
import { addSession, getSessionName, getSessions, getSessionsLectrue } from '../controllers/session.js'

const router = express.Router();

router.get('/gen',getSessionName);
// create session assigent admin 
router.post("/create",addSession);

// Lecture Session 
router.get('/lecture/session/:date',getSessionsLectrue);

router.get('/:date',getSessions);





export default router;