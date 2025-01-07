import express from 'express'
import {logingAdmin,loginLecture,loginStudent} from '../controllers/auth.js'

const router = express.Router()

router.post('/admin-login',logingAdmin)
router.post('/lecture-login',loginLecture)
router.post('/student-login',loginStudent)

export default router;