const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const notificationOptions = {
  timestamps: true,
};

const NotificationSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Please enter user"],
    },
    title: {
      type: String,
      required: [true, "Please enter title"],
    },
    text: {
      type: String,
      required: [true, "Please enter text"],
    },
  },
  notificationOptions
);

module.exports = mongoose.model("Notification", NotificationSchema);
