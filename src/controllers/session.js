import { db } from "../config/database.js";
import { checkToken } from "../utils/cookieCheck.js";
import { checkAvaialabelHalls } from "./hall.js";
import { assignAdmin } from "../utils/assign_admin.js";

// checking if session available
function checkSessionName(req, callback) {
  const { moduleid, batch_id } = req.body;
  var session = 0;
  const q = ` SELECT 
                        ma.module_assign_id,m.sessions,COUNT(s.session_id) AS current_sessions FROM module_assign AS ma 
                    LEFT JOIN 
                        module AS m on m.module_id = ma.module_id
                    LEFT JOIN 
                        session AS s on s.module_asign_id = ma.module_assign_id
                    WHERE 
                        ma.module_id = ? AND ma.batch_id = ?`;

  db.query(q, [moduleid, batch_id], (err, data) => {
    if (err) return callback(new Error(err));

    if (data.sessions === current_sessions)
      return callback(new Error("This module already complete it's sessions"));
    if (!data.current_sessions) {
      return callback(null, 1);
    } else {
      return callback(null, data.current_sessions + 1);
    }
  });
}

export const addSession = (req, res) => {
  // check admin token
  checkToken(req, res, "secretkeyAdmin", (err, userInfo) => {
    if (err) return res.status(400).json(err);

    assignAdmin(req, userInfo, (err, data) => {
      if (err) return res.status(500).json(err.message);

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
          return res.status(400).json(`hall no ${hall_id} already booked`);

        // check availabe sessions
        checkSessionName(req, (err, session) => {
          if (err) return res.status(400).json(err.message);

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
    });
  });
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

export const getSessionName = (req,res)=>{
    const {module , batch} = req.query;

    if (!module || !batch) return res.status(400).json({ message: "Missing required parameters: name and age" });
    console.log(`${module} and ${batch}`);
    const q = `SELECT * FROM module_assign AS ma
                  LEFT JOIN session AS s ON s.module_asign_id = ma.module_assign_id
                  WHERE ma.batch_id =? AND ma.module_id=?`

    db.query(q,[batch,module],(err,data)=>{
      if (err) return res.status(500).json(err);

      if(!data || data.length ===0){
        return res.status(200).json({session:"Session 1"});
      }
      else{
      return res.status(200).json({session:`Session ${data.length+1}`});
      }
    })
}