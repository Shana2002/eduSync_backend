import express from 'express'
import auth from './routes/auth.js'
import lecture from './routes/lecture.js'
import cookieParser from 'cookie-parser'
import student from './routes/student.js'

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser())
// Routes
app.use("/v1/auth",auth)
app.use("/v1/lecture",lecture)
app.use("/v1/student",student)

app.get('/', (req,res)=>{
    res.send("hello world1")
});



export default app
