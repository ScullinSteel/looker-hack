var Client = require('./client');
var GetOpt = require('node-getopt');
var debug = require('debug')('looker-hack:main');
var renderers = {
  banner: require('./renderers/banner'),
  graph: require('./renderers/graph'),
  table: require('./renderers/table')
};

var config = {
  host: 'localhost.looker.com:19999',
  pages: [
    {
      lookId: 1,
      renderer: 'banner',
      duration: 5
    },
    {
      lookId: 4,
      renderer: 'graph',
      duration: 5
    },
    {
      lookId: 6,
      renderer: 'table',
      duration: 5
    }
  ]
};

var cli;
var client;
var curPage = 0;

function render() {
  var page = config.pages[curPage];

  function done() {
    curPage = (curPage + 1) % config.pages.length;

    if (!(cli.options.debug && cli.options.page)) {
      setTimeout(render, page.duration * 1000);
    }
  }

  debug('getting look', page.lookId);
  client.look(page.lookId).then(function(look) {
    debug('running look');
    client.runLook(page.lookId)
    .then(function(data) {
      debug('look complete');
      renderers[page.renderer](look, data, done);
    })
    .catch(function(err) {
      renderers.banner(look, err, done);
    });
  })
  .catch(function(err) {
    renderers.banner(null, err, done);
  });
}

function main() {
  var getopt = new GetOpt([
    ['d', 'debug', 'Debug flag'],
    ['p', 'page=ARG', 'Start page #']
  ]);

  cli = getopt.bindHelp().parseSystem();

  if (cli.options.page) {
    curPage = parseInt(cli.options.page, 10);
  }

  client = new Client(config.host);

  client.login().then(render).catch(function(err) {
    console.error(err);
  });
}

module.exports = main;
