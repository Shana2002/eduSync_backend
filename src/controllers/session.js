import {db} from '../config/database.js'
import {checkToken} from '../utils/cookieCheck.js'
import {checkAvaialabelHalls} from './hall.js'

function checkSessionName(req,callback) {
    const {moduleid,batch_id} =req.body;
        var session = 0;
        const q = ` SELECT 
                        ma.module_assign_id,m.sessions,COUNT(s.session_id) AS current_sessions FROM module_assign AS ma 
                    LEFT JOIN 
                        module AS m on m.module_id = ma.module_id
                    LEFT JOIN 
                        session AS s on s.module_asign_id = ma.module_assign_id
                    WHERE 
                        ma.module_id = ? AND ma.batch_id = ?`;

        db.query(q,[moduleid,batch_id],(err,data)=>{
            if (err) return callback(new Error(err));
            
            if (data.sessions === current_sessions) return callback(new Error("This module already complete it's sessions"));
            if (!data.current_sessions){
                return callback(null,1)
            }else{
                return callback(null,data.current_sessions + 1)
            }
        })
}

export const addSession = (req,res)=>{
    checkToken(req,res,'secretkeyAdmin',(err,userInfo)=>{
        if (err) return res.status(400).json(err);

        checkAvaialabelHalls(req,(err,data)=>{
            if (err) return res.status(400).json(err.message);

            const {module_assign_id,shedule_data,start_time , end_time,hall_id} = req.body;

            if (!data.includes(hall_id)) return res.status(400).json(`hall no ${hall_id} already booked`);
            checkSessionName(req,(err,session)=>{
                if (err) return res.status(400).json(err.message);
                
                const session_name = `Session ${session}`;
                const q = 'INSERT INTO `session`(`module_asign_id`, `session_name`) VALUES (?)';
                db.query(q,[[module_assign_id,session_name]],(err,data)=>{
                    if (err) return res.status(500).json(err);
                    const session_id = data.insertId;

                    const q = 'INSERT INTO `shedule`(`session_id`, `shedule_date`, `star_time`, `end_time`, `hall_id`) VALUES (?)';
                    db.query(q,[[session_id,shedule_data,start_time,end_time,hall_id]],(err,data)=>{
                        if (err) return res.status(500).json(err);
                        return res.status(200).json("Shedule add successfull");
                    })
                })

            })
        })

        
        

    })
}