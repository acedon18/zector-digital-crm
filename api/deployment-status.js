// Debug endpoint to verify deployment status
export default function handler(req, res) {
  const deploymentInfo = {
    timestamp: new Date().toISOString(),
    expectedBundle: 'LiveVisitors-CEKabh3E.js',
    problematicBundle: 'LiveVisitors-Qlpjt7JQ.js',
    status: 'EMERGENCY_DEPLOYMENT_VERIFICATION',
    message: 'If you see this, new code is deploying',
    buildTime: '2025-06-25T20:35:00Z'
  };
  
  res.status(200).json(deploymentInfo);
}
