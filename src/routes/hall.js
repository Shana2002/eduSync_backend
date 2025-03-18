import express from 'express'
import { allHalls } from '../controllers/hall.js';

const router = express.Router();

router.get('/',allHalls);



export default router;

