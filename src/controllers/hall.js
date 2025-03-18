import {db} from '../config/database.js'
import {checkToken} from '../utils/cookieCheck.js'

export function checkAvaialabelHalls(req,callback){
    
    const {shedule_data,start_time , end_time} = req.body;
    const q =   `SELECT GROUP_CONCAT(h.hall_id) as halls 
                FROM hall AS h
                WHERE h.hall_id NOT IN (
                    SELECT s.hall_id 
                    FROM shedule AS s
                    WHERE 
                        s.shedule_date = ? AND
                        (
                            (s.star_time <= ? AND s.end_time > ?) OR
                            (s.star_time < ? AND s.end_time >= ?) OR
                            (s.star_time >= ? AND s.end_time <= ?)
                        )
                );`
    db.query(q,[shedule_data,start_time,start_time,end_time,end_time,start_time,end_time],(err,data)=>{
        if (err) return callback(new Error(err));
        const halls = data[0].halls ? data[0].halls.split(',') : []
        return callback(null,halls)
    })
}

export const checkAvailableHall=(req,res)=>{
    checkToken(req,res,'secretkeySuperAdmin',(err,userInfo)=>{
        if (err) return res.status(400).json(err.message);
        
        checkAvaialabelHalls(req,(err,data)=>{
            if (err) return res.status(400).json(err.message);
            console.log(data);
            return res.status(200).json(data);
        })
    })
}

export const allHalls = (req,res) =>{
    console.log('hellow')
    const q = `SELECT * FROM hall`;
    db.query(q,[],(err,data)=>{
        if (err) return res.status(500).json(err);
        
        return res.status(200).json(data);
    })
}