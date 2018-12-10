module.exports = (sails) => {

    return {
        configure: function() {

            // If SSL is on, use the HTTPS endpoint
           sails.log.debug("pre red"+sails)
         },
      initialize: (cb) => {
           let RED = require("node-red");
            // Create the settings object - see default settings.js file for other options
            let settings = {
                    httpAdminRoot:"/red",
                    httpNodeRoot: "/api",
                    //working hook
                    userDir:"/home/tim/.nodered/", // change it to point to your user home dir
 
                    //new lines from RSA
                    // flowFile: "/home/tim/.nodered/"+this.req.session.userId+"/"+flows.json,
                    // userDir:"/home/tim/.nodered/"+this.req.session.userId,
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

            // Initialise the runtime with a server and settings
            RED.init(sails.hooks.http.server,settings);

            // Serve the editor UI from /red
            sails.hooks.http.app.use(settings.httpAdminRoot, RED.httpAdmin);

            // Serve the http nodes UI from /api
            sails.hooks.http.app.use(settings.httpNodeRoot, RED.httpNode);

            // Start the runtime
            RED.start();
    return cb();
        
        }
          //sails.log.debug(sails.loggedInUser)
      }
  }