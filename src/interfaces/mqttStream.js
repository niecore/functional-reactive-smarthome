const MqttStream = require("mqtt");
const Kefir = require("kefir");
const R = require('ramda');

// topicLense :: Lens s a
const topicLense = R.lensProp("topic");

// payloadLense :: Lens s a
const payloadLense = R.lensProp("payload");

const publishTopic = client => topic => payload => new Promise((resolve) => client.publish(topic, payload, resolve));

const inputStream = client => Kefir.stream(emitter => {
    client.on('message', function (topic, message) {
        emitter.emit({topic: topic, payload: message});
    })
});

module.exports = {
    inputStream,
    topicLense,
    payloadLense,
    publishTopic
};
