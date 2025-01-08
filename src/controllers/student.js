import {db} from '../config/database.js'
import {checkToken} from '../utils/cookieCheck.js'
import bcryptjs from 'bcryptjs'
import jwt from 'jsonwebtoken'

export const createStudent = (req,res) =>{
    const token = req.cookies.accessToken;
    if (!token) return res.status(401).json("user not logged");

    jwt.verify(token,"secretkeySuperAdmin",(err,userInfo)=>{
        if (err) return res.status(403).json("Token is not valid");
        const cheqq = `SELECT 
                            s.email,se.batch_id FROM student_enroll AS se 
                        LEFT JOIN 
                            student AS s ON s.student_id = se.student_id 
                        WHERE 
                            s.email = ? AND se.batch_id = ?;`
        db.query(cheqq,[req.body.email,req.body.batch],(err,data)=>{
            if (err) return res.status(500).json(err);
            if (data.length) return res.status(400).json("This student already registerd this batch");
            
            const cheqq1 = `SELECT 
                                b.batch_id,
                                p.program_characters,
                                COUNT(se.batch_id) AS student_count
                            FROM 
                                batch AS b
                            LEFT JOIN 
                                program AS p ON p.program_id = b.program_id
                            LEFT JOIN 
                                student_enroll AS se ON se.batch_id = b.batch_id
                            WHERE 
                                b.batch_id = ?
                            GROUP BY 
                                b.batch_id, p.program_characters;
                            `;
            
            db.query(cheqq1,[req.body.batch],(err,data)=>{
                if (err) return res.status(500).json(err);
                if (data.length>1) return res.status(500).json("Something went wrong");
                
                const defaultPassword = "HelloWORLD"
                const username = `${data[0].program_characters}/${req.body.batch}/${data[0].student_count+1}`
                const salt = bcryptjs.genSaltSync(10)
                const hashedPassword = bcryptjs.hashSync(defaultPassword,salt)
                
                const q = "INSERT INTO student (`email`,`first_name`,`last_name`,`mobile`,`username`,`password`,`managed_by`) VALUES (?)";
            
                const values = [
                    req.body.email,
                    req.body.first_name,
                    req.body.last_name,
                    req.body.mobile,
                    username,
                    hashedPassword,
                    userInfo.id,
                ]
                db.query(q,[values],(err,data)=>{
                    if (err) return res.status(500).json(err);
                    const student_id = data.insertId;
                    
                    const q = "INSERT INTO student_enroll(`student_id`, `batch_id`) VALUES (?)";
                    const batch = req.body.batch
                    db.query(q,[[student_id,batch]],(err,data)=>{
                        if (err) return res.status(500).json(err);
                        return res.status(200).json("Succuessfull enrolled student");
                    })
                })
            })   
        })
    })
}

export const addnewstudenttoBatch = (req,res)=>{
    checkToken(req,res,'secretkeySuperAdmin',(err,userInfo)=>{
        if (err) return res.status(401).json(err.message);

        
        res.status(401).json(userInfo.id);
    })
}

export const student_details = (req,res) =>{
    // const {id , name } = req.params;

    //     res.send(`id is ${id} and ${name}`)
    checkToken(req,res,'secretkeySuperAdmin',(err,userInfo)=>{
        if (err) return res.status(401).json(err.message);

        const q = "SELECT * FROM student WHERE student_id = ?"
        db.query(q,[[req.params.id,]],(err,data)=>{
            if (err) return res.status(500).json(err);

            return res.status(200).json(data)
        })
        
    })
}

export const changeBatch = (req,res) => {
    checkToken(req,res,'secretkeySuperAdmin',(err,userInfo)=>{
        if (err) return res.status(401).json(err.message);

        const {id , batch , old_batch} = req.body

        const q = "UPDATE student_enroll SET batch_id = ? WHERE student_id = ? AND batch_id = ?";
        db.query(q,[batch,id,old_batch],(err,data)=>{
            if (err) return res.status(500).json(err);

            res.status(200).json("Batch Transfer Success");
        })
    })
}

