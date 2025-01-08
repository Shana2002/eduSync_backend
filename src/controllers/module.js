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

