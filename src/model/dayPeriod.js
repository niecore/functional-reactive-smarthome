const R = require("ramda");
const {getSunrise, getSunset} = require('sunrise-sunset-js');

const itsDayTime = () => {
    const now = new Date(Date.now());
    return (now >= getSunrise(50.6, 8.7) && now < getSunset(50.6, 8.7));
};

const itsNightTime = R.pipe(
    itsDayTime,
    R.not,
);

module.exports = {
    itsDayTime,
    itsNightTime,
};