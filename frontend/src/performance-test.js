/**
 * Performance Test Helper
 * 
 * To use this in your Vue components, import and call in mounted():
 * 
 * import { measurePagePerformance } from './performance-test';
 * 
 * export default {
 *   mounted() {
 *     measurePagePerformance('ComponentName');
 *   }
 * }
 */

/**
 * Measures and logs various performance metrics for a page or component
 * @param {string} componentName - Name of component/page being measured
 */
export function measurePagePerformance(componentName) {
  // Wait for page to fully load
  window.addEventListener('load', () => {
    setTimeout(() => {
      // Get performance data
      const perfData = window.performance.timing;
      const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
      const domReadyTime = perfData.domComplete - perfData.domLoading;
      const networkLatency = perfData.responseEnd - perfData.requestStart;
      const serverResponseTime = perfData.responseEnd - perfData.responseStart;
      
      // Log to console
      console.group(`Performance Metrics for ${componentName}`);
      console.log(`Total Page Load Time: ${pageLoadTime}ms`);
      console.log(`DOM Ready Time: ${domReadyTime}ms`);
      console.log(`Network Latency: ${networkLatency}ms`);
      console.log(`Server Response Time: ${serverResponseTime}ms`);
      
      // Get paint metrics
      if (window.performance.getEntriesByType) {
        const paintMetrics = window.performance.getEntriesByType('paint');
        if (paintMetrics.length > 0) {
          paintMetrics.forEach(metric => {
            console.log(`${metric.name}: ${metric.startTime.toFixed(1)}ms`);
          });
        }
        
        // Get resource load times
        const resources = window.performance.getEntriesByType('resource');
        const resourceStats = {
          js: { count: 0, size: 0, time: 0 },
          css: { count: 0, size: 0, time: 0 },
          img: { count: 0, size: 0, time: 0 },
          other: { count: 0, size: 0, time: 0 }
        };
        
        resources.forEach(resource => {
          const url = resource.name;
          const duration = resource.duration;
          const size = resource.transferSize || 0;
          
          let type = 'other';
          if (url.endsWith('.js')) type = 'js';
          else if (url.endsWith('.css')) type = 'css';
          else if (url.match(/\.(png|jpg|jpeg|gif|svg|webp)$/i)) type = 'img';
          
          resourceStats[type].count++;
          resourceStats[type].size += size;
          resourceStats[type].time += duration;
        });
        
        console.log('\nResource Statistics:');
        for (const [type, stats] of Object.entries(resourceStats)) {
          if (stats.count > 0) {
            console.log(`${type.toUpperCase()} Files: ${stats.count}`);
            console.log(`  Total Size: ${(stats.size / 1024).toFixed(1)}KB`);
            console.log(`  Avg Load Time: ${(stats.time / stats.count).toFixed(1)}ms`);
          }
        }
      }
      
      console.groupEnd();
      
      // Optional: Send metrics to your backend for logging/analysis
      // sendMetricsToServer(componentName, { pageLoadTime, domReadyTime, networkLatency, serverResponseTime });
    }, 0);
  });
}

/**
 * Uncomment and implement this function to send metrics to your backend
 */
/*
function sendMetricsToServer(componentName, metrics) {
  fetch('/api/performance-metrics', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      component: componentName,
      timestamp: new Date().toISOString(),
      metrics
    })
  }).catch(err => console.error('Failed to send metrics:', err));
}
*/ 