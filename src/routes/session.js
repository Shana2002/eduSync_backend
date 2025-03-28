import express from 'express'
import { addSession, getCurrentSession, getSessionName, getSessions, getSessionsLectrue, getSessionsStudent } from '../controllers/session.js'

const router = express.Router();

router.get('/current',getCurrentSession)

router.get('/gen',getSessionName);
// create session assigent admin 
router.post("/create",addSession);

router.get('/student/session/:date',getSessionsStudent)

// Lecture Session 
router.get('/lecture/session/:date',getSessionsLectrue);



router.get('/:date',getSessions);







export default router;