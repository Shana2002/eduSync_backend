import {db} from '../config/database.js'
import {checkToken} from '../utils/cookieCheck.js'
import {assignmentUpload} from '../config/multerConfig.js'

// assigment create
export const createAssigment = (req, res) => {
    
    // Handle file upload
    assignmentUpload.single('module-submission-file')(req, res, (err) => {
        if (err) return res.status(500).json({ error: 'File upload failed' });
        console.log('yaklwawaa')
        // Check token (admin)
        // checkToken(req, res, 'secretkeyAdmin', (err, userInfo) => {
        //     if (err) return res.status(400).json(err);
            
            // Verify admin manages the batch
            // const checkq = 'SELECT b.managed_by FROM module_assign AS ma LEFT JOIN batch AS b ON b.batch_id = ma.batch_id WHERE ma.module_assign_id = ?';
            // db.query(checkq, [req.body.module_assign_id], (err, data) => {
            //     if (err) return res.status(500).json(err);
            //     if (!data.length || data.length > 1 || data[0].managed_by != userInfo.id) {
            //         return res.status(400).json("Unauthorized!");
            //     }

                // Prepare data for insertion
                const { module_assign_id, assigment_type, start_date, deadline, marks } = req.body;
                const resource = req.file ? req.file.path : ''; // Save file path if file uploaded
                
                // Insert assignment into the database
                const q = 'INSERT INTO `assigment`(`module_assign_id`, `assigment_type`, `start_date`, `end_date`, `marks`, `resource`) VALUES (?)';
                db.query(q, [[module_assign_id, assigment_type, start_date, deadline, marks, resource]], (err, data) => {
                    console.log(err)
                    if (err) return res.status(500).json(err);
                    
                    return res.status(200).json("Assignment created successfully");
                });
            // });
        // });
    });
};

// update deadline super admin can do
export const deadlineUpdate = (req,res) => {
    // super admin verification
    checkToken(req,res,'secretkeySuperAdmin',(err,userInfo)=>{
        if (err) return res.status(400).json(err.message);

        // required fileds
        const {deadline } = req.body;
        const assign_id = req.params.id;

        if (!deadline) return res.status(400).json("Need required fileds");

        // quey
        const q = 'UPDATE assigment SET end_date = ? WHERE assigment_id = ?'
        db.query(q,[deadline,assign_id],(err,data)=>{
            if (err) return req.status(500).json(err);

            return res.status(200).json("Update Successfull");
        })
    })
}

// student assigment submission
export const submitAssignment = (req, res) => {
    // Check the token to verify the student
    checkToken(req, res, 'secretkey', (err, userInfo) => {
        if (err) return res.status(400).json(err.message);

        const assignment_id = req.params.id;

        // Use Multer to handle the file upload
        assignmentUpload(req, res, (err) => {
            if (err) {
                return res.status(400).json({ message: err.message });
            }

            // Check if file is uploaded
            const file = req.file;
            if (!file) {
                return res.status(400).json("File is required");
            }

            // Check if the deadline for the assignment has passed
            const q = 'SELECT * FROM assignment AS a WHERE DATE(a.end_date) >= CURDATE() AND a.assignment_id = ?';
            db.query(q, [assignment_id], (err, data) => {
                if (err) return res.status(500).json(err);
                if (!data.length) return res.status(400).json('Deadline passed');

                // Submit the assignment data into the database
                const insertQuery = 'INSERT INTO `assignment_submission`(`assignment_id`, `student_id`, `status`, `file`) VALUES (?)';
                const submissionData = [assignment_id, userInfo.id, 'submitted', file.path];

                db.query(insertQuery, [submissionData], (err, result) => {
                    if (err) return res.status(500).json(err);
                    return res.status(200).json("Assignment submitted successfully");
                });
            });
        });
    });
};

// marking assigment marks - lecture
export const markAddtoAssigment = (req,res) =>{
    checkToken(req,res,'secretkeyLecture',(err,userInfo)=>{
        if (err) return res.status(400).json(err);

        const id = req.params.id;
        const {marks,remark} = req.body
        if (!marks || marks>100) return res.status(400).json("Enter valid marks");

        const status = marks >= 40 ? 'pass' : 'repeat';
        const q = 'UPDATE `assigment_submission` SET `status`= ? ,`marks_obtain`= ? `remarks`=? WHERE submission_id = ?';
        db.query(q,[status,marks,remark,id],(err,data)=>{
            if (err) return res.status(500).json(err);

            return res.status(200).json('Marks Added');
        });
    });
}

export const batchAssigments = (req,res) =>{
    // checkToken(req,res,'secretkeyLecture',(err,userInfo)=>{
        // if (err) return res.status(400).json(err);

        const id = req.params.id;

        const q = `SELECT ma.module_assign_id as moduleid ,ma.*,a.*,m.title FROM module_assign AS ma 
                LEFT JOIN assigment AS a ON a.module_assign_id = ma.module_assign_id
                LEFT JOIN module AS m ON m.module_id = ma.module_id
                WHERE ma.batch_id=?`;
                
        db.query(q,[id],(err,data)=>{
            if (err) return res.status(500).json(err);

            return res.status(200).json(data);
        });
    // });
}

export const getLectureModuleAssigment = (req, res) =>{
    try {
        checkToken(req,res,'secretkeyLecture',(err,userInfo)=>{
            if(err) return res.status(500).json(err.message)
            const {id} = req.params;
        
              const q = `SELECT * FROM assigment a
                        LEFT JOIN assigment_submission AS asm ON asm.assigment_id = a.assigment_id
                        LEFT JOIN student AS s ON s.student_id = asm.student_id
                        WHERE  a.module_assign_id = ?
                          `;
                db.query(q,[id],(err,data)=>{
                    if (err) return res.status(500).json(err);
        
                    return res.status(200).json(data);
                })
          })
    } catch (error) {
        console.log(error);
    }
}


export const getStudentAssigments = async(req, res) =>{
    try {
        let studentAssignments = [];
        // checkToken(req,res,'secretkey',async (err,userInfo)=>{
        //     if(err) return res.status(500).json(err.message)
                const id = 1;

            // Query for assignments
            const assignmentQuery = `
                SELECT * FROM student_enroll se
                LEFT JOIN batch b ON b.batch_id = se.batch_id
                LEFT JOIN module_assign ma ON ma.batch_id = b.batch_id
                LEFT JOIN module m ON m.module_id = ma.module_id
                LEFT JOIN assigment a On a.module_assign_id = ma.module_assign_id
                WHERE a.assigment_id is NOT NULL and se.student_id = ?
            `;
    
            // Wrapping the db.query in a Promise for async/await
            const assignments = await new Promise((resolve, reject) => {
                db.query(assignmentQuery, [id], (err, data) => {
                    if (err) return reject(err);
                    resolve(data);
                });
            });
    
            // Collect assignment IDs for the submission check query
            const assignmentIds = assignments.map(a => a.assignment_id);
    
            if (assignmentIds.length > 0) {
                // Query for all assignment submissions for this student at once
                const submissionQuery = `
                    SELECT * FROM assigment_submission ast
                    WHERE ast.assigment_id IN (?) AND ast.student_id = ?
                `;
                const submissions = await new Promise((resolve, reject) => {
                    db.query(submissionQuery, [assignmentIds, id], (err, data) => {
                        if (err) return reject(err);
                        resolve(data);
                    });
                });
    
                // Create a map for submissions based on assignment_id
                const submissionMap = {};
                submissions.forEach(sub => {
                    submissionMap[sub.assignment_id] = sub;
                });
    
                // Create the final list of student assignments with statuses
                assignments.forEach(element => {
                    const submission = submissionMap[element.assignment_id];
                    if (submission) {
                        studentAssignments.push({ element, status: "submitted", data: submission });
                    } else {
                        studentAssignments.push({ element, status: "not-submitted" });
                    }
                });
            } else {
                // If no assignments found, return an empty array
                studentAssignments = [];
            }
    
            // Send the final response
            return res.status(200).json(studentAssignments);
        //   })
    } catch (error) {
        console.log(error);
    }
}
