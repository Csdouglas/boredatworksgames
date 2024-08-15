// Database structure

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());

mongoose.connect("your-mongodb-connection-string", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const crosswordSchema = new mongoose.Schema({
  date: String,
  grid: Array,
  clues: {
    across: Array,
    down: Array,
  },
});

const Crossword = mongoose.model("Crossword", crosswordSchema);

app.get("/crossword", async (req, res) => {
  const today = new Date().toISOString().split("T")[0];
  const crossword = await Crossword.findOne({ date: today });
  res.json(crossword);
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
