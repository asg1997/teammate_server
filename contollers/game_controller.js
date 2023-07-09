const GameModel = require('../models/game_model'); 
const GameView = require('../views/game_view'); 



class GameController {
  
  

  constructor(model, view) {
    this.model = model;
    this.view = view;
  }

  initialize() {
    this.model.subscribeToGameChanges((city, creatorId, sport, dateTime) => {
      this.view.sendMessageToCitySubscribers(city, creatorId, sport, dateTime);
    });
  }
}

module.exports = GameController;
