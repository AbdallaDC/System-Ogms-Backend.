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
const mongoose_1 = require("mongoose");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const config_1 = require("../config");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const validator_1 = __importDefault(require("validator"));
const userSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        minlength: 3,
        maxlength: 50,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if (!validator_1.default.isEmail(value)) {
                throw new Error("Email is invalid!");
            }
        },
    },
    password: {
        type: String,
        required: true,
        select: false,
        // minlength: 8,
        // maxlength: 50,
    },
    is_active: {
        type: Boolean,
        default: true,
    },
    phone: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        // minlength: 10,
        // maxlength: 15,
    },
    role: {
        type: String,
        required: true,
        enum: ["admin", "mechanic", "customer"],
        default: "customer",
    },
    address: {
        type: String,
        maxlength: 100,
    },
}, { timestamps: true });
// Hash password before saving
userSchema.pre("save", function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!this.isModified("password"))
            return next();
        const salt = yield bcryptjs_1.default.genSalt(10);
        this.password = yield bcryptjs_1.default.hash(this.password, salt);
        next();
    });
});
// Compare password with saved password
userSchema.methods.comparePassword = function (password) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield bcryptjs_1.default.compare(password, this.password);
    });
};
userSchema.methods.generateAuthToken = function () {
    const payload = {
        id: this._id,
        role: this.role,
        email: this.email,
    };
    return jsonwebtoken_1.default.sign(payload, config_1.JWT_SECRET, {
        expiresIn: "7d",
    });
};
userSchema.set("toJSON", { virtuals: true });
userSchema.set("toObject", { virtuals: true });
userSchema.virtual("bookings", {
    ref: "Booking",
    localField: "_id",
    foreignField: "user_id",
});
const User = (0, mongoose_1.model)("User", userSchema);
exports.default = User;
