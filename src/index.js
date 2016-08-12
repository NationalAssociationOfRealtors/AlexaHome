/**
 * Alexa Home
 * CRT Labs 2015
 * https://crtlabs.org
 */
require('dotenv').config()
var https = require('https');

/**
 * The AlexaSkill Module that has the AlexaSkill prototype and helper functions
 */
var AlexaSkill = require('./AlexaSkill');

/**
 * RosettaHomeSkill is a child of AlexaSkill.
 */
var RosettaHomeSkill = function() {
    AlexaSkill.call(this, process.env.APP_ID);
};

// Extend AlexaSkill
RosettaHomeSkill.prototype = Object.create(AlexaSkill.prototype);
RosettaHomeSkill.prototype.constructor = RosettaHomeSkill;

RosettaHomeSkill.prototype.eventHandlers.onSessionStarted = function(sessionStartedRequest, session) {
    console.log("RosettaHomeSkill onSessionStarted requestId: " + sessionStartedRequest.requestId +
        ", sessionId: " + session.sessionId);

};

RosettaHomeSkill.prototype.eventHandlers.onLaunch = function(launchRequest, session, response) {
    console.log("RosettaHomeSkill onLaunch requestId: " + launchRequest.requestId + ", sessionId: " + session.sessionId);
    getWelcomeResponse(response);
};

RosettaHomeSkill.prototype.eventHandlers.onSessionEnded = function(sessionEndedRequest, session) {
    console.log("onSessionEnded requestId: " + sessionEndedRequest.requestId +
        ", sessionId: " + session.sessionId);
};

RosettaHomeSkill.prototype.intentHandlers = {


    AirQualityIntent: function(intent, session, response) {
        var sessionAttributes = {};
        var content = "";
        var prefixContent = "";
        var cardContent = "";
        var cardTitle = "";
        var repromptText = "How else may I help?";


        getIAQData(process.env.IAQ_URL, function(SensorData) {
            humidityFlag = 0;
            co2Flag = 0;
            tempWarning = 0;
            var speechText = "";

            sessionAttributes.text = SensorData;
            session.attributes = sessionAttributes;
            if (SensorData.length == 0) {
                speechText = "There is a problem connecting to Rosetta Home at this time. Please try again later.";
                cardContent = speechText;
                response.tell(speechText);
            } else {

                cardContent = cardContent + SensorData + " ";
                speechText = "<p>" + speechText + "Carbon Dioxide is at " + SensorData[0].co2 + " parts per million. Temperature is at " + parseInt(SensorData[0].temperature * 1.8 + 32) + " degrees farenheit and " + "Humidity is at " + SensorData[0].humidity + " percent. ";

                if (SensorData[0].humidity >= 65) {
                    humidityFlag = 1;
                }
                if (SensorData[0].co2 >= 900) {
                    co2Flag = 1;
                }

                if ((humidityFlag == 0) && (co2Flag == 0)) {
                    speechText = speechText + "Everything looks good.";
                }

                if ((humidityFlag == 1) && (co2Flag == 0)) {
                    speechText = speechText + "Your Humidity Levels are higher than recommended, consider ventilating the room or using a dehumidifier.";
                }

                if ((humidityFlag == 1) && (co2Flag == 1)) {
                    speechText = speechText + "Both Humidity and Carbon Dioxide are higher than recommended. Consider ventilating the room or opening a window.";
                }


                speechText = speechText + "</p>";

                response.askWithCard({
                    speech: "<speak>" + prefixContent + speechText + "</speak>",
                    type: AlexaSkill.speechOutput.SSML
                }, {
                    speech: repromptText,
                    type: AlexaSkill.speechOutput.PLAIN_TEXT
                }, cardTitle, cardContent);
            }
        });
    },



    EnergyUsageIntent: function(intent, session, response) {
        var sessionAttributes = {};
        var content = "";
        var prefixContent = "";
        var cardContent = "";
        var cardTitle = "";
        var repromptText = "How else may I help?";

        getEnergyData(function(SensorData) {
            humidityFlag = 0;
            co2Flag = 0;
            tempWarning = 0;
            var speechText = "";

            sessionAttributes.text = SensorData;
            session.attributes = sessionAttributes;
            if (SensorData.length == 0) {
                speechText = "There is a problem connecting to Rosetta Home at this time. Please try again later.";
                cardContent = speechText;
                response.tell(speechText);
            } else {

                cardContent = cardContent + SensorData + " ";
                speechText = "<p>" + speechText + "Current Energy Usage is at  " + SensorData.consumptionPower + " watts, or about " + parseInt((SensorData.consumptionPower / 1000 * 15) * 1.09) + " cents per hour.";
                //speechText = "<p>" + speechText + "Current Energy Usage is at 345 watts, or about 6 cents per hour.";

                speechText = speechText + "</p>";

                response.askWithCard({
                    speech: "<speak>" + prefixContent + speechText + "</speak>",
                    type: AlexaSkill.speechOutput.SSML
                }, {
                    speech: repromptText,
                    type: AlexaSkill.speechOutput.PLAIN_TEXT
                }, cardTitle, cardContent);
            }
        });

    },

    HelpIntent: function(intent, session, response) {
        var speechOutput = "With Rosetta Home, you can get indoor air quality about your home. You can also ask questions about basic home maintenance. How can I help?";
        var repromptText = "How else may I help?";
        response.ask({
            speech: speechOutput,
            type: AlexaSkill.speechOutput.PLAIN_TEXT
        }, {
            speech: repromptText,
            type: AlexaSkill.speechOutput.PLAIN_TEXT
        });
    },

    FinishIntent: function(intent, session, response) {
        var speechOutput = "Goodbye";
        response.tell({
            speech: speechOutput,
            type: AlexaSkill.speechOutput.PLAIN_TEXT
        });
    },

    HelpCOtwoIntent: function(intent, session, response) {
        var speechOutput = "A safe range for carbon dioxide is anything under 1000 parts per million. " +
            " Anything higher than that may lead to Headaches, sleepiness, and stuffy air.";
        var repromptText = "How else may I help?";
        response.ask({
            speech: speechOutput,
            type: AlexaSkill.speechOutput.PLAIN_TEXT
        }, {
            speech: repromptText,
            type: AlexaSkill.speechOutput.PLAIN_TEXT
        });

    },

    HelpAirFilterIntent: function(intent, session, response) {
        var speechOutput = "Depending on the number of occupants, household pets, and allergies - air filters should be replaced every 3 to 6 months";
        var repromptText = "How else may I help?";
        response.ask({
            speech: speechOutput,
            type: AlexaSkill.speechOutput.PLAIN_TEXT
        }, {
            speech: repromptText,
            type: AlexaSkill.speechOutput.PLAIN_TEXT
        });

    },

    DigSafeIntent: function(intent, session, response) {
        var speechOutput = "The number for dig safe is 8 1 1 and it is recommended you dial dig safe at least a few days before you start any digging project.";
        var repromptText = "How else may I help?";
        response.ask({
            speech: speechOutput,
            type: AlexaSkill.speechOutput.PLAIN_TEXT
        }, {
            speech: repromptText,
            type: AlexaSkill.speechOutput.PLAIN_TEXT
        });

    },

    SmokeDetectorIntent: function(intent, session, response) {
        var speechOutput = "According to the Federal Emergency Management Agency, smoke detectors should be tested at least once a month, and batteries should be replaced at least twice a year. ";
        var repromptText = "How else may I help?";
        response.ask({
            speech: speechOutput,
            type: AlexaSkill.speechOutput.PLAIN_TEXT
        }, {
            speech: repromptText,
            type: AlexaSkill.speechOutput.PLAIN_TEXT
        });

    },
    FireExtinguisherIntent: function(intent, session, response) {
        var speechOutput = "It is recommended you keep at least one fire extinguisher in your kitchen and one in your garage. Ideally, you should keep one on every level of your home."
        var repromptText = "How else may I help?";
        response.ask({
            speech: speechOutput,
            type: AlexaSkill.speechOutput.PLAIN_TEXT
        }, {
            speech: repromptText,
            type: AlexaSkill.speechOutput.PLAIN_TEXT
        });

    },
    RadonIntent: function(intent, session, response) {
        var speechOutput = "Radon is estimated to be the second highest cause of lung cancer in the U.S. and can be a problem in every state. Low cost testing kits are available at home improvement stores and online.";
        var repromptText = "How else may I help?";
        response.ask({
            speech: speechOutput,
            type: AlexaSkill.speechOutput.PLAIN_TEXT
        }, {
            speech: repromptText,
            type: AlexaSkill.speechOutput.PLAIN_TEXT
        });

    },

    EmergencyIntent: function(intent, session, response) {
        var speechOutput = "Incase of emergencies, it is always recommended an escape plan be created to teach all family members (especially children) how to exit the home from different locations. Make sure to also establish a meeting place outside.";
        var repromptText = "How else may I help?";
        response.ask({
            speech: speechOutput,
            type: AlexaSkill.speechOutput.PLAIN_TEXT
        }, {
            speech: repromptText,
            type: AlexaSkill.speechOutput.PLAIN_TEXT
        });

    }


};

/**
 * Function to handle the onLaunch skill behavior
 */

function getWelcomeResponse(response) {

    // If we wanted to initialize the session to have some attributes we could add those here.
    var sessionAttributes = {};

    var cardTitle = "Rosetta Home";
    var repromptText = "With Rosetta Home, you can get indoor air quality about your home. You can also ask questions about basic home maintenance. How can I help?";
    var speechOutput = "<p>Rosetta Home.</p> <p>How can I help you?</p>";
    var cardOutput = "How can I help you?";

    // If the user either does not reply to the welcome message or says something that is not
    // understood, they will be prompted again with this text.

    response.askWithCard({
        speech: "<speak>" + speechOutput + "</speak>",
        type: AlexaSkill.speechOutput.SSML
    }, {
        speech: repromptText,
        type: AlexaSkill.speechOutput.PLAIN_TEXT
    }, cardTitle, cardOutput);
}


function getIAQData(url_prefix, eventCallback) {

    var url = url_prefix + process.env.LOCATION_ID + '/current';

    console.log(url);

    https.get(url, function(res) {
        var body = '';

        res.on('data', function(chunk) {
            body += chunk;
        });

        res.on('end', function() {
            var stringResult = parseIAQJSON(body);
            eventCallback(stringResult);
        });
    }).on('error', function(e) {
        console.log("Got error: ", e);
    });
}

function getEnergyData(eventCallback) {

    var options = {
        hostname: 'api.neur.io',
        port: 443,
        path: '/v1/samples/live/last?sensorId=' + process.env.NEURIO_SENSOR_ID,
        headers: {
            'Authorization': 'Bearer ' + process.env.NEURIO_TOKEN
        },
        method: 'GET'

    };

    https.get(options, function(res) {
        var body = '';

        res.on('data', function(chunk) {
            body += chunk;
        });

        res.on('end', function() {
            var stringResult = parseEnergyJSON(body);
            eventCallback(stringResult);
        });
    }).on('error', function(e) {
        console.log("Got error: ", e);
    });

}

function parseIAQJSON(text) {

    var jsonContent = JSON.parse(text);

    console.log(jsonContent[0].co2);
    console.log(jsonContent[0].temperature);
    console.log(jsonContent[0].humidity);

    var ret = [];
    if (text.length == 0) {
        return ret;
    }

    return jsonContent;
}


function parseEnergyJSON(text) {

    var jsonContent = JSON.parse(text);

    console.log(jsonContent.consumptionPower);


    var ret = [];
    if (text.length == 0) {
        return ret;
    }

    return jsonContent;
}

// Create the handler that responds to the Alexa Request.
exports.handler = function(event, context) {
    // Create an instance of the RosettaHome Skill.
    var skill = new RosettaHomeSkill();
    skill.execute(event, context);
};
