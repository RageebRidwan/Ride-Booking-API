"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/modules/ride/ride.routes.ts
const express_1 = require("express");
const ride_controller_1 = require("./ride.controller");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const validate_middleware_1 = require("../../middlewares/validate.middleware");
const ride_validation_1 = require("./ride.validation");
const router = (0, express_1.Router)();
router.post("/request", auth_middleware_1.protect, (0, auth_middleware_1.authorize)("rider"), (0, validate_middleware_1.validate)(ride_validation_1.requestRideSchema), ride_controller_1.requestRide);
router.patch("/:id/cancel", auth_middleware_1.protect, (0, auth_middleware_1.authorize)("rider"), ride_controller_1.cancelRide);
router.get("/me", auth_middleware_1.protect, (0, auth_middleware_1.authorize)("rider"), ride_controller_1.getRideHistory);
router.patch("/:rideId/rate-driver", auth_middleware_1.protect, (0, auth_middleware_1.authorize)("rider"), (0, validate_middleware_1.validate)(ride_validation_1.rateDriverSchema), ride_controller_1.rateDriver);
router.patch("/:rideId/feedback", auth_middleware_1.protect, (0, auth_middleware_1.authorize)("rider"), (0, validate_middleware_1.validate)(ride_validation_1.riderFeedbackSchema), ride_controller_1.leaveFeedback);
router.get("/drivers/nearby", auth_middleware_1.protect, (0, auth_middleware_1.authorize)("rider"), (0, validate_middleware_1.validate)(ride_validation_1.nearbyDriversSchema), ride_controller_1.findNearbyDrivers);
exports.default = router;
