const User = require("../models/user");
const Notification = require("../models/notification");
const { handleErrors } = require("../middleware/errMiddleware");

const getNotifications = async (req, res) => {
  const id = req.params.id;

  try {
    const notifications = await User.findById(id, "notifications").populate(
      "notifications"
    );
    if (!notifications) throw Error("Invalid user ID");

    res.status(200).json(notifications);
  } catch (err) {
    const errors = handleErrors(err);
    res.status(400).json(errors);
  }
};

const postNotifications = async (req, res) => {
  const { userId } = req.body;

  try {
    // if user ID is not valid, do not proceed
    const user = await User.findById(userId).populate("notifications");
    if (!user) throw Error("Invalid user ID");

    const newNotif = await Notification.create(req.body);

    user.notifications.push(newNotif);
    await user.save();

    res.status(200).json({ message: "Notification posted" });
  } catch (err) {
    const errors = handleErrors(err);
    res.status(400).json(errors);
  }
};

const deleteNotifications = async (req, res) => {
  const id = req.params.id;

  try {
    // if the notification ID is not valid, do not proceed
    const notification = await Notification.findById(id).populate("userId");
    if (!notification) throw Error("Invalid notification ID");

    // remove notification from the user's notifications
    notification.userId.notifications.pull({ _id: id });
    await notification.userId.save();
    await notification.deleteOne();

    res.status(200).json({ message: "Delete notification successful" });
  } catch (err) {
    const errors = handleErrors(err);
    res.status(400).json(errors);
  }
};

module.exports = { getNotifications, postNotifications, deleteNotifications };
