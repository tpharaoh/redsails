module.exports = {


    friendlyName: 'Deliver contact form message',
  
    admin: (req, res) => {
    sails.hooks.nodered.RED.httpAdmin;
    //RED.start();
    },
    
    api: (req, res) => {
    sails.hooks.nodered.RED.httpNode;
    }
}