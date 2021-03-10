/*
 * Routes dedicated to handling requests from patients or requests pertaining
 * to patients
 */

const express = require("express");
const authController = require("../controllers/authController");
const userController = require("../controllers/userController");
const appointController = require("../controllers/appointController");
const searchController = require("../controllers/searchController");
const stripeController = require("../controllers/stripeController");
const notifController = require("../controllers/notifController");
const { requireAuth } = require("../middleware/authMiddleware");
const router = express.Router();

// Convenient endpoint for viewing all patients, not intended to be called by frontend
router.get("/", userController.getPatients);

/*
 * Routes relating to patient authentication
 */
router.post("/signup", authController.signupPatient);

router.post("/signin", authController.signinPatient);

router.get("/signout", authController.signoutPatient);

/*
 * Routes relating to patient search for doctors based on symptoms
 */
router.post("/search", requireAuth, searchController.findDoctor);

/*
 * Routes relating to patient payment to doctor
 */
router.post("/pay", requireAuth, stripeController.createPaymentIntent);

/*
 * Routes relating to patient CRUD database operations
 */
router.get("/:id", requireAuth, userController.getPatientById);

router.put("/:id", requireAuth, userController.putPatientById);

router.delete("/:id", requireAuth, userController.deletePatientById);

/*
 * Routes relating to appointment booking
 */
router.get("/appointment/:id", requireAuth, appointController.getAppointments);

router.post("/appointment", requireAuth, appointController.postAppointment);

router.put("/appointment/:id", requireAuth, appointController.putAppointment);

router.delete(
  "/appointment/:id",
  requireAuth,
  appointController.deleteAppointment
);

/*
 * Routes relating to push notifications
 */
router.get("/notif/:id", requireAuth, notifController.getNotifications);

router.post("/notif", requireAuth, notifController.postNotifications);

router.delete("/notif/:id", requireAuth, notifController.deleteNotifications);

module.exports = router;
