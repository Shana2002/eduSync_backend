import { db } from "../config/database.js";
import { checkToken } from "../utils/cookieCheck.js";

export const createBatch = (req, res) => {
  //checkToken(req,res,'secretkeySuperAdmin',(err,userInfo)=>{
  //  if (err) return res.status(400).json(err.message);
  console.log(req.body);
  const { program, start_Date } = req.body;
  const q =
    "INSERT INTO `batch`(`program_id`, `start_date`, `managed_by`) VALUES (?)";
  db.query(q, [[program, start_Date, 1]], (err, data) => {
    if (err) console.log(err);
    if (err) return res.status(500).json(err);

    return res.status(200).json("Batch Create successful");
  });
  //})
};

export const viewBatchs = (req, res) => {
  // checkToken(req,res,'secretkeySuperAdmin',(err,userInfo)=>{
  const q =
    "SELECT * FROM batch AS b LEFT JOIN program AS p ON p.program_id = b.program_id";
  db.query(q, [], (err, data) => {
    if (err) return res.status(500).json(err);

    return res.status(200).json(data);
  });
  // })
};

export const viewBatch = (req, res) => {
  // checkToken(req,res,'secretkeySuperAdmin',(err,userInfo)=>{
  const { id } = req.params;
  const q =
    "SELECT * FROM batch AS b LEFT JOIN program AS p ON p.program_id = b.program_id WHERE batch_id =?";
  db.query(q, [id], (err, data) => {
    if (err) return res.status(500).json(err);

    return res.status(200).json(data[0]);
  });
  // })
};

export const viewBatchstudent = (req, res) => {
  // checkToken(req,res,'secretkeyAdmin',(err,userInfo)=>{
  const { id } = req.params;
  const q = `SELECT * FROM student_enroll AS se
                    LEFT JOIN student AS s ON s.student_id = se.student_id
                    WHERE se.batch_id =?`;
  db.query(q, [id], (err, data) => {
    if (err) return res.status(500).json(err);

    return res.status(200).json(data);
  });
  // })
};

const queryPromise = (query, params) => {
  return new Promise((resolve, reject) => {
    db.query(query, params, (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
};

export const BatchLectureDetails = async (req, res) => {
  try {
    const id = req.params.id;
    let result = [];

    // Fetch batch ID
    const checkBatch = `SELECT program_id FROM batch WHERE batch_id = ? `;
    const programData = await queryPromise(checkBatch, [id]);
    const program_id = programData[0]?.program_id;
    if (!program_id) return res.status(500).json("Batch not found");

    // Fetch modules for the program
    const moduleQuery = `SELECT * FROM program_module AS pm
                           LEFT JOIN module AS m ON m.module_id = pm.module_id
                           WHERE pm.program_id = ?`;
    const moduleData = await queryPromise(moduleQuery, [program_id]);
    if (!moduleData || moduleData.length === 0)
      return res.status(500).json("No modules found");

    // Process each module
    for (const module of moduleData) {
      // Fetch module assignment ID
      const moduleAssignQuery = `SELECT ma.*,l.lecture_id,l.first_name,l.last_name FROM module_assign AS ma
                                    LEFT JOIN lecture AS l ON l.lecture_id = ma.lecture_id
                                    WHERE ma.module_id = ? AND ma.batch_id = ?`;
      const moduleAssignData = await queryPromise(moduleAssignQuery, [
        module.module_id,
        id,
      ]);

      // if (!moduleAssignId) return res.status(500).json("Module assignment not found");
      if (moduleAssignData.length === 0 || !moduleAssignData) {
        const resultAdd = { module: module, lecture: null };
        result.push(resultAdd);
      } else {
        const resultAdd = { module: module, lecture: moduleAssignData };
        result.push(resultAdd);
      }
    }

    return res.status(200).json(result);
  } catch (error) {
    console.log(error);
    return res.status(500).json(error);
  }
};
