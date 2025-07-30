"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = void 0;
const mongoose_1 = require("mongoose");
const userSchema = new mongoose_1.Schema({
    username: { type: String, unique: true, required: true },
    passwordHash: { type: String, required: true },
    refreshToken: { type: String, default: null },
}, {
    timestamps: true,
});
exports.UserModel = (0, mongoose_1.model)('User', userSchema);
