import {createModules, showAllModules, showProgramModule} from '../controllers/module.js'
import express from 'express'

const router = express.Router();

// show all modules
router.get("/",showAllModules)

// show program modules
router.get("/:program",showProgramModule)

// create modules
router.post("/create",createModules)
// {"title":"Acedemic 1","module_char":"Ac1","sessions":10}

export default router