import express from 'express'
import {viewBatchs , createBatch, viewBatch, viewBatchstudent, BatchLectureDetails} from '../controllers/batch.js'

const router = express.Router()


router.post('/add',createBatch) 
router.get('/',viewBatchs)

router.get('/:id',viewBatch)
router.get('/:id/students',viewBatchstudent)
router.get('/:id/lectures',BatchLectureDetails)


export default router;