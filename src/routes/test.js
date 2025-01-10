import express from 'express'
import {checkAvailableHall} from '../controllers/hall.js'


const router = express.Router()

router.post('/checkhalls',checkAvailableHall)
// {"shedule_data":"2025-01-10","start_time":"08:00:00" , "end_time":"16:00:00"}

export default router;