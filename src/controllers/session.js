import { db } from "../config/database.js";
import { checkToken } from "../utils/cookieCheck.js";
import { checkAvaialabelHalls } from "./hall.js";
import { assignAdmin } from "../utils/assign_admin.js";
import { module_assign } from "./module.js";

// checking if session available
function checkSessionName(req, callback) {
  const { moduleid, batch_id } = req.body;
  const q = ` SELECT 
                        ma.module_assign_id, m.sessions, COUNT(s.session_id) AS current_sessions 
                    FROM module_assign AS ma 
                    LEFT JOIN module AS m ON m.module_id = ma.module_id
                    LEFT JOIN session AS s ON s.module_asign_id = ma.module_assign_id
                    WHERE ma.module_id = ? AND ma.batch_id = ?`;

  db.query(q, [moduleid, batch_id], (err, data) => {
    if (err) return callback(err); // No need to wrap in `new Error`

    if (data.length === 0) {
      return callback(null, 1); // No sessions found, start with session 1
    }

    const { sessions, current_sessions } = data[0];

    if (sessions === current_sessions) {
      return callback(new Error("This module has already completed its sessions"));
    }

    return callback(null, current_sessions + 1);
  });
}
export const addSession = (req, res) => {
  try {
    checkToken(req, res, "secretkeyAdmin", (err, userInfo) => {
      if (err) return res.status(400).json(err);

      checkAvaialabelHalls(req, (err, availableHalls) => {
        if (err) return res.status(400).json({ message: err.message });

        const { module_assign_id, shedule_data, start_time, end_time, hall_id } = req.body;

        if (!Array.isArray(availableHalls) || !availableHalls.includes(hall_id)) {
          return res.status(400).json({ message: `Hall no ${hall_id} is already booked` });
        }

        checkSessionName(req, (err, session) => {
          if (err) return res.status(400).json({ message: err.message });

          const session_name = `Session ${session}`;
          const insertSessionQuery = "INSERT INTO `session`(`module_asign_id`, `session_name`) VALUES (?)";

          db.query(insertSessionQuery, [[module_assign_id, session_name]], (err, sessionResult) => {
            if (err) return res.status(500).json(err);
            const session_id = sessionResult.insertId;

            const insertSheduleQuery =
              "INSERT INTO `shedule`(`session_id`, `shedule_date`, `star_time`, `end_time`, `hall_id`) VALUES (?)";

            db.query(
              insertSheduleQuery,
              [[session_id, shedule_data, start_time, end_time, hall_id]],
              (err) => {
                if (err) return res.status(500).json(err);
                return res.status(200).json("Schedule added successfully");
              }
            );
          });
        });
      });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


export const addSession1 = (req, res) => {
  // check admin token
  // console.log(req);
  try {
    checkToken(req, res, "secretkeyAdmin", (err, userInfo) => {
      if (err) return res.status(400).json(err);
  
      // assignAdmin(req, userInfo, (err, data) => {
        // if (err) return res.status(500).json(err.message);
  
        // checkAvaialabelHalls
        checkAvaialabelHalls(req, (err, data) => {
          if (err) return res.status(400).json(err.message);
  
          const {
            module_assign_id,
            shedule_data,
            start_time,
            end_time,
            hall_id,
          } = req.body;
  
          if (!data.includes(hall_id))
            return res.status(400).json({message:`hall no ${hall_id} already booked`});
  
          // check availabe sessions
          checkSessionName(req, (err, session) => {
            if (err) return res.status(400).json({message:err.message});
  
            // session name createing
            const session_name = `Session ${session}`;
            const q =
              "INSERT INTO `session`(`module_asign_id`, `session_name`) VALUES (?)";
            db.query(q, [[module_assign_id, session_name]], (err, data) => {
              if (err) return res.status(500).json(err);
              const session_id = data.insertId;
  
              // creating shedule
              const q =
                "INSERT INTO `shedule`(`session_id`, `shedule_date`, `star_time`, `end_time`, `hall_id`) VALUES (?)";
              db.query(
                q,
                [[session_id, shedule_data, start_time, end_time, hall_id]],
                (err, data) => {
                  if (err) return res.status(500).json(err);
                  return res.status(200).json("Shedule add successfull");
                }
              );
            });
          });
        });
      // });
    });
  } catch (error) {
    console.log(error);
  }
};


export const getSessions = (req, res) =>{
  const date = req.params.date;

  const q = `SELECT * FROM shedule AS sh 
              LEFT JOIN session AS s ON s.session_id = sh.session_id
              LEFT JOIN module_assign AS ma ON ma.module_assign_id = s.module_asign_id
              LEFT JOIN module AS m ON m.module_id = ma.module_id
              WHERE sh.shedule_date = ?`;
        db.query(q,[date],(err,data)=>{
            if (err) return res.status(500).json(err);

            return res.status(200).json(data);
        })
}

export const getSessionsLectrue = (req, res) =>{
  checkToken(req,res,'secretkeyLecture',(err,userInfo)=>{
    if(err) return res.status(500).json(err.message)
    const {date} = req.params;

  const q = `SELECT * FROM shedule AS sh 
              LEFT JOIN session AS s ON s.session_id = sh.session_id
              LEFT JOIN module_assign AS ma ON ma.module_assign_id = s.module_asign_id
              LEFT JOIN module AS m ON m.module_id = ma.module_id
              WHERE sh.shedule_date = ? AND ma.lecture_id = ?`;
        db.query(q,[date,userInfo.id],(err,data)=>{
            if (err) return res.status(500).json(err);

            return res.status(200).json(data);
        })
  })
}

export const getSessionName = (req,res)=>{
    const {module , batch} = req.query;

    if (!module || !batch) return res.status(400).json({ message: "Missing required parameters: name and age" });
    console.log(`${module} and ${batch}`);
    const q = `SELECT s.*,ma.*,l.first_name,l.last_name FROM module_assign AS ma
              LEFT JOIN session AS s ON s.module_asign_id = ma.module_assign_id
              LEFT JOIN lecture AS l ON l.lecture_id = ma.lecture_id
              WHERE ma.batch_id =? AND ma.module_id=?`

    db.query(q,[batch,module],(err,data)=>{
      if (err) return res.status(500).json(err);

      if(!data || data.length ===0){
        return res.status(200).json({session:"Session 1",lecture:null});
      }
      else{
      return res.status(200).json({session:`Session ${data.length+1}`,lecture:data[0].first_name +` `+data[0].last_name ,module_assign:data[0].module_assign_id});
      }
    })
}

export const getCurrentSession = (req, res) =>{
  checkToken(req,res,'secretkeyLecture',(err,userInfo)=>{
    if(err) return res.status(500).json(err.message)

  const q = `SELECT *,p.title AS program FROM 
                session AS s 
            LEFT JOIN 
                shedule AS sh ON sh.session_id = s.session_id
            LEFT JOIN 
              module_assign AS ma ON ma.module_assign_id = s.module_asign_id
              LEFT JOIN batch b ON b.batch_id = ma.batch_id
              LEFT JOIN program p ON p.program_id = b.program_id
              LEFT JOIN module m ON m.module_id = ma.module_id
            WHERE 
              ma.lecture_id = 8 AND
                sh.shedule_date = CURRENT_DATE AND 
                (sh.star_time <= CURRENT_TIME AND sh.end_time > CURRENT_TIME)`;
        db.query(q,[userInfo.id],(err,data)=>{
            if (err) return res.status(500).json(err);

            return res.status(200).json(data);
        })
  })
}