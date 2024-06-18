const path = require("path");
const express = require("express");
const router = express.Router();

// client side static assets
router.get("/", (_, res) => res.sendFile(path.join(__dirname, "./index.html")));
router.get("/client.js", (_, res) =>
  res.sendFile(path.join(__dirname, "./client.js"))
);
router.get("/detail-client.js", (_, res) =>
  res.sendFile(path.join(__dirname, "./detail-client.js"))
);
router.get("/style.css", (_, res) =>
  res.sendFile(path.join(__dirname, "../style.css"))
);
router.get("/detail", (_, res) =>
  res.sendFile(path.join(__dirname, "./detail.html"))
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

router.get("/search", async function (req, res) {
  console.log("search recipes");

  // return recipe_id, title, and the first photo as url
  //
  // for recipes without photos, return url as default.jpg

  try {
    const { rows } = await pool.query(
      `SELECT DISTINCT ON (r.recipe_id) 
      r.recipe_id as recipe_id, r.title AS title, COALESCE(rp.url, 'default.jpg') AS url 
      FROM recipes_photos rp
      RIGHT JOIN recipes r
      ON r.recipe_id = rp.recipe_id`)
      res.json({ rows })
  } catch {
    res.status(501).json({ status: "not implemented", rows: [] });
  }
});

router.get("/get", async (req, res) => {
  const recipeId = req.query.id ? +req.query.id : 1;
  console.log("recipe get", recipeId);

  // return all ingredient rows as ingredients
  //    name the ingredient image `ingredient_image`
  //    name the ingredient type `ingredient_type`
  //    name the ingredient title `ingredient_title`
  //
  //
  // return all photo rows as photos
  //    return the title, body, and url (named the same)
  //
  //
  // return the title as title
  // return the body as body
  // if no row[0] has no photo, return it as default.jpg

  try {
    const { rows: ingredients } = await pool.query(
      `SELECT i.image AS ingredient_image, i.type AS ingredient_type, i.title AS ingredient_title 
      FROM ingredients i
      INNER JOIN recipe_ingredients rp
      ON i.id = rp.ingredient_id
      WHERE recipe_id = $1;`,
      [recipeId]
    )

    const { rows: photos } = await pool.query(
      `SELECT r.title as title, r.body as body, COALESCE(rp.url, 'default.jpg') as url
      FROM recipes_photos rp 
      RIGHT JOIN recipes r
      ON r.recipe_id = rp.recipe_id 
      WHERE r.recipe_id = $1`,
      [recipeId]
    )

    res.json({
      title: photos[0].title,
      body: photos[0].body,
      ingredients,
      photos: photos.map((photo) => photo.url)
    })
  } catch {
    res.status(501).json({ status: "not implemented" });
  }
});
/**
 * Student code ends here
 */

module.exports = router;
