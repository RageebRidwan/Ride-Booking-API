"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const auth_routes_1 = __importDefault(require("./modules/auth/auth.routes"));
const ride_routes_1 = __importDefault(require("./modules/rider/ride.routes"));
const driver_routes_1 = __importDefault(require("./modules/driver/driver.routes"));
const admin_routes_1 = __importDefault(require("./modules/user/admin.routes"));
const error_middleware_1 = require("./middlewares/error.middleware");
dotenv_1.default.config();
const app = (0, express_1.default)();
// Middlewares
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Health check route
app.get("/", (req, res) => {
    res.status(200).json({ message: "Ride Booking API is running!" });
});
app.use('/api/auth', auth_routes_1.default);
app.use("/api/rides", ride_routes_1.default);
app.use("/api/drivers", driver_routes_1.default);
app.use("/api/admin", admin_routes_1.default);
app.use(error_middleware_1.errorHandler);
exports.default = app;
