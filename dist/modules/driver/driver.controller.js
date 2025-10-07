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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDriverRating = exports.setAvailability = void 0;
const ride_model_1 = require("../rider/ride.model");
const user_model_1 = require("../user/user.model");
// Set online/offline
const setAvailability = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { isOnline } = req.body;
        const user = yield user_model_1.User.findById(req.user.id);
        if (!user)
            return res.status(404).json({ message: "Driver not found" });
        if (user.role !== "driver")
            return res
                .status(403)
                .json({ message: "Only drivers can set availability" });
        user.isOnline = isOnline;
        yield user.save();
        res.status(200).json({
            message: `Driver is now ${isOnline ? "online" : "offline"}`,
            user,
        });
    }
    catch (err) {
        res.status(500).json({ message: "Server error", err });
    }
});
exports.setAvailability = setAvailability;
// src/modules/driver/driver.controller.ts
const getDriverRating = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const rides = yield ride_model_1.Ride.find({
            driverId: req.params.id,
            driverRating: { $exists: true },
        });
        if (!rides.length)
            return res.status(200).json({ averageRating: 0, totalRatings: 0 });
        const total = rides.reduce((sum, ride) => { var _a; return sum + ((_a = Number(ride.driverRating)) !== null && _a !== void 0 ? _a : 0); }, 0);
        const averageRating = (total / rides.length).toFixed(2);
        res.status(200).json({ averageRating, totalRatings: rides.length });
    }
    catch (err) {
        res.status(500).json({ message: "Server error", err });
    }
});
exports.getDriverRating = getDriverRating;
