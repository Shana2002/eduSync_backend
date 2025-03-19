import express from 'express'
import {addLectur , changepassword, getLectures} from '../controllers/lecture.js'

const router = express.Router()

// lecture add super admin can do
router.post('/add',addLectur) // {"first_name":"hansaka" , "last_name":"ravishan" , "email":"hansakrab@gmail.com" , "mobile":"0712875690"}

// change password
router.post('/change-password',changepassword) // {"password":"hansaka"}
router.get('/',getLectures) // {"password":"hansaka"}



export default router;