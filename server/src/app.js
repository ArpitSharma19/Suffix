const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");
const contentRoutes = require("./routes/contentRoutes");
const authRoutes = require("./routes/authRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const imageRoutes = require("./routes/imageRoutes");
const enquiryRoutes = require("./routes/enquiryRoutes");
 

const app = express();

app.use(cors({
    origin: true,
    credentials: true
}));
app.use(cookieParser());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/content", contentRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/images", imageRoutes);
app.use("/api/enquiries", enquiryRoutes);
console.log("[APP] Routes mounted: /api/enquiries");

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../client/dist')));

  app.get('/(.*)', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../../client', 'dist', 'index.html'));
  });
}

module.exports = app;
