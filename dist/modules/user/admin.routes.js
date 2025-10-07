"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/modules/user/admin.routes.ts
const express_1 = require("express");
const admin_controller_1 = require("./admin.controller");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.protect, (0, auth_middleware_1.authorize)("admin"));
router.get("/users", admin_controller_1.getAllUsers);
router.patch("/drivers/approve/:id", admin_controller_1.approveDriver);
router.patch("/users/block/:id", admin_controller_1.blockUser);
router.get("/rides", admin_controller_1.getAllRides);
exports.default = router;
