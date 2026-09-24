import { app } from './app.js';
import { env } from './config/env.js';

const port = env.PORT || 4000;

app.listen(port, () => {
  console.log(`🚀 College ERP API server running on http://localhost:${port}`);
  console.log(`📡 Environment: ${env.NODE_ENV}`);
  console.log(`🔍 Defect Simulation Enabled: ${env.DEFECT_SIMULATION_ENABLED}`);
});
