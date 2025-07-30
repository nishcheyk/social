import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import swaggerUi from 'swagger-ui-express';        // <-- Add this import
import routes from './app/routes';
import { errorHandlerMiddleware } from './app/common/middleware/error-handler.middleware';
import { rateLimiterMiddleware } from './app/common/middleware/rate-limiter.middleware';
import { Config } from './app/common/helper/config.helper';

import swaggerDocument from './swagger.json';    // Adjust the relative path if needed

async function bootstrap() {
  await mongoose.connect(Config.mongoUri);
  console.log('Connected to MongoDB');

  const app = express();

  app.use(cors({ origin: Config.frontendOrigin, credentials: true }));
  app.use(express.json());

  app.use(rateLimiterMiddleware);

  app.use('/api', routes);

  app.use(errorHandlerMiddleware);

 
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

  app.listen(Config.port, () => {
    console.log(`Server running at http://localhost:${Config.port}`);
    console.log(`Swagger docs available at http://localhost:${Config.port}/api-docs`);
  });
}

bootstrap().catch(err => {
  console.error('Failed to bootstrap app:', err);
  process.exit(1);
});
