import express from 'express'
import {generateAttendanceQR, markattendacebtQr} from '../controllers/qr.js'
import {manuelMark, markdeCount} from '../controllers/attendace.js'

const router = express.Router();

// generate qr
router.get("/generate-qr",generateAttendanceQR)
// {session_id,qr_id,remarks}

// mark attendance qr
router.get('mark/:code',markattendacebtQr);
// 

// get marked count
router.get('/count/:session',markdeCount)

// manuel marks student
router.get('/manule/:session/:student',manuelMark)
// {"remarks":}

export default router