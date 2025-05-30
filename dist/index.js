"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const connect_1 = __importDefault(require("./config/connect"));
(0, connect_1.default)();
const PORT = 8800;
app_1.default.listen(PORT, () => {
    console.log("Server is running on port " + PORT);
});
