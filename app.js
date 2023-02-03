const express = require("express");
const app = express();
const morgan = require("morgan");
const mongoose = require("mongoose");
const fs = require("fs");
const cors = require("cors");
require("dotenv/config");
const authJwt = require("./helpers/jwt");
const errorHandler = require("./helpers/error-handler");

app.use(cors());
app.options("*", cors());

const api = process.env.API_URL;

// Middleware

app.use(express.json());
app.use(morgan("tiny"));
app.use(authJwt());

// Routers
const usersRoutes = require("./routes/users");

const scoring = require("./routes/scoring");

app.use(`${api}/users`, usersRoutes);

app.use(`${api}/scoring`, scoring);
//get files
app.get("/files/:file_name", (req, res)=>{

  var file = './public/file/' + req.params.file_name;

  if(!fs.existsSync(file)){
    res.status(404).json({
      message:"not found: " +  req.params.file_name
    })
    return
  }else{
    res.download(file)
  }  
})
mongoose.set("strictQuery", false);
mongoose
  .connect(process.env.CONNECTION_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to the database successfully");
  })
  .catch(() => {
    console.log("Connection failed");
  });

app.listen(process.env.PORT || 8080, () => {
  console.log("server is running http://localhost:8080");
});
