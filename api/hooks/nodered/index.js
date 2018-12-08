module.exports = (sails) => {

    return {
      RED: {},
      initialize: (cb) => {
              sails.on('lifted', async () => {
                  RED = require("node-red");
                  // Create the settings object - see default settings.js file for other options
                  var settings = {
                          httpAdminRoot:"/red",
                          httpNodeRoot: "/api",
                          userDir:"/home/tim/.node-red/", // change it to point to your user home dir
                          functionGlobalContext: { }    // enables global context
                  };
  
                  // Initialise the runtime with a server and settings
                  RED.init(sails,settings);
  
                  // Start the runtime
                  RED.start();
              });
              return cb();
            }
      }
  }