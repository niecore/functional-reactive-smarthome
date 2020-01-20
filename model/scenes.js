const R = require('ramda');
const Scenes = require('../config/scenes.json');
const Routes = require('../router');
const Devices = require('../model/devices');

// knownScenes
const knownScenes = Scenes.scenes;

// getSceneByName :: String => Device | undefined
const getSceneByName = R.prop(R.__, knownScenes);

// isMessageFromRemoteSensor :: Msg => Boolean
const isMessageFromRemoteSensor = R.pipe(
    R.view(Routes.inputNameLens),
    Devices.deviceHasType("remote")
);

// isToggleAction :: Msg => Boolean
const isToggleAction = R.pipe(
    R.view(Routes.inputDataLens),
    R.propEq("action", "toggle")
);

// isSceneSelect :: Msg => Boolean
const isSceneSelect = R.pipe(
    R.view(Routes.inputDataLens),
    R.anyPass(
        [R.propEq("action", "arrow_left_click"),
        R.propEq("action", "arrow_right_click")]
    )
);

// isSceneSelect :: Scene => Msg => Boolean
const sceneIsActive = scene => input => {
  return R.reduce(R.and, true)(R.values(R.mapObjIndexed(
      (num, key, obj) => R.whereEq(num)(R.propOr({},key)(input))
  )(scene)));
};

// getSceneFromMsg :: Msg => [Scene] | undefined
const getSceneFromMsg = R.pipe(
    R.view(Routes.inputNameLens),
    getSceneByName
);

// getSelectedScene :: Msg => Scene
const getSelectedScene = R.pipe(
    R.ifElse(
        R.pipe(
            R.view(Routes.inputDataLens),
            R.propEq("action", "arrow_left_click"),
        ),
        R.pipe(
            getSceneFromMsg,
            R.nth(2)
        ),
        R.pipe(
            getSceneFromMsg,
            R.nth(3)
        )
    )
);

// toogleDefaultScene :: Msg => Scene
const toogleDefaultScene = input => {
    const scene_off = getSceneFromMsg(input)[0];
    const scene_on = getSceneFromMsg(input)[1];
    const off = sceneIsActive(scene_off)(R.view(Routes.stateLens,input));
    return off ? scene_on: scene_off;
};

// Automation for toggle button
const toggleAction = Routes.input
    .filter(isMessageFromRemoteSensor)
    .filter(isToggleAction)
    .map(toogleDefaultScene);

// Automation for scene select button
const sceneAction = Routes.input
    .filter(isMessageFromRemoteSensor)
    .filter(isSceneSelect)
    .map(getSelectedScene);


Routes.output.plug(toggleAction);
Routes.output.plug(sceneAction);
