const R = require("ramda");
const Kefir = require("kefir");

const Automations = require("../../config/automations.json");
const Util = require("../util");
const Events = require("../events/events");

const input = new Kefir.pool();

// createSetTemperatureInRoomEvent :: room => temperature => SetTemperatureInRoom
const createSetTemperatureInRoomEvent = room => temperature => Events.createEvent({
    room,
    temperature
}, "SetTemperatureInRoom", Events.emptyState);

// cronWeekdays :: {day: cronstring]
const cronWeekdays = {
    sunday: "0",
    monday: "1",
    tuesday: "2",
    wednesday: "3",
    thursday: "4",
    friday: "5",
    saturday: "6",
    all: "*",
    weekday: "1-5",
    weekend: "6,0"
};

// getWeekdayCron :: String => String
const getWeekdayCron = day => R.prop(day, cronWeekdays);

// getCronStringFromSetpoint :: (String, Int, Int) => String
const getCronStringFromSetpoint = (day, hour, minute) => {
    return minute + " " + hour + " * * " + getWeekdayCron(day);
};

// getSetTemperatureFromPreset :: String => Number
const getSetTemperatureFromPreset = preset => R.prop("heat", R.prop(preset, climatePresets));

const climatePresets = Automations.automations.climate.presets;
const climateRooms = Automations.automations.climate.rooms;
const climatePrograms = Automations.automations.climate.programs;

const climateProgramOutput = Kefir.sequentially(0, Util.convertToArray(climateRooms))
    .flatMap(room_config => {

        const room = room_config.key;
        const program = R.prop(room_config.value.program, climatePrograms);

        return Kefir.sequentially(0, program.setpoints)
            .flatMap(setpoint => {
                const cron = getCronStringFromSetpoint(setpoint.day, setpoint.hour, setpoint.minute);
                const temperature = getSetTemperatureFromPreset(setpoint.preset);

                return Util.schedulerStream(createSetTemperatureInRoomEvent(room)(temperature))(cron)
            });
    });

const output = climateProgramOutput;

module.exports = {
    output,
    input
};
