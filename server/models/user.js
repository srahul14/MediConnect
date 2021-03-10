const mongoose = require("mongoose");
const { isEmail } = require("validator");
const bcrypt = require("bcryptjs");
const Schema = mongoose.Schema;

const userOptions = {
  discriminatorKey: "userkey",
  collection: "users",
  timestamps: true,
};

// Schema of a user which contains important fields that both patient and doctor
// schemas will inherit from
const UserSchema = new Schema(
  {
    first_name: {
      type: String,
      required: [true, "Please enter your first name"],
      trim: true,
    },
    last_name: {
      type: String,
      required: [true, "Please enter your last name"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Please enter email"],
      trim: true,
      unique: true,
      validate: [isEmail, "Please enter valid email"],
    },
    password: {
      type: String,
      required: [true, "Please enter password"],
      minlength: [8, "Password must be at least 8 characters long"],
    },
    age: {
      type: Number,
      default: 0,
      // required: true,
      min: [0, "Age must be at least 0"],
    },
    appointments: [{ type: Schema.Types.ObjectId, ref: "Appointment" }],
    notifications: [{ type: Schema.Types.ObjectId, ref: "Notification" }],
  },
  userOptions
);

// Hash the password before doc saved to db
UserSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    const salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } else {
    next();
  }
});

// Static method to login user
UserSchema.statics.login = async function (email, password) {
  let err = {};
  if (email === undefined) {
    throw Error("Please enter email");
  }
  if (password === undefined) {
    throw Error("Please enter password");
  }

  const user = await this.findOne({ email });

  if (user) {
    // auth is truthy if provided password matches password in database
    const auth = await bcrypt.compare(password, user.password);
    if (auth) {
      return user;
    }
    throw Error("Incorrect password");
  }
  throw Error("Incorrect email");
};

module.exports = mongoose.model("User", UserSchema);
