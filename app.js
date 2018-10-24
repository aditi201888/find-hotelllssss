/*-----------------------------------------------------------------------------
A simple Language Understanding (LUIS) bot for the Microsoft Bot Framework. 
-----------------------------------------------------------------------------*/

require('dotenv-extended').load({ path: '../.env' });

var builder = require('botbuilder');
var restify = require('restify');
var util = require('util');
var LuisActions = require('botbuilder-cognitiveservices').LuisActionBinding;
//var SampleActions = require('../all');

var luisAppId = process.env.LuisAppId;
var luisAPIKey = process.env.LuisAPIKey;
var luisAPIHostName = process.env.LuisAPIHostName || 'westus.api.cognitive.microsoft.com';

const LuisModelUrl = 'https://' + luisAPIHostName + '/luis/v2.0/apps/' + luisAppId + '?subscription-key=' + luisAPIKey;


// var botbuilder_azure = require("botbuilder-azure");


// var LuisModelUrl = process.env.LUIS_MODEL_URL;

 
 
var cognitiveservices = require('botbuilder-cognitiveservices');

// Make sure you add code to validate these fields

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url); 
});
  
// Create chat connector for communicating with the Bot Framework Service
var connector = new builder.ChatConnector({
    appId: process.env.MicrosoftAppId,
    appPassword: process.env.MicrosoftAppPassword,
    openIdMetadata: process.env.BotOpenIdMetadata 
});

// Listen for messages from users 
server.post('/api/messages', connector.listen());

/*----------------------------------------------------------------------------------------
* Bot Storage: This is a great spot to register the private state storage for your bot. 
* We provide adapters for Azure Table, CosmosDb, SQL Azure, or you can implement your own!
* For samples and documentation, see: https://github.com/Microsoft/BotBuilder-Azure
* ---------------------------------------------------------------------------------------- */

var tableName = 'botdata';
var azureTableClient = new botbuilder_azure.AzureTableClient(tableName, process.env['AzureWebJobsStorage']);
var tableStorage = new botbuilder_azure.AzureBotStorage({ gzipData: false }, azureTableClient);

// Create your bot with a function to receive messages from the user
// This default message handler is invoked if the user's utterance doesn't
// match any intents handled by other dialogs.
var bot = new builder.UniversalBot(connector, function (session, args) {
    session.send('You reached the default message handler. You said \'%s\'.', session.message.text);
});

bot.set('storage', tableStorage);

// Create a recognizer that gets intents from LUIS, and add it to the bot
var recognizer = new builder.LuisRecognizer(LuisModelUrl);
bot.recognizer(recognizer);

var intentDialog = bot.dialog('/', new builder.IntentDialog({ recognizers: [recognizer] })
    .onDefault(DefaultReplyHandler));
    





LuisActions.bindToBotDialog(bot, intentDialog, LuisModelUrl, FindHotelsAction, {
    defaultReply: DefaultReplyHandler,
    fulfillReply: FulfillReplyHandler,
    onContextCreation: onContextCreationHandler
    
});

function DefaultReplyHandler(session) {
    session.endDialog(
        'Sorry, I did not understand "%s". Use sentences like "What is the time in Miami?", "Search for 5 stars hotels in Barcelona", "Tell me the weather in Buenos Aires", "Location of SFO airport".',
        session.message.text);
}

function FulfillReplyHandler(session, actionModel) {
    console.log('Action Binding "' + actionModel.intentName + '" completed:', actionModel);
    session.endDialog(actionModel.result.toString());
}

function onContextCreationHandler(action, actionModel, next, session) {

    // Here you can implement a callback to hydrate the actionModel as per request

    // For example:
    // If your action is related with a 'Booking' intent, then you could do something like:
    // BookingSystem.Hydrate(action) - hydrate action context already stored within some repository
    // (ex. using a booking ref that you can get from the context somehow)

    // To simply showcase the idea, here we are setting the checkin/checkout dates for 1 night
    // when the user starts a contextual intent related with the 'FindHotelsAction'

    // So if you simply write 'Change location to Madrid' the main action will have required parameters already set up
    // and you can get the user information for any purpose

    // The session object is available to read from conversationData or
    // you could identify the user if the session.message.user.id is somehow mapped to a userId in your domain

    // NOTE: Remember to call next() to continue executing the action binding's logic

    if (action.intentName === 'FindHotels') {
        if (!actionModel.parameters.Checkin) {
            actionModel.parameters.Checkin = new Date();
        }

        if (!actionModel.parameters.Checkout) {
            actionModel.parameters.Checkout = new Date();
            actionModel.parameters.Checkout.setDate(actionModel.parameters.Checkout.getDate() + 1);
        }
    }

    next();
}

// var intentDialog = bot.dialog('/', new builder.IntentDialog({ recognizers: [recognizer,FindHotelsAction ] })
//     .onDefault(function (session) {
//         session.endDialog(
//             'Sorry, I did not understand "%s". Use sentences like "What is the time in Miami?", "Search for 5 stars hotels in Barcelona", "Tell me the weather in Buenos Aires", "Location of SFO airport")',
//             session.message.text);
//     }));





// function DefaultReplyHandler(session) {
//     session.endDialog(
//         'Sorry, I did not understand "%s". Use sentences like "What is the time in Miami?", "Search for 5 stars hotels in Barcelona", "Tell me the weather in Buenos Aires", "Location of SFO airport".',
//         session.message.text);
// }

// function FulfillReplyHandler(session, actionModel) {
//     console.log('Action Binding "' + actionModel.intentName + '" completed:', actionModel);
//     session.endDialog(actionModel.result.toString());
// }

// function onContextCreationHandler(action, actionModel, next, session) {

    // Here you can implement a callback to hydrate the actionModel as per request

    // For example:
    // If your action is related with a 'Booking' intent, then you could do something like:
    // BookingSystem.Hydrate(action) - hydrate action context already stored within some repository
    // (ex. using a booking ref that you can get from the context somehow)

    // To simply showcase the idea, here we are setting the checkin/checkout dates for 1 night
    // when the user starts a contextual intent related with the 'FindHotelsAction'

    // So if you simply write 'Change location to Madrid' the main action will have required parameters already set up
    // and you can get the user information for any purpose

    // The session object is available to read from conversationData or
    // you could identify the user if the session.message.user.id is somehow mapped to a userId in your domain

    // NOTE: Remember to call next() to continue executing the action binding's logic

  

//Add a dialog for each intent that the LUIS app recognizes.
//See https://docs.microsoft.com/en-us/bot-framework/nodejs/bot-builder-nodejs-recognize-intent-luis 
// bot.dialog('GreetingDialog',
//     (session) => {
//         session.send('You reached the Greeting intent. You said \'%s\'.', session.message.text);
//         session.endDialog();
//     }
// ).triggerAction({
//     matches: 'Greeting'
// })

// bot.dialog('HelpDialog',
//     (session) => {
//         session.send('You reached the Help intent. You said \'%s\'.', session.message.text);
//         session.endDialog();
//     }
// ).triggerAction({
//     matches: 'Help'
// })

// bot.dialog('CancelDialog',
//     (session) => {
//         session.send('You reached the Cancel intent. You said \'%s\'.', session.message.text);
//         session.endDialog();
//     }
// ).triggerAction({
//     matches: 'Cancel'
// })

var FindHotelsAction = {
    intentName: 'FindHotels',
    friendlyName: 'Find Hotel Room',
    confirmOnContextSwitch: true,           // true by default
    // Property validation based on schema-inspector - https://github.com/Atinux/schema-inspector#v_properties
    schema: {
        Place: {
            type: 'string',
            builtInType: cognitiveservices.LuisBuiltInTypes.GeographyV2.City,
            message: 'Please provide a location'
        },
        Checkin: {
            type: 'date',
            builtInType: cognitiveservices.LuisBuiltInTypes.DateTimeV2.Date,
            validDate: true, message: 'Please provide the check-in date'
        },
        Checkout: {
            type: 'date',
            builtInType: cognitiveservices.LuisBuiltInTypes.DateTimeV2.Date,
            validDate: true, message: 'Please provide the check-out date'
        },
        Category: {
            type: 'string',
            optional: true
        },
        RoomType: {
            type: 'string',
            optional: true
        }
    },
    // Action fulfillment method, recieves parameters as keyed-object (parameters argument) and a callback function to invoke with the fulfillment result.
    fulfill: function (parameters, callback) {
        callback(util.format('Sorry, there are no %s rooms available at %s for your chosen dates (%s) to (%s), please try another search.',
            parameters.RoomType || '', parameters.Place, formatDate(parameters.Checkin), formatDate(parameters.Checkout)));
    }
}

next();

// module.exports = [
//     FindHotelsAction
//     // FindHotelsAction_ChangeLocation,
//     // FindHotelsAction_ChangeCheckin,
//     // FindHotelsAction_ChangeCheckout
// ];


}