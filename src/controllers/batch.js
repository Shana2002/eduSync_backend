import {db} from '../config/database.js'
import {checkToken} from '../utils/cookieCheck.js'


export const createBatch = (req,res) => {
    checkToken(req,res,'secretkeySuperAdmin',(err,userInfo)=>{
        if (err) return res.status(400).json(err.message);

        const {program , start_Date , managed} = req.body
        const q = "INSERT INTO `batch`(`program_id`, `start_date`, `managed_by`) VALUES (?)";
        db.query(q,[program,start_Date,managed],(err,data)=>{
            if (err) return res.status(500).json(err);

            return res.status(200).json("Batch Create successful");
        })
    })
}

export const viewBatchs = (req,res) => {
    checkToken(req,res,'secretkeySuperAdmin',(err,userInfo)=>{
        const q = "SELECT * FROM batch";
        db.query(q,[],(err,data)=>{
            if (err) return res.status(500).json(err);

            return res.status(200).json(data);
        })
    })
}

