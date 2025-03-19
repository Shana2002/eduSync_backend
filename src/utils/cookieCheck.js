import jwt from 'jsonwebtoken'

export function checkCookies(token,type){
    jwt.verify(token,type,(err,userInfo)=>{
        if (err) return false
        return userInfo
    })
}

export function checkToken(req,res,type,callback){
    const token = req.cookies.accessToken;
    if (!token) {
        return callback(new Error('User not fount'));
    }

    jwt.verify(token,type,(err,userInfo)=>{
        if (err) return res.status(403).json("Token is not valid");
        callback(null,userInfo)
    })

}