"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/modules/driver/driver.routes.ts
const express_1 = require("express");
const driver_controller_1 = require("./driver.controller");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const ride_controller_1 = require("../rider/ride.controller");
const driver_validation_1 = require("./driver.validation");
const validate_middleware_1 = require("../../middlewares/validate.middleware");
const ride_validation_1 = require("../rider/ride.validation");
const router = (0, express_1.Router)();
router.patch("/availability", auth_middleware_1.protect, (0, auth_middleware_1.authorize)("driver"), (0, validate_middleware_1.validate)(driver_validation_1.availabilitySchema), driver_controller_1.setAvailability);
// Ride actions
router.patch("/rides/:id/accept", auth_middleware_1.protect, (0, auth_middleware_1.authorize)("driver"), ride_controller_1.acceptRide);
router.patch("/rides/:id/status", auth_middleware_1.protect, (0, auth_middleware_1.authorize)("driver"), (0, validate_middleware_1.validate)(ride_validation_1.updateRideStatusSchema), ride_controller_1.updateRideStatus);
router.get("/rides/earnings", auth_middleware_1.protect, (0, auth_middleware_1.authorize)("driver"), ride_controller_1.getEarnings);
exports.default = router;
