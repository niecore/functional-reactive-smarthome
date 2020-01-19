const R = require('ramda');
const Scenes = require('../config/scenes.json');
const Routes = require('../router');
const Devices = require('../model/devices');

// knownRooms
const knownScenes = Scenes.scenes;

// getDeviceByName :: String => Device | undefined
const getSceneByName = R.prop(R.__, knownScenes);


const isMessageFromRemoteSensor = R.pipe(
    R.view(Routes.inputNameLens),
    Devices.deviceHasType("remote")
);

const isToggleAction = R.pipe(
    R.view(Routes.inputDataLens),
    R.propEq("action", "toggle")
);

const isSceneSelect = R.pipe(
    R.view(Routes.inputDataLens),
    R.anyPass(
        [R.propEq("action", "arrow_left_click"),
        R.propEq("action", "arrow_right_click")]
    )
);

const groupObjBy = R.curry(R.pipe(
    // Call groupBy with the object as pairs, passing only the value to the key function
    R.useWith(R.groupBy, [R.useWith(R.__, [R.last]), R.toPairs]),
    R.map(R.fromPairs)
));

const sceneIsActive = scene => input => {
  return R.reduce(R.and, true)(R.values(R.mapObjIndexed(
      (num, key, obj) => R.whereEq(num)(R.propOr({},key)(input))
  )(scene)));
};

const getSceneFromAction = R.pipe(
    R.view(Routes.inputNameLens),
    getSceneByName
);

const getSelectedScene = R.pipe(
    R.ifElse(
        R.pipe(
            R.view(Routes.inputDataLens),
            R.propEq("action", "arrow_left_click"),
        ),
        R.pipe(
            getSceneFromAction,
            R.nth(2)
        ),
        R.pipe(
            getSceneFromAction,
            R.nth(3)
        )
    )
);

const toogleDefaultScene = input => {
    const scene_off = getSceneFromAction(input)[0];
    const scene_on = getSceneFromAction(input)[1];
    const off = sceneIsActive(scene_off)(R.view(Routes.stateLens,input));
    return off ? scene_on: scene_off;
};

const toggleAction = Routes.input
    .filter(isMessageFromRemoteSensor)
    .filter(isToggleAction)
    .map(toogleDefaultScene);

const sceneAction = Routes.input
    .filter(isMessageFromRemoteSensor)
    .filter(isSceneSelect)
    .map(getSelectedScene)


Routes.output.plug(toggleAction);
Routes.output.plug(sceneAction);
