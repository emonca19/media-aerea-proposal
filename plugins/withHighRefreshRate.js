const { withAndroidManifest } = require('@expo/config-plugins');

const withHighRefreshRate = (config) => {
  return withAndroidManifest(config, (config) => {
    const { manifest } = config.modResults;

    // Add high refresh rate support to the main activity
    if (manifest.application && manifest.application.activity) {
      const activities = Array.isArray(manifest.application.activity) 
        ? manifest.application.activity 
        : [manifest.application.activity];

      activities.forEach(activity => {
        if (activity.$['android:name'] === '.MainActivity' || 
            activity.$['android:name'] === 'com.mediaaerea.MainActivity') {
          // Add high refresh rate attribute
          activity.$['android:preferMinimalPostProcessing'] = 'true';
          
          // Ensure hardware acceleration is enabled
          activity.$['android:hardwareAccelerated'] = 'true';
          
          // Add additional attributes for better performance
          activity.$['android:largeHeap'] = 'true';
        }
      });
    }

    // Add high refresh rate support to the application level
    if (manifest.application) {
      manifest.application.$['android:hardwareAccelerated'] = 'true';
      
      // Add meta-data for high refresh rate
      if (!manifest.application['meta-data']) {
        manifest.application['meta-data'] = [];
      }
      
      const metaDataArray = Array.isArray(manifest.application['meta-data']) 
        ? manifest.application['meta-data'] 
        : [manifest.application['meta-data']];
      
      // Add high refresh rate meta-data
      metaDataArray.push({
        $: {
          'android:name': 'android.graphics.enableHardwareAcceleration',
          'android:value': 'true'
        }
      });
      
      metaDataArray.push({
        $: {
          'android:name': 'android.display.preferMinimalPostProcessing',
          'android:value': 'true'
        }
      });
      
      manifest.application['meta-data'] = metaDataArray;
    }

    return config;
  });
};

// Export the plugin function as default
module.exports = withHighRefreshRate;
