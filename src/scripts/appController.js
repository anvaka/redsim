require('typeahead.an');
require('./shareController.js');

var createClient = require('./dataclient.js');


require('an').controller(AppController);

function AppController($scope, $http, $q, $location) {
  var client = createClient($http, $q);
  client.on('ready', setReady);

  $scope.recommendationsReady = false;
  $scope.getTypeahead = function (query) {
    return client.searchSubreddit(query);
  };

  $scope.showRecommendation = function () {
    $location.search('q', $scope.searchInput).replace();
  }

  $scope.$on('$locationChangeSuccess', function() {
    var query = $location.search();
    $scope.searchInput = query.q;

    client.getRecommendations(query.q)
      .then(setRecommendationsOnScope);
  });

  function setRecommendationsOnScope(recommendations) {
    $scope.from = recommendations.from;
    $scope.to = recommendations.to;
    var hasFrom = $scope.hasFrom = $scope.from && $scope.from.length > 0;
    var hasTo = $scope.hasTo = $scope.to && $scope.to.length > 0;
    $scope.hasResults = hasFrom || hasTo;
  }

  function setReady() {
    $scope.recommendationsReady = true;
    if (!$scope.$$phase) $scope.$digest();
    // TODO: This is bad!
    setTimeout(function() {
      var search = document.getElementById('search-input');
      if (search) search.focus();
    }, 20)
  }
}

