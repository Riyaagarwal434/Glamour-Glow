const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());

// Serve static files from public folder
app.use(express.static(path.join(__dirname, "public")));


app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});

const mongoose = require("mongoose");
require("dotenv").config();

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("DB Connected ✅"))
  .catch(err => console.log(err));

const bookingRoutes = require("./routes/bookingRoutes");

app.use("/api", bookingRoutes);