import express from 'express'

const app = express();

// Middleware
app.use(express.json());

// Routes
app.use('/', (req,res)=>{
    res.send("hello world")
});

export default app
