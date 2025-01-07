import express from 'express'
import auth from './routes/auth.js'
import lecture from './routes/lecture.js'
import cookieParser from 'cookie-parser'

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser())
// Routes
app.use("/v1/auth",auth)
app.use("/v1/lecture",lecture)

app.get('/', (req,res)=>{
    res.send("hello world1")
});



export default app
