require('angular');
require('./appController');

var ngApp = angular.module('redsim', []);

require('an').flush(ngApp);

angular.bootstrap(document, [ngApp.name]);

module.exports = ngApp;
