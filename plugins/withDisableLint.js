const { withAppBuildGradle } = require('@expo/config-plugins');

/**
 * Disables Android LintVital checks during release packaging.
 * LintVital runs analysis on every single sub-module which exhausts Metaspace and memory on CI/EAS.
 */
const withDisableLint = (config) => {
  return withAppBuildGradle(config, (config) => {
    const lintBlock = `
    lint {
        checkReleaseBuilds = false
        abortOnError = false
        checkDependencies = false
    }
    lintOptions {
        checkReleaseBuilds false
        abortOnError false
        checkDependencies false
    }
`;
    if (!config.modResults.contents.includes('checkReleaseBuilds')) {
      config.modResults.contents = config.modResults.contents.replace(
        /android\s*\{/,
        `android {\n${lintBlock}`
      );
    }
    return config;
  });
};

module.exports = withDisableLint;
