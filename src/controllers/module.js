import {db} from '../config/database.js'
import { checkToken} from '../utils/cookieCheck.js'

export const createModules = (req,res) =>{
    // check token
    // /checkToken(req,res,'secretkeySuperAdmin',(err,userInfo)=>{
        // if (err) return res.status(400).json(err.message);

        const {title,module_char,sessions} = req.body ?? res.status(400).json("error");

        const q = "INSERT INTO `module`(`title`, `module_char`, `sessions`) VALUES (?)";
        db.query(q,[[title,module_char,sessions]],(err,data)=>{
            if (err) return res.status(500).json(err);

            return res.status(200).json("Module add Success");
        })
    // })
} 

export const showProgramModule = (req,res) =>{
    const {program} = req.params
    const q = 'SELECT m.title,m.module_char,m.sessions FROM program_module AS pe LEFT JOIN module AS m on m.module_id = pe.module_id  WHERE pe.program_id = ?'
    db.query(q,[program],(err,data)=>{
        if (err) return res.status(500).json(err);
        
        return res.status(200).json(data);
    })
}

export const showAllModules = (req,res) => {
    const q = 'SELECT * FROM module';
    db.query(q,[],(err,data)=>{
        if (err) return res.status(500).json(err);

        return res.status(200).json(data);
    })
}

export const module_assign=(req,res)=>{
    checkToken(req,res,'secretkeySuperAdmin',(err,userInfo)=>{
        if (err) return res.status(400).json(err);

        const {module , batch , lecture} = req.body;

        if (!module) return res.status(400).json("Module required");
        if (!batch) return res.status(400).json("Batch id required");
        if (!lecture) return res.status(400).json("Lecture id required");

        const checkq = `SELECT * FROM batch AS b 
                        LEFT JOIN 
                            program_module AS pm ON pm.program_id = b.program_id 
                        WHERE 
                            b.batch_id = ? AND pm.module_id = ?`;
        
        db.query(checkq,[batch,module],(err,data)=>{
            if (err) return res.status(500).json(err);
            if (!data.length) return res.status(400).json("Invalid module");

            const q = 'INSERT INTO `module_assign`(`batch_id`, `module_id`, `lecture_id`) VALUES (?)';
            db.query(q,[[batch,module,lecture]],(err,data)=>{
                if (err) return res.status(500).json(err);

                return res.status(200).json('Lecture Module Assign Successful');
            })
        })    
    })
}

