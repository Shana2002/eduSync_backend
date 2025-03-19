import {db} from '../config/database.js'
import {checkToken} from '../utils/cookieCheck.js'

// assigment create
export const createAssigment = (req,res) =>{
    // check token admin 
    checkToken(req,res,'secretkeyAdmin',(err,userInfo)=>{
        if (err) return res.status(400).json(err);
        // find batch maintain by admin
        const checkq = 'SELECT b.managed_by FROM module_assign	 AS ma LEFT JOIN batch AS b ON b.batch_id = ma.batch_id WHERE ma.module_assign_id = ?';
        db.query(checkq,[req.body.module_assign_id],(err,data)=>{
            if (err) return res.status(500).json(err);
            if (!data.length || data.length >1 || data[0].managed_by != userInfo.id) return res.status(400).json("Unotherized!");
            
            // then create assigment
            const {module_assign_id , assigment_type , start_date , end_date ,marks , resource } = req.body;
            const q  = 'INSERT INTO `assigment`( `module_assign_id`, `assigment_type`, `start_date`, `end_date`, `marks`, `resource`) VALUES (?)';

            db.query(q,[[module_assign_id,assigment_type,start_date,end_date,marks,resource]],(err,data)=>{
                if (err) return res.status(500).json(err);

                return res.status(200).json("Assigment created");
            })
        })
    })
}

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
export const submitAssigment = (req,res) =>{
    // check student token
    checkToken(req,res,'secretkey',(err,userInfo)=>{
        if (err) return res.status(400).json(err.message);

        // required fileds
        const assignment_id = req.params.id;
        const {file} = req.body;

        if (!file) return res.status(400).json("File required");
        
        // check deadline
        const q = 'SELECT * FROM assigment AS a WHERE DATE(a.end_date) >= CURDATE() AND a.assigment_id = ?'
        db.query(q,[assignment_id],(err,data)=>{
            if (err) return res.status(500).json(err);
            if (!data.length) return res.status.json('Deadline passeed');

            // subbmition query
            const q = 'INSERT INTO `assigment_submission`(`assigment_id`, `student_id`, `status`,`file`,) VALUSE (?)';
            db.query(q,[assignment_id,userInfo.id,'submitted',file],(err,data)=>{
                if (err) return res.status(500).json(err);
                return res.status(200).json("Assigment submission successfull");
            });
        })
    })
}

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

        const q = `SELECT * FROM assigment AS a 
                    LEFT JOIN module_assign AS ma ON ma.module_assign_id = a.module_assign_id
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
