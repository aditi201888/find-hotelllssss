var util = require('util');
var rp = require('request-promise');
var cognitiveservices = require('botbuilder-cognitiveservices');

var ApixuApiKey = process.env.APIXU_API_KEY || 'fcfe74816dd241fca46160635171002';

var WeatherInPlaceAction = {
    intentName: 'WeatherInPlace',
    friendlyName: 'What\'s the weather?',
    // Property validation based on schema-inspector - https://github.com/Atinux/schema-inspector#v_properties
    schema: {
        Place: {
            type: 'string',
            builtInType: cognitiveservices.LuisBuiltInTypes.GeographyV2.City,
            message: 'Please provide a location'
        }
    },
    // Action fulfillment method, recieves parameters as keyed-object (parameters argument) and a callback function to invoke with the fulfillment result.
    fulfill: function (parameters, callback) {
        rp({
            url: util.format('http://api.apixu.com/v1/current.json?key=%s&q=%s', ApixuApiKey, encodeURIComponent(parameters.Place)),
            json: true
        }).then(function (data) {
            if (data.error) {
                callback(data.error.message + ': "' + parameters.Place + '"');
            } else {
                callback(util.format('The current weather in %s, %s is %s (humidity %s %%)',
                    data.location.name, data.location.country, data.current.condition.text, data.current.humidity));
            }
        }).catch(console.error);
    }
};

module.exports = WeatherInPlaceAction;