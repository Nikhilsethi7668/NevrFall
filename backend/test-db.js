import connectDB from "./Config/db.js";
connectDB().then(() => {
  console.log('success');
  process.exit(0);
}).catch(e => {
  console.error('ERROR-FROM-TEST:', e);
  process.exit(1);
});
