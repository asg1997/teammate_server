var admin = require("firebase-admin");
var serviceAccount = require("../teammate/serviceAccountKey.json");
const transliteration = require("transliteration");
const { sunday } = require("rethinkdb/ast");




admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});




const collectionRef = admin.firestore().collection('games');
collectionRef.onSnapshot((snapshot) => {
  snapshot.docChanges().forEach((change) => {
    const isCurrentlyAdd = change.doc.readTime.isEqual(change.doc.updateTime);
    const isAddType = change.type == 'added';

    if (isAddType && isCurrentlyAdd) {
      const doc =  change.doc;
      const city = doc.get('city');
      const creatorId = doc.get('creatorId');
      const description = doc.get('description');
      sendMessageToCitySubscribers(city, creatorId, description)
    }
  });
});
 
async function sendMessageToCitySubscribers(city, creatorId, description) {
  const tokens = await getSendTokens(city, creatorId);
  if (tokens === undefined || tokens.length == 0) return;
  const message = {
    notification: {
      title:`Новая игра!`,
      body: `${city}: ${description}`,
    },
    token: tokens[0],
  };

  await sendMessage(message);
  
}

async function getSendTokens(city, creatorId) {
  const topic = cityToTopic(city);
  const subscribers = await getCitySubscribersTokens(topic);
  if (subscribers === undefined && subscribers.length == 0) return;
  const noGameCreatorTokens = citySubscribersTokensWithoutGameCreator(subscribers, creatorId);
  return noGameCreatorTokens;
}

function  cityToTopic(city) {
  const lowercased = String(city).toLowerCase();
  const transliterated = transliteration.transliterate(lowercased);

  return transliterated;
}

async function sendMessage(message) {
  try {
    await admin.messaging().send(message);
  } catch (e) {
    console.log(e);
  }
}


async function getCitySubscribersTokens(city) {
  const collectionRef = admin.firestore().collection('city_subscribers');
  const snapshot = await collectionRef.doc(city).get();
  const data = snapshot.data();
  if (data === undefined) return [];
  return data.subscribers;
}


function citySubscribersTokensWithoutGameCreator(subscribers, creatorId) {
  const index = subscribers.indexOf(creatorId);
  if (index > -1) {
    subscribers.splice(index, 1);
  }
  return subscribers;
}

