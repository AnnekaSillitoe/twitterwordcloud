const Hapi = require('hapi');
const Inert = require('inert');
const Env2 = require('env2')('config.env');
const twitterAPI = require('node-twitter-api');
var creds = {};
var twitter = new twitterAPI({
  consumerKey: process.env.CONSUMER_KEY,
  consumerSecret: process.env.CONSUMER_SECRET,
  callback: process.env.CALLBACK_URL
});

const server = new Hapi.Server();
server.connection({port: 3000});

server.register([Inert], (err) => {
  server.route([
    {
    method: 'GET',
    path: '/',
    handler: (req, reply) => {
      if (!req.state.creds && req.query.oauth_verifier){
        twitter.getAccessToken(creds.requestToken, creds.requestTokenSecret, req.query.oauth_verifier, (error, accessToken, accessTokenSecret, results) => {
          if (error) {
            console.log(error);
          } else {
            reply.file(__dirname + '/../index.html');
          }
        });
      } else {
        reply.redirect('/login');
      }
    }
  },
  {
    method: ['GET', 'POST'],
    path: '/login',
    handler: function (req, reply) {
      twitter.getRequestToken((error, requestToken, requestTokenSecret, results) => {
        if (error) {
          console.log('Error getting OAuth request token : ' + error);
        } else {
          creds.requestToken = requestToken;
          creds.requestTokenSecret = requestTokenSecret;
          if (creds.accessToken) {
            reply.file(__dirname + '/../index.html');
          } else {
            reply.redirect(`https://twitter.com/oauth/authenticate?oauth_token=${requestToken}`);
          }
        }
      });
    }
  },
  {
    method: 'POST',
    path: '/profilepage',
    handler: (req, reply) => {
      twitter.getTimeline('user_timeline', {screen_name: req.payload, count: 100, include_rts: false}, creds.access, creds.secret, (error, data, response) => {
        if (error) {
          console.log(error);
        } else {
          data = [].concat.apply([], data.map(el => {
            return el.text.split(' ');
          }));
          reply(data);
        }
      });
    }
  },
  {
    method: 'GET',
    path: '/{path*}',
    handler: function(request, reply) {
      reply.file(__dirname + '/../' + request.params.path);
    }
  }
]);

  server.start((err) => {
    if (err) {
      throw err;
    }
    console.log('Server running at:', server.info.uri);
  });
});
