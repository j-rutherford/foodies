import sql from "better-sqlite3";

const db = sql("meals.db");

export async function getMeals() {
  //added promise below for dummy delay
  await new Promise((resolve) => setTimeout(resolve, 2000));
  // throw new Error("Loading meals failed");
  return db.prepare("SELECT * FROM meals").all(); //.all(), .get(), .run() for non-queries
}

export function getMeal(slug) {
  return db.prepare("SELECT * FROM meals WHERE slug = ?").get(slug);
}
