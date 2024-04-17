import { S3 } from "@aws-sdk/client-s3";
import fs from "node:fs";

import sql from "better-sqlite3";
import slugify from "slugify";
import xss from "xss";
const s3 = new S3({
  region: "us-east-2",
});
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

export async function saveMeal(meal) {
  meal.slug = slugify(meal.title, { lower: true });
  meal.instructions = xss(meal.instructions);
  //#region file upload
  const extension = meal.image.name.split(".").pop();
  const fileName = `${meal.slug}.${extension}`;
  const bufferedImage = await meal.image.arrayBuffer();

  await s3.putObject({
    Bucket: "jeremyrutherford-nextjs-demo-users-image",
    Key: fileName,
    Body: Buffer.from(bufferedImage),
    ContentType: meal.image.type,
  });

  // const stream = fs.createWriteStream(`public/images/${fileName}`);

  // stream.write(Buffer.from(bufferedImage), (error) => {
  //   if (error) {
  //     throw new Error("Saving image failed!");
  //   }
  // });
  meal.image = `${fileName}`;
  //#endregion

  db.prepare(
    `INSERT INTO meals (title, summary, instructions, creator, creator_email, slug, image) 
  VALUES (@title, @summary, @instructions, @creator, @creator_email, @slug, @image)`
  ).run(meal);
}
