const admin = require("firebase-admin");
const transliteration = require("transliteration");

class GameModel {
  constructor() {
    this.collectionRef = admin.firestore().collection('games');
  }

  subscribeToGameChanges(onChange) {
    this.collectionRef.onSnapshot((snapshot) => {
      snapshot.docChanges().forEach((change) => {
        const isCurrentlyAdd = change.doc.readTime.isEqual(change.doc.updateTime);
        const isAddType = change.type == 'added';

        if (isAddType && isCurrentlyAdd) {
          const doc = change.doc;

          const city = doc.get('city');
          const creatorId = doc.get('creatorId');
          const sport = doc.get('sport');
          const milliseconds = doc.get('dateTime');
          const dateTime = this.millisecondsToDateTime(milliseconds);
          const localizedSport = this.localeSport(sport);

          onChange(city, creatorId, localizedSport, dateTime);
        }
      });
    });
  }

  async  getSendTokens(city, creatorId) {
    const topic = GameModel.cityToTopic(city);
    const subscribers = await GameModel.getCitySubscribersTokens(topic);
    if (subscribers === undefined && subscribers.length == 0) return;
    const noGameCreatorTokens = GameModel.citySubscribersTokensWithoutGameCreator(subscribers, creatorId);
    return noGameCreatorTokens;
  }
  
  static  cityToTopic(city) {
    const lowercased = String(city).toLowerCase();
    const transliterated = transliteration.transliterate(lowercased);
  
    return transliterated;
  }
  millisecondsToDateTime(milliseconds) {
    return new Date(milliseconds);
  }

  localeSport(sport) {
    if (sport == 'soccer') return 'Футбол';
    if (sport == 'volleyball') return 'Волейбол';
    if (sport == 'basketball') return 'Баскетбол';
  }

  async  sendMessage(message) {
    try {
      await admin.messaging().send(message);
    } catch (e) {
      console.log(e);
    }
  }

 static async  getCitySubscribersTokens(city) {
    const collectionRef = admin.firestore().collection('city_subscribers');
    const snapshot = await collectionRef.doc(city).get();
    const data = snapshot.data();
    if (data === undefined) return [];
    return data.subscribers;
  }
  
  
  static citySubscribersTokensWithoutGameCreator(subscribers, creatorId) {
    const index = subscribers.indexOf(creatorId);
    if (index > -1) {
      subscribers.splice(index, 1);
    }
    return subscribers;
  }
}

module.exports = GameModel;
