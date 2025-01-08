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

        const {title,description,program_characters,duration} = req.body;

        // fileds to update 
        const filedsToUpdate = {}

        if (title) filedsToUpdate.title = title;
        if (description) filedsToUpdate.description = description;
        if (program_characters) filedsToUpdate.program_characters = program_characters;
        if (duration) filedsToUpdate.duration = duration;
        
        const q = "UPDATE program SET ? WHERE program_id = ?";
        db.query(q,[filedsToUpdate,req.body.programId],(err,data)=>{
            if (err) return res.status(500).json(err);

            return res.status(200).json("Data update successfull");
        })
    })
}

