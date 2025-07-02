import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

await mongoose.connect(process.env.MONGO_URI);

const User = mongoose.model("User", new mongoose.Schema({}, { strict: false }));

console.log("🧹  Removing duplicate users …");
const dups = await User.aggregate([
  { $group: { _id: "$email", ids: { $push: "$_id" }, n: { $sum: 1 } } },
  { $match: { n: { $gt: 1 } } },
]);

for (const { ids } of dups) {
  ids.shift();                     // keep the first id
  await User.deleteMany({ _id: { $in: ids } });
}
console.log("✅  Done – duplicates removed.");
process.exit();
