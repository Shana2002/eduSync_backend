import express from 'express'
import {createStudent,addnewstudenttoBatch,student_details,changeBatch} from '../controllers/student.js'

const router = express.Router()

// create studernt
router.post('/add',createStudent)
// post {"email":"hansaka@gmail.com","first_name":"hansaka","last_name":"ravishan","mobile":"0712875690","batch":2}


// reset password
router.post('/add-new-batch',addnewstudenttoBatch)

// change student batch
router.get('/:id',student_details)
// // update details
// router.patch()

router.patch('/change-batch',changeBatch)
// {"id":1 , "batch":5 , "old_batch":1}

export default router