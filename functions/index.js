const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors')({origin: true});
const webpush = require('web-push');
const serviceAccount = require("./newagent-7ca34.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://newagent-7ca34.firebaseio.com/"
})

exports.storePostData = functions.https.onRequest((request, response) => {
  cors(request, response, () => {
    admin.database().ref('posts').push({
      id: request.body.id,
      title: request.body.title,
      location: request.body.location,
      image: request.body.image,
    }).then(() => {
      webpush.setVapidDetails('mailto:a@a.com', 'BIHbWfR5T3zwPJwKN7yarZgvp602zdcpA6RqTnQIvpjXO9xZOGykOPf14GURBLiO7bbFEqaiCnRkwFDXRiULshM', 'cj1TbmSt_VqdSsdBOFAgWQ9vWyAQNbgOoeu932Hh-kY');
      return admin.database().ref('subscriptions').once('value')
    }).then(subscriptions => {
      subscriptions.forEach((sub) => {
        const config = {
          endpoint: sub.val().endpoint,
          keys: {
            auth: sub.val().keys.auth,
            p256dh: sub.val().keys.p256dh,
          }
        }

        webpush.sendNotification(config, JSON.stringify({title: 'New Post', content: 'New post created'}))
          .catch(err => console.log(err))
      })
      response.status(201).json({message: 'Data stored', id: request.body.id})
    }).catch((err) => {
      response.status(500).json({err})
    })
  })
});
