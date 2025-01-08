import express from 'express'
import {createStudent,addnewstudenttoBatch} from '../controllers/student.js'

const router = express.Router()

// create studernt
router.post('/add',createStudent)
// post {"email":"hansaka@gmail.com","first_name":"hansaka","last_name":"ravishan","mobile":"0712875690","batch":2}


// reset password
router.post('/add-new-batch',addnewstudenttoBatch)

// // update details
// router.patch()


export default router