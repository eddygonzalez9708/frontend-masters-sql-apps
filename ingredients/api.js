const path = require("path");
const express = require("express");
const router = express.Router();

// client side static assets
router.get("/", (_, res) => res.sendFile(path.join(__dirname, "./index.html")));
router.get("/client.js", (_, res) =>
  res.sendFile(path.join(__dirname, "./client.js"))
);

/**
 * Student code starts here
 */

// connect to postgres

const pg = require("pg");
const pool = new pg.Pool({
  user: "postgres",
  host: "localhost",
  database: "recipeguru",
  password: "lol",
  port: 5432
})

router.get("/type", async (req, res) => {
  const { type } = req.query;
  console.log("get ingredients", type);

  try {
    // return all ingredients of a type
    const { rows } = await pool.query(`SELECT * FROM ingredients WHERE type = $1`, [type])
    res.json({ rows })
  } catch {
    res.status(501).json({ status: "not implemented", rows: [] });
  }
});

router.get("/search", async (req, res) => {
  let { term, page } = req.query;
  page = Number(page ? page : 0);
  console.log("search ingredients", term, page);

  // return all columns as well as the count of all rows as total_count
  // make sure to account for pagination and only return 5 rows at a time
  try {
    const { rows } = await pool.query(`SELECT *, COUNT(*) OVER() ::INT AS total_count FROM ingredients WHERE LOWER(CONCAT(type, title)) ILIKE LOWER($1)`, [`%${term}%`])
    res.json({ rows: rows.slice(page*5, (page*5)+5) })
  } catch {
    res.status(501).json({ status: "not implemented", rows: [] });
  }
});

/**
 * Student code ends here
 */

module.exports = router;
