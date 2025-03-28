import {db} from '../config/database.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'


// admin login function
export const logingAdmin = (req,res)=>{

    const q = "SELECT * FROM admin WHERE username = ?";
    db.query(q,[req.body.username],(err,data)=>{
        if(err) return res.status(500).json(err);
        if(data.length === 0 )return res.clearCookie('accessToken').status(404).json("User not found!");

        // check encrypt password

        const checkPassword = bcrypt.compareSync(req.body.password,data[0].password);
        if(!checkPassword) return res.clearCookie('accessToken').status(400).json("Wrong password or username!");
        
        // if(data[0].is_super_admin === 1){
        //     // is super admin
        //     const token = jwt.sign({id: data[0].id},"secretkeySuperAdmin");
        //     // return without password
        //     const {password, ...others} = data[0];
        //     // assign cookie
        //     let thirtyDays = 1000 * 60 * 60 * 24 * 30;
            
        //     return res.cookie("accessToken",token,{
        //         maxAge: thirtyDays,
        //         secure:true,
        //         httpOnly: true,
        //         sameSite:"None",
        //     }).status(200).json(others);
        // }

        //  assign to token when user is right
        const token = jwt.sign({id: data[0].id},"secretkeyAdmin");
        // return without password
        const {password, ...others} = data[0];
        // assign cookie
        let thirtyDays = 1000 * 60 * 60 * 24 * 30;
        
        return res.cookie("accessToken",token,{
            maxAge: thirtyDays,
            secure:true,
            httpOnly: true,
            sameSite:"None",
        }).status(200).json(others);
    })
}


// lecture login function
export const loginLecture = (req,res)=>{

    const q = "SELECT * FROM lecture WHERE username = ?";
    db.query(q,[req.body.username],(err,data)=>{
        if(err) return res.status(500).json(err);
        if(data.length === 0 )return res.clearCookie('accessToken').status(404).json("User not found!");

        // check encrypt password

        const checkPassword = bcrypt.compareSync(req.body.password,data[0].password);
        if(!checkPassword) return res.clearCookie('accessToken').status(400).json("Wrong password or username!");
        
        //  assign to token when user is right

        const token = jwt.sign({id: data[0].lecture_id},"secretkeyLecture");
        // return without password
        const {password, ...others} = data[0];
        // assign cookie
        let thirtyDays = 1000 * 60 * 60 * 24 * 30;
        
        res.cookie("accessToken",token,{
            maxAge: thirtyDays,
            secure:true,
            httpOnly: true,
            sameSite:"None",
        }).status(200).json(others);
    })
}

// student login function
export const loginStudent = (req,res)=>{
    const {username,password} = req.body
    console.log(password)
    const password1 = password;
    const q = "SELECT * FROM student s WHERE s.username =  ?";
    db.query(q,[username],(err,data)=>{
        if(err) return res.status(500).json(err);
        if(data.length === 0 )return res.clearCookie('accessToken').status(404).json({message:"User not found!"});

        // check encrypt password

        const checkPassword = bcrypt.compareSync(password1,data[0].password);
        if(!checkPassword) return res.clearCookie('accessToken').status(400).json({message:"Wrong password or username!"});
        
        //  assign to token when user is right

        const token = jwt.sign({id: data[0].student_id},"secretkey");
        // return without password
        const {password, ...others} = data[0];
        others['success']=true;
        // assign cookie
        let thirtyDays = 1000 * 60 * 60 * 24 * 30;
        
        res.cookie("accessToken",token,{
            maxAge: thirtyDays,
            secure:true,
            httpOnly: true,
            sameSite:"None",
        }).status(200).json({
            ...others,
            accessToken: token  // Include token in the response
        });
    })
}