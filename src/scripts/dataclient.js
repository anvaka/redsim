var createGraph = require('ngraph.graph');
var eventify = require('ngraph.events');
module.exports = dataClient;

function dataClient($http, $q) {
  // Kick off graph download immediately
  $http.get('data/labels.json')
    .then(addLabelsToGraph);

  $http.get('data/links.bin', { responseType: "arraybuffer" })
    .then(addLinksToGraph);

  var labels, linksReady = false, pendingSearch;
  var nodeIdLookup = Object.create(null);
  var graph = createGraph();
  var model = {
    searchSubreddit: searchSubreddit,
    getRecommendations: getRecommendations
  };
  eventify(model);

  return model;

  function getRecommendations(query) {
    if (!linksReady) {
      pendingSearch = $q.defer();
      return $q(function(resolve, reject) {
        pendingSearch.promise.then(function() {
          getRecommendations(query).then(resolve);
        })
      });
    }

    return $q(function(resolve, reject) {
      var srcId = nodeIdLookup[query];
      var links = graph.getLinks(srcId)
      var from = [], to = [];
      var result  = {
        from: from,
        to: to
      };
      if (links) {
        links.sort(byRank);
        for (var i = 0; i < links.length; ++i) {
          var link = links[i];
          if (link.fromId === srcId) {
            to.push(labels[link.toId]);
          } else {
            from.push(labels[link.fromId]);
          }
        }
      }
      resolve(result);
    });
  }

  function byRank(x, y) {
    return x.data - y.data;
  }

  function searchSubreddit(query) {
    var result = [];
    if (!labels) {
      return result;
    }
    query = query.toLowerCase();
    return labels.filter(function(x) {
        return x.toLowerCase().indexOf(query) !== -1;
      }).sort(function(x, y) {
        var distance = x.toLowerCase().indexOf(query) - y.toLowerCase().indexOf(query)
        if (distance === 0) {
          distance = x.length - y.length;
        }
        if (distance === 0) {
          distance = graph.getLinks(nodeIdLookup[y]).length - graph.getLinks(nodeIdLookup[x]).length;
        }
        return distance;
      }).splice(0, 12);
  }

  function addLabelsToGraph(response) {
    labels = response.data;
    labels.forEach(function(label, idx) {
      addToGraph(idx, 'label', label);
      nodeIdLookup[label] = idx;
    });
    fireIfReady()
  }

  function addToGraph(nodeId, dataName, dataValue) {
    var node = graph.getNode(nodeId);
    if (!node) {
      var data = {};
      data[dataName] = dataValue;
      graph.addNode(nodeId, data);
    } else {
      node.data[dataName] = dataValue;
    }
  }

  function addLinksToGraph(res) {
    var arr = new Int32Array(res.data);
    var lastFromId;
    for (var i = 0; i < arr.length; i++) {
      var id = arr[i];
      if (id < 0) {
        lastFromId = -id;
      } else {
        // need to unpack.
        var otherId = (id & 0xffffff00) >> 8;
        var rank = (id & 0xff);
        graph.addLink(lastFromId - 1, otherId - 1, rank);
      }
    }

    linksReady = true;
    pendingSearch.resolve();
    fireIfReady();
    return graph;
  }

  function fireIfReady() {
    if (linksReady && labels) {
      model.fire('ready');
    }
  }
}
