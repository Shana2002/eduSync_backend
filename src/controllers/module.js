import {db} from '../config/database.js'
import { checkToken} from '../utils/cookieCheck.js'

export const createModules = (req,res) =>{
    checkToken(res,req,'secretkeySuperAdmin',(err,userInfo)=>{
        if (err) return res.status(400).json(err.message);

        const {title,module_char,sessions} = req.body;

        const q = "INSERT INTO `module`(`title`, `module_char`, `sessions`) VALUES (?)";
        db.query(q,[[title,module_char,sessions]],(err,data)=>{
            if (err) return res.status(500).json(err);

            return res.status(200).json("Module add Success");
        })
    })
} 

export const showProgramModule = (req,res) =>{
    const q = 'SELECT m.title,m.module_char,m.sessions FROM program_module AS pe LEFT JOIN module AS m on m.module_id = pe.module_id  WHERE pe.program_id = ?'
    db.query(q,[req.body.program_id],(err,data)=>{
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