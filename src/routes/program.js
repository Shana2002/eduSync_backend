import {addProgramModule, createProgram, show_programs, updateProgram} from '../controllers/program.js'
import express from 'express'

const router = express.Router();

// create programm
router.post('/create',createProgram);
// {"title":"HD Software engineering","description":"Higher diploma of","program_characters":"HDCSE","duration":"2years"}

// update program
router.patch("/update",updateProgram);
// {"title":"HD Software engineering","description":"Higher diploma of","program_characters":"HDCSE","duration":"2years","programId":11}

// add modules
router.post("/addmodules",addProgramModule);
// {"modules":[1,2,4,5,6,7,9],"program_id":"11"}

// show programs
router.get("/",show_programs);

export default router;
