import {db} from '../config/database.js'
import {checkToken} from '../utils/cookieCheck.js'

export const createAssigment = (req,res) =>{
    checkToken(req,res,'secretkeyAdmin',(err,userInfo)=>{
        if (err) return res.status(400).json(err);

        const checkq = 'SELECT b.managed_by FROM module_assign	 AS ma LEFT JOIN batch AS b ON b.batch_id = ma.batch_id WHERE ma.module_assign_id = ?';
        db.query(checkq,[req.body.assign_id],(err,data)=>{
            if (err) return res.status(500).json(err);
            if (!data.length || data.length >1 || data[0].managed_by != userInfo.id) return res.status(400).json("Unotherized!");
            
            const {module_assign_id , assigment_type , start_date , end_date ,marks , resource } = req.body;
            const q  = 'INSERT INTO `assigment`( `module_assign_id`, `assigment_type`, `start_date`, `end_date`, `marks`, `resource`) VALUES (?)';

            db.query(q,[[module_assign_id,assigment_type,start_date,end_date,marks,resource]],(err,data)=>{
                if (err) return res.status(500).json(err);

                return res.status(200).json("Assigment created");
            })
        })
    })
}

export const deadlineIpdate = (req,res) => {
    checkToken(req,res,'secretkeySuperAdmin',(err,userInfo)=>{
        if (err) return res.status(400).json(err.message);

        const {deadline , assign_id } = req.body;

        const q = 'UPDATE assigment SET end_date = ? WHERE assigment_id = '
    })
}