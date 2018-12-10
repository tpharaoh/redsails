/**
 * is-logged-in
 *
 * A simple policy that allows any request from an authenticated user.
 *
 * For more about how to use policies, see:
 *   https://sailsjs.com/config/policies
 *   https://sailsjs.com/docs/concepts/policies
 *   https://sailsjs.com/docs/concepts/policies/access-control-and-permissions
 */
module.exports = async function (req, res, proceed) {

  // If `req.me` is set, then we know that this request originated
  // from a logged-in user.  So we can safely proceed to the next policy--
  // or, if this is the last policy, the relevant action.
  // > For more about where `req.me` comes from, check out this app's
  // > custom hook (`api/hooks/custom/index.js`).
  if (req.me) {
sails.log.debug(req.me);

sails.log.debug('*****');
    let RED = require("node-red");
    // Create the settings object - see default settings.js file for other options
    let settings = {
            httpAdminRoot:"/red/"+req.me.id,
            httpNodeRoot: "/api/"+req.me.id,
            userDir:"/home/tim/.nodered/"+req.me.id, // change it to point to your user home dir
            functionGlobalContext: { },    // enables global context
            httpNodeMiddleware: function (req, res, next) {
                const env = process.env.NODE_ENV || 'development';
                sails.log.debug('<<------------------------------');
                sails.log.debug("Requested data :: ");
                sails.log.debug('  ', req.method, req.url);
                if (env.toLowerCase() !== 'production') {
                    sails.log.debug('   Headers:');
                    sails.log.debug(req.headers);
                    sails.log.debug('   Params:');
                    sails.log.debug(req.params);
                    sails.log.debug('   Body:');
                    sails.log.debug(req.body);
                }
                sails.log.debug('------------------------------>>');
                return next();
            },
    };
    await RED.stop();
    // Initialise the runtime with a server and settings
    RED.init(sails.hooks.http.server,settings);

    // Serve the editor UI from /red
    sails.hooks.http.app.use(settings.httpAdminRoot, RED.httpAdmin);

    // Serve the http nodes UI from /api
    sails.hooks.http.app.use(settings.httpNodeRoot, RED.httpNode);

    // Start the runtime
    RED.start();

    //this line causes bug
    req.session.RED = RED;


    return proceed();
  }

  //--•
  // Otherwise, this request did not come from a logged-in user.
  return res.unauthorized();

};
