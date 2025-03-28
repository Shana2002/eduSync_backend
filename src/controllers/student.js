import { json } from 'express'
import {db} from '../config/database.js'
import {checkToken} from '../utils/cookieCheck.js'
import bcryptjs from 'bcryptjs'
import jwt from 'jsonwebtoken'
import {studentUpload} from '../config/multerConfig.js'


export const createStudent = (req, res) => {
    // Handle file upload first
    studentUpload.single('studentImage')(req, res, (err) => {
      if (err) return res.status(400).json({ error: err.message });
  
      const imageUrl = req.file ? `/students/${req.file.filename}` : null; // Get uploaded image path
  
      // Check if student already registered in this batch
      const checkQuery = `
          SELECT s.email, se.batch_id 
          FROM student_enroll AS se 
          LEFT JOIN student AS s ON s.student_id = se.student_id 
          WHERE s.email = ? AND se.batch_id = ?;
      `;
  
      db.query(checkQuery, [req.body.email, req.body.batch], (err, data) => {
        if (err) return res.status(500).json(err);
        if (data.length) return res.status(400).json("This student is already registered in this batch.");
  
        // Get batch details to generate username
        const batchQuery = `
            SELECT b.batch_id, p.program_characters, COUNT(se.batch_id) AS student_count
            FROM batch AS b
            LEFT JOIN program AS p ON p.program_id = b.program_id
            LEFT JOIN student_enroll AS se ON se.batch_id = b.batch_id
            WHERE b.batch_id = ?
            GROUP BY b.batch_id, p.program_characters;
        `;
  
        db.query(batchQuery, [req.body.batch], (err, batchData) => {
          if (err) return res.status(500).json(err);
          if (batchData.length !== 1) return res.status(500).json("Something went wrong");
  
          const defaultPassword = "HelloWORLD";
          const username = `${batchData[0].program_characters}/${req.body.batch}/${batchData[0].student_count + 1}`;
          const salt = bcryptjs.genSaltSync(10);
          const hashedPassword = bcryptjs.hashSync(defaultPassword, salt);
  
          // Insert student data into the database
          const insertStudentQuery = `
              INSERT INTO student (email, first_name, last_name, mobile, username, password, managed_by, image_url)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?);
          `;
  
          const studentValues = [
            req.body.email,
            req.body.first_name,
            req.body.last_name,
            req.body.mobile,
            username,
            hashedPassword,
            1, // managed_by default value
            imageUrl // Save uploaded image path
          ];
  
          db.query(insertStudentQuery, studentValues, (err, studentResult) => {
            if (err) return res.status(500).json(err);
  
            const student_id = studentResult.insertId;
  
            // Enroll student in batch
            const enrollQuery = "INSERT INTO student_enroll(student_id, batch_id) VALUES (?, ?)";
            db.query(enrollQuery, [student_id, req.body.batch], (err) => {
              if (err) return res.status(500).json(err);
              return res.status(200).json({ message: "Successfully enrolled student", image: imageUrl });
            });
          });
        });
      });
    });
  };

export const addnewstudenttoBatch = (req,res)=>{
    checkToken(req,res,'secretkeySuperAdmin',(err,userInfo)=>{
        if (err) return res.status(401).json(err.message);

        
        res.status(401).json(userInfo.id);
    })
}

export const student_details = (req,res) =>{
    // const {id , name } = req.params;
    //     res.send(`id is ${id} and ${name}`)
    try {
      checkToken(req,res,'secretkey',(err,userInfo)=>{
        console.log(err)
        if (err) return res.status(401).json(err.message);
        console.log(`id is a ${userInfo.id}`)
        const q = "SELECT * FROM student WHERE student_id = ?"
        db.query(q,[userInfo.id],(err,data)=>{
            console.log(err)
            if (err) return res.status(500).json(err);
            console.log(data)
            return res.status(200).json(data[0])
        })
        
    })
    } catch (error) {
      console.log(error);
    }
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

        const q = `SELECT s.student_id,s.email,s.first_name,s.last_name,s.mobile,s.username,b.batch_id,p.title,p.program_id,s.image_url FROM student_enroll AS se 
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
  
        if (!moduleAssignId) break;
  
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
        console.log(module.sessions)
        for (let index = lengthOfSessions; index < module.sessions; index++) {
          AttandanceDetails.push({
            session_name: `Session ${index + 1}`,
            status: 'Not Started Yet'
          });
        }
  
        // Add module and attendance details to result
        result.push({ module, AttandanceDetails });
        console.log(result.AttandanceDetails)
      }
  
      return res.status(200).json(result);
    } catch (error) {
      console.log(error);
      return res.status(500).json(error);
    }
  }; 