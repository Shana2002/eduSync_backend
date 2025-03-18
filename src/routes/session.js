import express from 'express'
import { addSession, getSessionName, getSessions } from '../controllers/session.js'

const router = express.Router();

router.get('/gen',getSessionName)
// create session assigent admin 
router.post("/create",addSession);

router.get('/:date',getSessions)




export default router;