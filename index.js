const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");
const GameModel = require("./models/game_model");
const GameView = require("./views/game_view");
const GameController = require('./contollers/game_controller');



admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const model = new GameModel();
const view = new GameView(model);
const controller = new GameController(model, view);

controller.initialize();
