import { db } from "../config/database.js";
import { checkToken } from "./cookieCheck.js";

export const assignAdmin = (req, userInfo, callback) => {
  const { batch_id } = req.body;
  const q = "SELECT * FROM batch WHERE batch_id =? AND managed_by = ?";

  db.query(q, [batch_id, userInfo.id], (err, data) => {
    if (err) return new Error("Internal Server Error");

    if (data.lenght === 1) {
      return null, data;
    } else {
      return new Error("Not managed");
    }
  });
};
