"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.findNearbyDrivers = exports.leaveFeedback = exports.rateDriver = exports.getEarnings = exports.updateRideStatus = exports.acceptRide = exports.getRideHistory = exports.cancelRide = exports.requestRide = void 0;
const ride_model_1 = require("./ride.model");
const haversine_distance_1 = __importDefault(require("haversine-distance"));
const user_model_1 = require("../user/user.model");
// Request a ride
const requestRide = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { pickup, destination } = req.body;
        if (!pickup || !destination)
            return res
                .status(400)
                .json({ message: "Pickup and destination required" });
        // Check active ride
        const activeRide = yield ride_model_1.Ride.findOne({
            riderId: req.user.id,
            status: { $in: ["requested", "accepted", "picked_up", "in_transit"] },
        });
        if (activeRide)
            return res
                .status(400)
                .json({ message: "You already have an active ride" });
        // Distance in km
        const distance = (0, haversine_distance_1.default)({ lat: pickup.lat, lng: pickup.lng }, { lat: destination.lat, lng: destination.lng }) / 1000;
        const baseFare = 50; // fixed starting fare
        const perKm = 20; // per km charge
        const fare = baseFare + distance * perKm;
        const ride = new ride_model_1.Ride({ riderId: req.user.id, pickup, destination, fare });
        yield ride.save();
        res.status(201).json({ message: "Ride requested", ride });
    }
    catch (err) {
        res.status(500).json({ message: "Server error", err });
    }
});
exports.requestRide = requestRide;
// Cancel a ride
const cancelRide = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const ride = yield ride_model_1.Ride.findById(req.params.id);
        if (!ride)
            return res.status(404).json({ message: "Ride not found" });
        if (ride.riderId.toString() !== req.user.id)
            return res
                .status(403)
                .json({ message: "Not authorized to cancel this ride" });
        if (ride.status !== "requested")
            return res
                .status(400)
                .json({ message: "Cannot cancel after driver accepted" });
        const rider = yield user_model_1.User.findById(req.user.id);
        if (!rider)
            return res.status(404).json({ message: "Rider not found" });
        const now = new Date();
        const DAY = 24 * 60 * 60 * 1000;
        // Reset cancelAttempts if last cancel was more than 24h ago
        if (rider.lastCancelAt &&
            now.getTime() - rider.lastCancelAt.getTime() > DAY) {
            rider.cancelAttempts = 0;
        }
        if (rider.cancelAttempts >= 3) {
            return res
                .status(403)
                .json({ message: "Cancel limit reached. Try again later." });
        }
        ride.status = "cancelled";
        ride.timestamps.cancelledAt = new Date();
        yield ride.save();
        // Update rider cancel attempts
        rider.cancelAttempts = (rider.cancelAttempts || 0) + 1;
        rider.lastCancelAt = now;
        yield rider.save();
        res.status(200).json({ message: "Ride cancelled", ride });
    }
    catch (err) {
        res.status(500).json({ message: "Server error", err });
    }
});
exports.cancelRide = cancelRide;
// Get rider ride history
const getRideHistory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const rides = yield ride_model_1.Ride.find({ riderId: req.user.id }).sort({
            createdAt: -1,
        });
        res.status(200).json({ rides });
    }
    catch (err) {
        res.status(500).json({ message: "Server error", err });
    }
});
exports.getRideHistory = getRideHistory;
// Accept a ride
const acceptRide = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const driver = yield user_model_1.User.findById(req.user.id);
        if (!driver)
            return res.status(404).json({ message: "Driver not found" });
        // 1️⃣ Check if driver is approved
        if (driver.approvalStatus !== "approved") {
            return res.status(403).json({ message: "Driver not approved yet" });
        }
        // 2️⃣ Check if driver is online
        if (!driver.isOnline) {
            return res.status(403).json({ message: "Driver is currently offline" });
        }
        // 3️⃣ Check if driver already has an active ride
        const activeRide = yield ride_model_1.Ride.findOne({
            driverId: driver.id,
            status: { $in: ["accepted", "picked_up", "in_transit"] },
        });
        if (activeRide) {
            return res
                .status(403)
                .json({ message: "Driver is already on an active ride" });
        }
        const ride = yield ride_model_1.Ride.findById(req.params.id);
        if (!ride)
            return res.status(404).json({ message: "Ride not found" });
        if (ride.status !== "requested")
            return res.status(400).json({ message: "Ride cannot be accepted" });
        ride.driverId = req.user.id;
        ride.status = "accepted";
        ride.timestamps.acceptedAt = new Date();
        yield ride.save();
        res.status(200).json({ message: "Ride accepted", ride });
    }
    catch (err) {
        res.status(500).json({ message: "Server error", err });
    }
});
exports.acceptRide = acceptRide;
// Update ride status (picked_up → in_transit → completed)
const updateRideStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { status } = req.body;
        const ride = yield ride_model_1.Ride.findById(req.params.id);
        if (!ride)
            return res.status(404).json({ message: "Ride not found" });
        if (((_a = ride.driverId) === null || _a === void 0 ? void 0 : _a.toString()) !== req.user.id)
            return res.status(403).json({ message: "Not authorized" });
        const allowedStatuses = ["picked_up", "in_transit", "completed"];
        if (!allowedStatuses.includes(status))
            return res.status(400).json({ message: "Invalid status update" });
        ride.status = status;
        const timestampField = {
            picked_up: "pickedUpAt",
            in_transit: "inTransitAt",
            completed: "completedAt",
        }[String(status)];
        ride.timestamps[Number(timestampField)] = new Date();
        yield ride.save();
        res.status(200).json({ message: `Ride status updated to ${status}`, ride });
    }
    catch (err) {
        res.status(500).json({ message: "Server error", err });
    }
});
exports.updateRideStatus = updateRideStatus;
// Get driver earnings (sum of completed rides)
const getEarnings = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const rides = yield ride_model_1.Ride.find({
            driverId: req.user.id,
            status: "completed",
        });
        const earnings = Number(rides.reduce((total, ride) => total + (ride.fare || 0), 0).toFixed(2));
        res.status(200).json({ earnings, rides });
    }
    catch (err) {
        res.status(500).json({ message: "Server error", err });
    }
});
exports.getEarnings = getEarnings;
// src/modules/ride/ride.controller.ts
const rateDriver = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { rideId } = req.params;
        const { rating } = req.body;
        if (rating < 1 || rating > 5)
            return res.status(400).json({ message: "Rating must be 1-5" });
        const ride = yield ride_model_1.Ride.findById(rideId);
        if (!ride)
            return res.status(404).json({ message: "Ride not found" });
        if (String(ride.riderId) !== req.user.id)
            return res.status(403).json({ message: "Not your ride" });
        if (ride.status !== "completed")
            return res.status(400).json({ message: "Can only rate completed rides" });
        const driver = yield user_model_1.User.findById(ride.driverId);
        if (!driver)
            return res.status(404).json({ message: "Driver not found" });
        // Update ride
        ride.driverRating = rating;
        yield ride.save();
        // Update driver
        driver.ratings = driver.ratings ? [...driver.ratings, rating] : [rating];
        driver.averageRating =
            driver.ratings.reduce((sum, r) => sum + r, 0) /
                driver.ratings.length;
        yield driver.save();
        res.status(200).json({ message: "Driver rated", ride, driver });
    }
    catch (err) {
        res.status(500).json({ message: "Server error", err });
    }
});
exports.rateDriver = rateDriver;
// src/modules/ride/ride.controller.ts
const leaveFeedback = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { rideId } = req.params;
        const { feedback } = req.body;
        const ride = yield ride_model_1.Ride.findById(rideId);
        if (!ride)
            return res.status(404).json({ message: "Ride not found" });
        if (String(ride.riderId) !== req.user.id)
            return res.status(403).json({ message: "Not your ride" });
        if (ride.status !== "completed")
            return res
                .status(400)
                .json({ message: "Can only leave feedback for completed rides" });
        ride.riderFeedback = feedback;
        yield ride.save();
        res.status(200).json({ message: "Feedback submitted", ride });
    }
    catch (err) {
        res.status(500).json({ message: "Server error", err });
    }
});
exports.leaveFeedback = leaveFeedback;
const findNearbyDrivers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { lat, lng, maxDistance = 5000 } = req.query; // maxDistance in meters
        if (!lat || !lng)
            return res
                .status(400)
                .json({ message: "Latitude and longitude required" });
        const drivers = yield user_model_1.User.find({
            role: "driver",
            isOnline: true,
            approvalStatus: "approved",
            location: {
                $near: {
                    $geometry: {
                        type: "Point",
                        coordinates: [parseFloat(lng), parseFloat(lat)],
                    },
                    $maxDistance: parseInt(maxDistance),
                },
            },
        }).select("name vehicleInfo location");
        res.status(200).json({ drivers });
    }
    catch (err) {
        res.status(500).json({ message: "Server error", err });
    }
});
exports.findNearbyDrivers = findNearbyDrivers;
