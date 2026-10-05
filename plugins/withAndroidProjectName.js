const { withSettingsGradle } = require('@expo/config-plugins');

module.exports = function withAndroidProjectName(config) {
  return withSettingsGradle(config, (modConfig) => {
    modConfig.modResults.contents = modConfig.modResults.contents.replace(
      /rootProject\.name\s*=\s*['"][^'"]*['"]/,
      "rootProject.name = 'atls'"
    );
    return modConfig;
  });
};
