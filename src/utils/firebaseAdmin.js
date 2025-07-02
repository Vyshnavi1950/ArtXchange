import admin from "firebase-admin";
import fs from "fs";
import path from "path";

// 🔐 Full path to the JSON file
const serviceAccountPath = path.resolve("serviceAccountKey.json");

if (!fs.existsSync(serviceAccountPath)) {
  console.error("❌  Firebase service account key not found at:", serviceAccountPath);
  process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf-8"));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export default admin;
