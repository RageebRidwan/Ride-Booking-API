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
exports.resetPassword = exports.requestPasswordReset = exports.logout = exports.login = exports.register = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_model_1 = require("../user/user.model");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey123";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1d";
const RESET_EXPIRES_IN = "1h"; // token valid for 1 hour
// Generate JWT
const generateToken = (userId, role) => {
    // Type assertion for JWT_SECRET to make TS happy
    const secret = JWT_SECRET;
    const payload = { id: userId, role };
    const options = { expiresIn: JWT_EXPIRES_IN };
    return jsonwebtoken_1.default.sign(payload, secret, options);
};
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, email, password, role, vehicleInfo } = req.body;
        if (!name || !email || !password || !role)
            return res.status(400).json({ message: "All fields required" });
        const existing = yield user_model_1.User.findOne({ email: email.toLowerCase() });
        if (existing)
            return res.status(400).json({ message: "Email already in use" });
        let userData = { name, email: email.toLowerCase(), password, role };
        if (role === "driver") {
            if (!vehicleInfo)
                return res
                    .status(400)
                    .json({ message: "Vehicle info required for drivers" });
            userData.vehicleInfo = vehicleInfo;
            userData.approvalStatus = "pending";
            userData.isOnline = false;
        }
        const user = new user_model_1.User(userData);
        yield user.save();
        user.password = undefined;
        const token = generateToken(user._id, user.role);
        res.status(201).json({ token, user });
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});
exports.register = register;
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        if (!email || !password)
            return res.status(400).json({ message: "All fields required" });
        const user = yield user_model_1.User.findOne({ email });
        if (!user)
            return res.status(400).json({ message: "Invalid credentials" });
        const isMatch = yield user.comparePassword(password);
        if (!isMatch)
            return res.status(400).json({ message: "Invalid credentials" });
        const token = generateToken(user._id, user.role);
        res.cookie("auth_token", token, {
            httpOnly: true,
            secure: false,
            sameSite: "strict",
            maxAge: 24 * 60 * 60 * 1000,
        });
        user.password = undefined;
        res.status(200).json({ token, user });
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});
exports.login = login;
const logout = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.clearCookie("auth_token", {
        httpOnly: true,
        secure: false,
        sameSite: "strict",
    });
    res.status(200).json({ message: "Logged out successfully" });
});
exports.logout = logout;
const requestPasswordReset = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    const user = yield user_model_1.User.findOne({ email });
    if (!user)
        return res.status(404).json({ message: "User not found" });
    // Create a reset token
    const token = jsonwebtoken_1.default.sign({ id: user._id }, JWT_SECRET, {
        expiresIn: RESET_EXPIRES_IN,
    });
    // Normally you'd email this token. For now return it in response
    res.status(200).json({ message: "Reset token generated", token });
});
exports.requestPasswordReset = requestPasswordReset;
const resetPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { token } = req.params;
    const { password } = req.body;
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET); // throws if invalid/expired
        const user = yield user_model_1.User.findById(decoded.id);
        if (!user)
            return res.status(404).json({ message: "User not found" });
        // Hash new password
        const salt = yield bcryptjs_1.default.genSalt(Number(process.env.BCRYPT_SALT || 10));
        user.password = yield bcryptjs_1.default.hash(password, salt);
        yield user.save();
        res.status(200).json({ message: "Password reset successful" });
    }
    catch (err) {
        res.status(400).json({ message: "Invalid or expired token" });
    }
});
exports.resetPassword = resetPassword;
