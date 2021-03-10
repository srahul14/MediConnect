const mongoose = require("mongoose");

// Set up default mongoose connection
const mongoDB = process.env.DB_CONNECTION;

const initMongo = () => {
  mongoose
    .connect(mongoDB, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false,
    })
    .then((result) => console.log("Connected to MongoDB!\n"))
    .catch((err) => console.log(err));
};

const closeMongo = () => {
  mongoose.connection.close();
  console.log("MongoDB connection closed\n");
};

module.exports = { initMongo, closeMongo };
