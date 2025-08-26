const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Fix pretty-format bundling issue by resolving missing DOM plugins
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];

// Add custom resolver to handle pretty-format DOM plugins
const originalResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Handle missing pretty-format DOM plugins
  if (moduleName === './plugins/DOMElement' || moduleName === './plugins/DOMCollection') {
    return {
      filePath: require.resolve('./metro-plugins/DOMElement.js'),
      type: 'sourceFile',
    };
  }
  
  // Fall back to default resolution
  if (originalResolveRequest) {
    return originalResolveRequest(context, moduleName, platform);
  }
  
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config; 