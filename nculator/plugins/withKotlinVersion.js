const { withProjectBuildGradle } = require('@expo/config-plugins');

module.exports = (config) =>
  withProjectBuildGradle(config, (config) => {
    config.modResults.contents = config.modResults.contents.replace(
      /kotlinVersion\s*=\s*["'][\d.]+["']/,
      'kotlinVersion = "1.9.25"'
    );
    return config;
  });
