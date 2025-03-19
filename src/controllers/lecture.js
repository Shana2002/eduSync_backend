import {db} from '../config/database.js'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'


// add lecture
export const addLectur = (req,res)=>{
    // check super admin token 
    const token = req.cookies.accessToken;
    if (!token) return res.status(401).json("Not logged in!")

    jwt.verify(token,'secretkeySuperAdmin',(err,userInfo)=>{
        if (err) return res.status(403).json('Token is not valid')
        
        // check already registerd email
        const checkq = "SELECT email FROM lecture WHERE email = ?"
        db.query(checkq,[req.body.email],(err,data)=>{
            if (err) return res.status(500).json(err)
            if (data.length) return res.status(409).json("This email lecture all ready registerd")
            const defaultPassword = "helloworld"
            const salt = bcrypt.genSaltSync(10);
            const hashedPassword = bcrypt.hashSync(defaultPassword,salt)

            // insert lecture details
            const q  = 'INSERT INTO lecture (`first_name`,`last_name`,`email`,`mobile`,`username`,`password`,`create_at`) values (?)';
            const user_name = `${req.body.first_name}${Math.floor(Math.random()*100)}`
            const values = [
            req.body.first_name,
            req.body.last_name,
            req.body.email,
            req.body.mobile,
            user_name,
            hashedPassword,
            userInfo.id
            ]
            db.query(q,[values],(err,data)=>{
                if (err) return res.status(500).json(err)
                return res.status(200).json("Lecture create successfully")
            })
        })        
    })
}

// change password from the lecture
export const changepassword = (req,res)=> {
    const token = req.cookies.accessToken;
    if (!token) return res.status(401).json("Not logged")
    
    jwt.verify(token,'secretkeyLecture',(err,userInfo)=>{
        if (err) return res.status(403).json("Token is not valid")
        
        const salt = bcrypt.genSaltSync(10)
        const hashedPassword = bcrypt.hashSync(req.body.password,salt)

        const q = "UPDATE lecture SET `password` = ? WHERE lecture_id = ?";
        db.query(q,[hashedPassword,userInfo.id],(err,data)=>{
            if (err) return res.status(500).json(err);
            return res.status(200).json("password chanage successfull")
        })
    })
}

// change password from the lecture
export const getLectures = (req,res)=> {
    const token = req.cookies.accessToken;
    if (!token) return res.status(401).json("Not logged")
    jwt.verify(token,'secretkeyAdmin',(err,userInfo)=>{
        if (err) return res.status(403).json("Token is not valid")

        const q = "SELECT l.lecture_id,l.first_name,l.last_name FROM lecture As l";
        db.query(q,[],(err,data)=>{
            if (err) return res.status(500).json(err);
            return res.status(200).json(data);
        })
    })
}
