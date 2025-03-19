import {createModules, getBatchLectureModules, module_assign, showAllModules, showProgramModule} from '../controllers/module.js'
import express from 'express'

const router = express.Router();

// show all modules
router.get("/",showAllModules)

router.get('/lecture/:id',getBatchLectureModules)

// show program modules
router.get("/:program",showProgramModule)

// create modules
router.post("/create",createModules)
// {"title":"Acedemic 1","module_char":"Ac1","sessions":10}

router.post("/assign",module_assign)
// {"module": , "batch": , "lecture":}

export default router