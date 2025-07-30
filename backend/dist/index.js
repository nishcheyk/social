"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const mongoose_1 = __importDefault(require("mongoose"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express")); // <-- Add this import
const routes_1 = __importDefault(require("./app/routes"));
const error_handler_middleware_1 = require("./app/common/middleware/error-handler.middleware");
const rate_limiter_middleware_1 = require("./app/common/middleware/rate-limiter.middleware");
const config_helper_1 = require("./app/common/helper/config.helper");
const swagger_json_1 = __importDefault(require("./swagger.json")); // Adjust the relative path if needed
async function bootstrap() {
    await mongoose_1.default.connect(config_helper_1.Config.mongoUri);
    console.log('Connected to MongoDB');
    const app = (0, express_1.default)();
    app.use((0, cors_1.default)({ origin: config_helper_1.Config.frontendOrigin, credentials: true }));
    app.use(express_1.default.json());
    app.use(rate_limiter_middleware_1.rateLimiterMiddleware);
    app.use('/api', routes_1.default);
    app.use(error_handler_middleware_1.errorHandlerMiddleware);
    app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_json_1.default));
    app.listen(config_helper_1.Config.port, () => {
        console.log(`Server running at http://localhost:${config_helper_1.Config.port}`);
        console.log(`Swagger docs available at http://localhost:${config_helper_1.Config.port}/api-docs`);
    });
}
bootstrap().catch(err => {
    console.error('Failed to bootstrap app:', err);
    process.exit(1);
});
