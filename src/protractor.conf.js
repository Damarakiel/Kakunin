require('./helpers/prototypes');
const path = require('path');
const chai = require('chai');
const modulesLoader = require('./helpers/modules-loader.helper.js').create();
const chaiAsPromised = require('chai-as-promised');
const { emailService } = require('./emails');
chai.use(chaiAsPromised);

const config = require('./helpers/config.helper.js').default;

const chromeConfig = {
  browserName: 'chrome',
  chromeOptions: {
    args: [],
    prefs: {
      credentials_enable_service: false,
      profile: {
        password_manager_enabled: false
      },
      download: {
        prompt_for_download: false,
        default_directory: config.projectPath + config.downloads,
        directory_upgrade: true
      }
    }
  }
};

if (config.noGpu) {
  chromeConfig.chromeOptions.args = [
    ...chromeConfig.chromeOptions.args,
    '--disable-gpu',
    '--disable-impl-side-painting',
    '--disable-gpu-sandbox',
    '--disable-accelerated-2d-canvas',
    '--disable-accelerated-jpeg-decoding',
    '--no-sandbox'
  ];
}

if (config.headless) {
  chromeConfig.chromeOptions.args = [
    ...chromeConfig.chromeOptions.args,
    '--headless',
    `--window-size=${config.browserWidth}x${config.browserHeight}`
  ];
}

exports.config = {
  multiCapabilities: [
    chromeConfig
  ],

  useAllAngular2AppRoots: config.type === 'ng2',

  getPageTimeout: parseInt(config.timeout) * 1000,
  allScriptsTimeout: parseInt(config.timeout) * 1000,

  framework: 'custom',
  frameworkPath: require.resolve('protractor-cucumber-framework'),
  specs: config.features.map(file => config.projectPath + file + '/**/*.feature'),

  cucumberOpts: {
    require: [
      './configuration/config.js',
      './configuration/hooks.js',
      './step_definitions/**/*.js',
      ...config.step_definitions.map(file => config.projectPath + file + '/**/*.js'),
      ...config.hooks.map(file => config.projectPath + file + '/**/*.js')
    ],
    format: ['pretty', `json:../..${config.reports}/features-report.json`],
    profile: false,
    'no-source': true
  },

  onPrepare: function () {
    if (!config.headless) {
      browser.driver.manage().window().setSize(
        parseInt(config.browserWidth),
        parseInt(config.browserHeight)
      );
    }

    modulesLoader.getModules('matchers');
    modulesLoader.getModules('dictionaries');
    modulesLoader.getModules('generators');
    modulesLoader.getModules('comparators');
    modulesLoader.getModules('form_handlers');
    modulesLoader.getModules('transformers');
    modulesLoader.getModules('emails');

    browser.page = modulesLoader
      .getModulesAsObject(
        config.pages.map((page) => path.join(config.projectPath, page))
      );

    global.expect = chai.expect;

    if (config.clearEmailInboxBeforeTests) {
      return emailService.clearInbox();
    }
  },

  baseUrl: config.baseUrl
};
