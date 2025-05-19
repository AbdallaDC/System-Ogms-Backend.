import app from "./app";
import connectDB from "./config/connect";

connectDB();

const PORT = 8800;

app.listen(PORT, () => {
  console.log("Server is running on port " + PORT);
});
