import {db} from '../config/database.js'
import {checkToken} from '../utils/cookieCheck.js'

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

        checkSessionName(req,(err,session)=>{
            if (err) return res.status(400).json(err.message);

            const {moduleid,batch_id,data,start_time,end_time,hall_id} = req.body;

            const q = 'INSERT INTO `session`(`session_id`, `module_asign_id`, `session_name`)';
        })
        

    })
}