import {db} from '../config/database.js'
import {checkToken} from '../utils/cookieCheck.js'


export const createBatch = (req,res) => {
    //checkToken(req,res,'secretkeySuperAdmin',(err,userInfo)=>{
      //  if (err) return res.status(400).json(err.message);
        console.log(req.body);
        const {program , start_Date} = req.body
        const q = "INSERT INTO `batch`(`program_id`, `start_date`, `managed_by`) VALUES (?)";
        db.query(q,[[program,start_Date,1]],(err,data)=>{
            if (err) console.log(err);
            if (err) return res.status(500).json(err);

            return res.status(200).json("Batch Create successful");
        })
    //})
}

export const viewBatchs = (req,res) => {
    // checkToken(req,res,'secretkeySuperAdmin',(err,userInfo)=>{
        const q = "SELECT * FROM batch AS b LEFT JOIN program AS p ON p.program_id = b.program_id";
        db.query(q,[],(err,data)=>{
            if (err) return res.status(500).json(err);

            return res.status(200).json(data);
        })
    // })
}

export const viewBatch = (req,res) => {
    // checkToken(req,res,'secretkeySuperAdmin',(err,userInfo)=>{
        const {id} = req.params
        const q = "SELECT * FROM batch AS b LEFT JOIN program AS p ON p.program_id = b.program_id WHERE batch_id =?";
        db.query(q,[id],(err,data)=>{
            if (err) return res.status(500).json(err);

            return res.status(200).json(data[0]);
        })
    // })
}

export const viewBatchstudent = (req,res) => {
    // checkToken(req,res,'secretkeySuperAdmin',(err,userInfo)=>{
        const {id} = req.params
        const q = `SELECT * FROM student_enroll AS se
                    LEFT JOIN student AS s ON s.student_id = se.student_id
                    WHERE se.batch_id =?`;
        db.query(q,[id],(err,data)=>{
            if (err) return res.status(500).json(err);

            return res.status(200).json(data);
        })
    // })
}