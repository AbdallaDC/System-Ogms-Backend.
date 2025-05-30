"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JWT_SECRET = exports.DB_PASSWORD = exports.DB_URI = void 0;
var config_1 = require("./config");
Object.defineProperty(exports, "DB_URI", { enumerable: true, get: function () { return config_1.DB_URI; } });
Object.defineProperty(exports, "DB_PASSWORD", { enumerable: true, get: function () { return config_1.DB_PASSWORD; } });
Object.defineProperty(exports, "JWT_SECRET", { enumerable: true, get: function () { return config_1.JWT_SECRET; } });
