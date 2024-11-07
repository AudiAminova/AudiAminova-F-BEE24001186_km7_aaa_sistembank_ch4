// konfigurasi swagger
import swaggerUi from 'swagger-ui-express';
import swaggerGenerator from 'express-swagger-generator';

const swaggerSetup = (app, port) => {
  const swaggerGeneratorInstance = swaggerGenerator(app)({
    swaggerDefinition: {
      info: {
        description: 'Banking System',
        title: 'Swagger API',
        version: '1.0.0',
      },
      host: `localhost:${port}`,
      basePath: '/api/v1',
      produces: ['application/json'],
      schemes: ['http'],
    },
    basedir: process.cwd(),
    files: ['./routes/**/*.js'], 
  });

  const swaggerDoc = swaggerGeneratorInstance.swaggerDoc;

  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc));

};

export default swaggerSetup;
