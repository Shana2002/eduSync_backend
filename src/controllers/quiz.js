import {db} from '../config/database.js'
import {checkToken} from '../utils/cookieCheck.js'

export const quizSubmission = (req,res) =>{
    checkToken(req,res,'secretkey',(err,userInfo)=>{
        if (err) return res.status(400).json(err);

        const {session , student , mark } = req.body;
        const cheq = 'SELECT * FROM `quiz_submission` WHERE  `session_id` = ? AND `student_id` = ?';
        db.query(cheq,[session,student],(err,data)=>{
            if (err) return res.status(500).json(err);

            if (data.length) return res.status(400).json("Already Marked marks");

            const q = 'INSERT INTO `quiz_submission`(`session_id`, `student_id`, `mark_obtained`) VALUES (?)';
            db.query(q,[session,student,mark],(err,data)=>{
                if (err) return res.status(500).json(err);

                return res.status(200).json("Marked Added successfull");
            })
        })
    })
}