module.exports = {


  friendlyName: 'Login',


  description: 'Log in using the provided email and password combination.',


  extendedDescription:
`This action attempts to look up the user record in the database with the
specified email address.  Then, if such a user exists, it uses
bcrypt to compare the hashed password from the database with the provided
password attempt.`,


  inputs: {

    emailAddress: {
      description: 'The email to try in this attempt, e.g. "irl@example.com".',
      type: 'string',
      required: true
    },

    password: {
      description: 'The unencrypted password to try in this attempt, e.g. "passwordlol".',
      type: 'string',
      required: true
    },

    rememberMe: {
      description: 'Whether to extend the lifetime of the user\'s session.',
      extendedDescription:
`Note that this is NOT SUPPORTED when using virtual requests (e.g. sending
requests over WebSockets instead of HTTP).`,
      type: 'boolean'
    }

  },


  exits: {

    success: {
      description: 'The requesting user agent has been successfully logged in.',
      extendedDescription:
`Under the covers, this stores the id of the logged-in user in the session
as the \`userId\` key.  The next time this user agent sends a request, assuming
it includes a cookie (like a web browser), Sails will automatically make this
user id available as req.session.userId in the corresponding action.  (Also note
that, thanks to the included "custom" hook, when a relevant request is received
from a logged-in user, that user's entire record from the database will be fetched
and exposed as \`req.me\`.)`
    },

    badCombo: {
      description: `The provided email and password combination does not
      match any user in the database.`,
      responseType: 'unauthorized'
      // ^This uses the custom `unauthorized` response located in `api/responses/unauthorized.js`.
      // To customize the generic "unauthorized" response across this entire app, change that file
      // (see api/responses/unauthorized).
      //
      // To customize the response for _only this_ action, replace `responseType` with
      // something else.  For example, you might set `statusCode: 498` and change the
      // implementation below accordingly (see http://sailsjs.com/docs/concepts/controllers).
    }

  },


  fn: async function (inputs) {

    // Look up by the email address.
    // (note that we lowercase it to ensure the lookup is always case-insensitive,
    // regardless of which database we're using)
    var userRecord = await User.findOne({
      emailAddress: inputs.emailAddress.toLowerCase(),
    });

    // If there was no matching user, respond thru the "badCombo" exit.
    if(!userRecord) {
      throw 'badCombo';
    }

    // If the password doesn't match, then also exit thru "badCombo".
    await sails.helpers.passwords.checkPassword(inputs.password, userRecord.password)
    .intercept('incorrect', 'badCombo');

    // If "Remember Me" was enabled, then keep the session alive for
    // a longer amount of time.  (This causes an updated "Set Cookie"
    // response header to be sent as the result of this request -- thus
    // we must be dealing with a traditional HTTP request in order for
    // this to work.)
    if (inputs.rememberMe) {
      if (this.req.isSocket) {
        sails.log.warn(
          'Received `rememberMe: true` from a virtual request, but it was ignored\n'+
          'because a browser\'s session cookie cannot be reset over sockets.\n'+
          'Please use a traditional HTTP request instead.'
        );
      } else {
        this.req.session.cookie.maxAge = sails.config.custom.rememberMeCookieMaxAge;
      }
    }//ﬁ

    // Modify the active session instance.

    sails.log.debug('*****'+userRecord.id);
        let RED = require("node-red");
        // Create the settings object - see default settings.js file for other options
        let settings = {
                httpAdminRoot:"/red/"+userRecord.id,
                httpNodeRoot: "/api/"+userRecord.id,
                userDir:"/home/tim/.nodered/"+userRecord.id, // change it to point to your user home dir
                functionGlobalContext: { },    // enables global context
                httpNodeMiddleware: function (req, res, next) {
                    const env = process.env.NODE_ENV || 'development';
                    sails.log.debug('<<------------------------------');
                    sails.log.debug("Requested data :: ");
                    sails.log.debug('  ', this.req.method, this.req.url);
                    if (env.toLowerCase() !== 'production') {
                        sails.log.debug('   Headers:');
                        sails.log.debug(this.req.headers);
                        sails.log.debug('   Params:');
                        sails.log.debug(this.req.params);
                        sails.log.debug('   Body:');
                        sails.log.debug(this.req.body);
                    }
                    sails.log.debug('------------------------------>>');
                    return next();
                },
        };
        RED.stop();
        // Initialise the runtime with a server and settings
        RED.init(sails.hooks.http.server,settings);
    
        // Serve the editor UI from /red
        sails.hooks.http.app.use(settings.httpAdminRoot, RED.httpAdmin);
    
        // Serve the http nodes UI from /api
        sails.hooks.http.app.use(settings.httpNodeRoot, RED.httpNode);
    
        // Start the runtime
        RED.start();
    
        //this line causes bug
       this.req.session.RED = RED;
    

    // (This will be persisted when the response is sent.)
    this.req.session.userId = userRecord.id;

  }

};
