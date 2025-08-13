require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();
app.use(cors());
app.use(express.json());

connectDB();

app.use("/api/auth", require("./routes/auth"));
app.use("/api/drivers", require("./routes/driver"));
app.use("/api/routes", require("./routes/route"));
app.use("/api/orders", require("./routes/order"));
app.use("/api/simulation", require("./routes/simulation"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
