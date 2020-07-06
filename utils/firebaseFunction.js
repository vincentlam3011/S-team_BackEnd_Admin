var admin = require("firebase-admin");
var serviceAccount = require('./serviceAccount.json');
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://free2lance-60aff.firebaseio.com"
});
const fireStore = admin.firestore();

module.exports = {
    buildDocKey: (email1, email2) => {
        return [email1, email2].sort().join(':')
    },
    pushNotificationsFirebase: async (email, content) => {
        console.log('checkExistNotificationsFirebase Work!: ', email)
        const notification =
            await fireStore
                .collection('notifications')
                .doc(email)
                .get();

        if (!notification.exists) {
            const setNotify = await fireStore
                .collection('notifications')
                .doc(email)
                .set({
                    email: email,
                    listNotify: [content],
                    isRead: true
                })
        }
        else {
            let arr = admin.firestore.FieldValue.arrayUnion({ content });

            const setNotify = await fireStore
                .collection('notifications')
                .doc(email)
                .update({
                    listNotify: admin.firestore.FieldValue.arrayUnion({
                        content
                    }),
                    isRead: false
                })
        }
        return notification.exists

    }
}