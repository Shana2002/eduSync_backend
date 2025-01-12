import {db} from '../config/database.js'
import {checkToken} from '../utils/cookieCheck.js'

// attendance marking count
export const markdeCount = (req,res) => {
    checkToken(req,res,'secretkeyLecture',(err,userInfo)=>{
        if (err) return res.status(400).json(err);

        const {session} = req.params;
        const q = ` SELECT s.first_name , s.username , s.last_name , s.email FROM 
                        student_attendance AS sa 
                    LEFT JOIN 
                        student AS s ON s.student_id = sa.student_id
                    WHERE 
                        sa.session_id  = ?`;

        db.query(q,[session],(err,data)=>{
            if (err) return res.status(500).json(err);

            // return marked student count
            return res.status(200).json(data);
        })
    })
}