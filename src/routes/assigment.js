import express from 'express'
import {batchAssigments, createAssigment, deadlineUpdate, getLectureModuleAssigment, markAddtoAssigment, submitAssigment} from '../controllers/assigment.js'

const router = express.Router();

router.get('/lecture/:id',getLectureModuleAssigment)
// create assigment
router.post('/create',createAssigment)
// {"module_assign_id": , "assigment_type": , "start_date": , "end_date": ,"marks": , "resource": }

// deadline update
router.patch("/update-deadline/:id",deadlineUpdate)
// {"deadline":}

// submit assigment
router.post("/submit/:id",submitAssigment);
// {"file":}

// marking assigment - lecture
router.patch("/mark/:id",markAddtoAssigment);
// {"marks":,"remark":}

router.get('/batch/:id',batchAssigments)
router.get('/batch/student/:id',batchAssigments)

export default router;