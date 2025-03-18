import { json } from 'express'
import {db} from '../config/database.js'
import {checkToken} from '../utils/cookieCheck.js'
import bcryptjs from 'bcryptjs'
import jwt from 'jsonwebtoken'

export const createStudent = (req,res) =>{
    // const token = req.cookies.accessToken;
    // if (!token) return res.status(401).json("user not logged");

    // jwt.verify(token,"secretkeySuperAdmin",(err,userInfo)=>{
        // if (err) return res.status(403).json("Token is not valid");
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
                    1,
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
    // })
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
    // checkToken(req,res,'secretkeySuperAdmin',(err,userInfo)=>{
        // if (err) return res.status(401).json(err.message);

        const q = "SELECT * FROM student WHERE student_id = ?"
        db.query(q,[[req.params.id,]],(err,data)=>{
            if (err) return res.status(500).json(err);

            return res.status(200).json(data)
        })
        
    // })
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

export const students_details = (req,res) =>{
    // const {id , name } = req.params;

    //     res.send(`id is ${id} and ${name}`)
    // checkToken(req,res,'secretkeySuperAdmin',(err,userInfo)=>{
        // if (err) return res.status(401).json(err.message);

        const q = `SELECT s.student_id,s.email,s.first_name,s.last_name,s.mobile,s.username,b.batch_id,p.title,p.program_id FROM student_enroll AS se 
                    LEFT JOIN student AS s ON s.student_id = se.student_id
                    LEFT JOIN batch AS b ON b.batch_id = se.batch_id
                    LEFT JOIN program AS p ON p.program_id = b.program_id`
        db.query(q,[[req.params.id,]],(err,data)=>{
            if (err) return res.status(500).json(err);

            return res.status(200).json(data)
        })
        
    // })
}

const queryPromise = (query, params) => {
    return new Promise((resolve, reject) => {
      db.query(query, params, (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });
  };
  
  export const studentModuleDetails = async (req, res) => {
    try {
      console.log('hello');
      const id = req.params.id;
      let result = [];
  
      // Fetch batch ID
      const checkBatch = `SELECT b.program_id FROM student_enroll AS se
                          LEFT JOIN batch AS b ON b.batch_id = se.batch_id
                          WHERE student_id = ?`;
      const batchData = await queryPromise(checkBatch, [id]);
      const batchID = batchData[0]?.program_id;
      if (!batchID) return res.status(500).json("Batch not found");
  
      // Fetch modules for the program
      const moduleQuery = `SELECT * FROM program_module AS pm
                           LEFT JOIN module AS m ON m.module_id = pm.module_id
                           WHERE pm.program_id = ?`;
      const moduleData = await queryPromise(moduleQuery, [batchID]);
      if (!moduleData || moduleData.length === 0) return res.status(500).json("No modules found");
  
      // Process each module
      for (const module of moduleData) {
        let AttandanceDetails = [];
  
        // Fetch module assignment ID
        const moduleAssignQuery = `SELECT * FROM module_assign WHERE module_id = ? AND batch_id = ?`;
        const moduleAssignData = await queryPromise(moduleAssignQuery, [module.module_id, batchID]);
        const moduleAssignId = moduleAssignData[0]?.module_assign_id;
  
        if (!moduleAssignId) return res.status(500).json("Module assignment not found");
  
        // Fetch session data
        const sessionQuery = `SELECT * FROM session s WHERE s.module_asign_id =?`;
        const sessions = await queryPromise(sessionQuery, [moduleAssignId]);
  
        // Process each session for attendance
        for (const session of sessions) {
          const attendQuery = `SELECT * FROM student_attendance WHERE student_id = ? AND session_id = ?`;
          const attendanceData = await queryPromise(attendQuery, [id, session.session_id]);
  
          const status = attendanceData.length === 0 ? 'Not Attended' : 'Attended';
          AttandanceDetails.push({
            session_name: session.session_name,
            status
          });
        }
  
        // Fill in missing sessions if any
        const lengthOfSessions = sessions.length ?? 0;
        for (let index = lengthOfSessions; index < module.sessions; index++) {
          AttandanceDetails.push({
            session_name: `Session ${index + 1}`,
            status: 'Not Started Yet'
          });
        }
  
        // Add module and attendance details to result
        result.push({ module, AttandanceDetails });
      }
  
      return res.status(200).json(result);
    } catch (error) {
      console.log(error);
      return res.status(500).json(error);
    }
  }; 