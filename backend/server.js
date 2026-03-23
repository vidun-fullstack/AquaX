const express = require("express");
const http = require("http");
const cors = require("cors");
const dotenv = require("dotenv");
const { Server } = require("socket.io");

dotenv.config();

require("./db"); // CONNECT POSTGRESQL HERE

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" }
});

app.use(cors());
app.use(express.json());

app.set("io", io); // make socket available globally

// Import routes
const authRoutes = require("./routes/authRoutes");
const metricRoutes = require("./routes/metricRoutes");
const alertRoutes = require("./routes/alertRoutes");
const deviceRoutes = require("./routes/deviceRoutes");
const sensorRoutes = require("./routes/sensorRoutes");
const advancedRoutes = require("./routes/advancedRoutes");

// Use routes
app.use("/api/auth", authRoutes);
app.use("/api/metrics", metricRoutes);
app.use("/api/alerts", alertRoutes);
app.use("/api/devices", deviceRoutes);
app.use("/api/sensors", sensorRoutes);
app.use("/api/advanced", advancedRoutes);

// WebSocket connection
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

