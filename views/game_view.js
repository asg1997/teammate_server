const date = require('date-and-time');
const GameModel = require('../models/game_model');

class GameView {



  constructor(model) {
    this.model = model;
  }

  async sendMessageToCitySubscribers(city, creatorId, sport, dateTime) {
    const tokens = await this.model.getSendTokens(city, creatorId);
    if (tokens === undefined || tokens.length == 0) return;
    const dateStr = date.format(dateTime, 'dd MMM. в HH:mm');
    const message = {
      notification: {
        title: `${city}: ${sport}`,
        body: `${dateStr}. Свяжитесь с организатором`,
      },
      token: tokens[0],
    };


    this.model.sendMessage(message);
  }
}

module.exports = GameView;
