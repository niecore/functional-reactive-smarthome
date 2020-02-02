const Mqtt_stream = require("mqtt");
const Bacon = require("baconjs");
const R = require('ramda');

// topicLense :: Lens s a
const topicLense = R.lensProp("topic");

// payloadLense :: Lens s a
const payloadLense = R.lensProp("payload");

const publishTopic = client => topic => payload => new Promise((resolve) => client.publish(topic, payload, resolve));

const inputStream = client => Bacon.fromBinder(function (sink) {
    client.on('message', function (topic, message) {
        sink({topic: topic, payload: message})
    })
});

module.exports = {
    inputStream,
    topicLense,
    payloadLense,
    publishTopic
};
