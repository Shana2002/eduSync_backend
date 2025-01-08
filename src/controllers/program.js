import {checkToken} from '../utils/cookieCheck.js'
import {db} from '../config/database.js'

export const createProgram = (req,res) => {
    checkToken(req,res,'secretkeySuperAdmin',(err,userInfo)=>{
        if (err) return res.status(400).json(err.message);

        const {title,description,program_characters,duration} = req.body
        const q = "INSERT INTO `program`(`title`, `description`, `program_characters`, `duration`, `create_at`) VALUES (?)";
        db.query(q,[[title,description,program_characters,duration,userInfo.id]],(err,data)=>{
            if (err) return res.status(500).json(err);

            return res.status(200).json("Program Created");
        })
    })
}

export const updateProgram = (req,res) =>{
    checkToken(req,res,'secretkeySuperAdmin',(err,userInfo)=>{
        if (err) return res.status(400).json(err.message);

        
    })
}

