const express = require('express');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3001; // law hasha8al 3ala nafs elserver kan mawdo3 kbeer elsara7a fa keda ashal


const swaggerDocument = YAML.load(path.join(__dirname, 'api-spec.yaml'));


swaggerDocument.servers = [
  {
    url: 'http://localhost:3000',
    description: 'Main API Server'
  }
];

app.use(cors());


const swaggerOptions = {
  explorer: true,
  swaggerOptions: {
    docExpansion: 'none',
    filter: true,
    showRequestHeaders: true,
  },
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: "Task Management API Documentation"
};

app.use('/', swaggerUi.serve, swaggerUi.setup(swaggerDocument, swaggerOptions));

app.listen(PORT, () => {
  console.log(` API Documentation available at http://localhost:${PORT}`);
  console.log(` Main API server should be running at http://localhost:3000`);
});