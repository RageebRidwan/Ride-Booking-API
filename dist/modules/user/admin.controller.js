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
exports.getAllRides = exports.blockUser = exports.approveDriver = exports.getAllUsers = void 0;
const user_model_1 = require("./user.model");
const ride_model_1 = require("../rider/ride.model");
// View all users
const getAllUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield user_model_1.User.find().select("-password").sort({ createdAt: -1 });
        res.status(200).json({ users });
    }
    catch (err) {
        res.status(500).json({ message: "Server error", err });
    }
});
exports.getAllUsers = getAllUsers;
// Approve/suspend driver
const approveDriver = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const driver = yield user_model_1.User.findById(req.params.id);
        if (!driver)
            return res.status(404).json({ message: "Driver not found" });
        if (driver.role !== "driver")
            return res.status(400).json({ message: "User is not a driver" });
        const { approvalStatus } = req.body; // 'approved' | 'rejected' | 'pending'
        driver.approvalStatus = approvalStatus;
        yield driver.save();
        res.status(200).json({ message: `Driver ${approvalStatus}`, driver });
    }
    catch (err) {
        res.status(500).json({ message: "Server error", err });
    }
});
exports.approveDriver = approveDriver;
// Block/unblock user
const blockUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield user_model_1.User.findById(req.params.id);
        if (!user)
            return res.status(404).json({ message: "User not found" });
        const { status } = req.body; // 'active' | 'blocked' | 'suspended'
        user.status = status;
        yield user.save();
        res.status(200).json({ message: `User ${status}`, user });
    }
    catch (err) {
        res.status(500).json({ message: "Server error", err });
    }
});
exports.blockUser = blockUser;
// View all rides
const getAllRides = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const rides = yield ride_model_1.Ride.find()
            .populate("riderId", "name email")
            .populate("driverId", "name email")
            .sort({ createdAt: -1 });
        res.status(200).json({ rides });
    }
    catch (err) {
        res.status(500).json({ message: "Server error", err });
    }
});
exports.getAllRides = getAllRides;
