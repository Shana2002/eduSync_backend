import {db} from '../config/database.js'
import {checkToken} from '../utils/cookieCheck.js'

export const generateAttendanceQR = async (req, res) => {
    try {
        // Check token, only lectures can generate QR codes
        // checkToken(req, res, 'secretkeyLecture', async (err, userInfo) => {
            // if (err) return res.status(400).json(err.message);

            const { session_id, qr_id, remarks } = req.body;

            // Query to check session timing
            const check_time = `SELECT * FROM 
                                    session AS s 
                                LEFT JOIN 
                                    shedule AS sh ON sh.session_id = s.session_id 
                                WHERE
                                    s.session_id = ? AND 
                                    sh.shedule_date = CURRENT_DATE AND 
                                    (sh.star_time <= CURRENT_TIME AND sh.end_time > CURRENT_TIME)`;

            db.query(check_time, [session_id], async (err, data) => {
                if (err) return res.status(500).json(err);
                if (!data.length) return res.status(400).json("Session is expired or not started yet");

                try {
                    // If regenerating a QR code, delete previous records
                    if (qr_id) {
                        await new Promise((resolve, reject) => {
                            db.query('DELETE FROM student_attendance WHERE session_id = ?', [session_id], (err) => {
                                if (err) return reject(err);
                                resolve();
                            });
                        });

                        await new Promise((resolve, reject) => {
                            db.query("UPDATE qr_usage SET status = 'canceled', remarks = ? WHERE code = ?", [remarks, qr_id], (err) => {
                                if (err) return reject(err);
                                resolve();
                            });
                        });
                    }

                    // Generate random QR code with session ID
                    const random_number = Math.floor(Math.random() * 1000000);
                    const gen_qr = `${random_number}SESSION${session_id}`;

                    // Insert the QR code into the database
                    const insert_qr_query = 'INSERT INTO `qr_usage`(`code`, `session_id`) VALUES (?, ?)';
                    db.query(insert_qr_query, [gen_qr, session_id], (err, result) => {
                        if (err) return res.status(500).json(err);

                        // Send QR code in response
                        return res.status(200).json({ qr: gen_qr });
                    });

                } catch (error) {
                    return res.status(500).json(error);
                }
            });
        // });
    } catch (error) {
        console.log(error);
        return res.status(500).json("Internal Server Error");
    }
};


// marking attendace using qr
export const markattendacebtQr = (req,res) =>{

    // check token this can be doing student
    checkToken(req,res,'secretkey',(err,userInfo)=>{
        if (err) return res.status(400).json(err.message);

        // get code usibg params
        const {code} = req.params;

        // get qr valid and its status
        const q = "SELECT * FROM qr_usage WHERE code = ? AND status = 'active'";
        db.query(q,[code],(err,data)=>{
            if (err) return res.status(500).json(err);
            if (!data.length || data.length>1) return res.status(400).json("Invalid QR code");

            // check date qr code can be mark for attendance 
            const issue_time = new Date(data.create_at.replace(' ', 'T'));
            const end_time = new Date(issue_time.getTime() + 5 * 60 * 1000);
            const current_time = new Date();
            if (end_time < current_time) return res.status(400).json("QR code expired");
            // get session id from qr table
            const  session = data.session_id;

            // check student already mark attendace ?
            const chechmark = 'SELECT * FROM `student_attendance` WHERE `student_id`= ? AND `session_id` = ?';
            db.query(chechmark,[userInfo.id,session],(err,data)=>{
                if (err) return res.status(500).json(err);
                if (data.length) return res.status(500).json("Already Mark attendance");

                // if not mark attendce student
                const mark = 'INSERT INTO `student_attendance`(`student_id`, `session_id`, `marks_as`)  VALUES (?)';
                db.query(mark,[[userInfo.id,session,'qr']],(err,data)=>{
                    if (err) return res.status(500).json(err);

                    return res.status(200).json("Attendance marked successful !");
                })
            })
        })
    })
}

