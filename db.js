const sqlite3 = require('sqlite3').verbose()
const db = new sqlite3.Database('./siteDB.sqlite3', (err) => {
    if (err) {
        return console.error(err.message);
    }
    console.log('Connected to the in-memory SQlite database.');
})


module.exports = {
    addVisitor: function (ip, location) {
        db.run('INSERT INTO visits(ip, country, city) VALUES(?, ?, ?)', [`${ip}`, `${location.country}`, `${location.city}`],
            err => {
                if(err) console.log(err)
            })
    },

    addMessage: function (ip, location, text){
        return new Promise((resolve, reject) => {
            db.run('INSERT INTO messages(ip, country, text) VALUES(?, ?, ?)', [`${ip}`, `${location.country}`, `${text}`],
                err => {
                if(err) return reject(err)
                    resolve()
            })
        })
    },

    getVisitors: function (){
        return new Promise((resolve, reject) => {
            db.all('SELECT * FROM  visits WHERE   ID > (SELECT MAX(ID)  FROM visits) - 30;', (err, row) => {
                if(err) return reject(err)
                resolve(row)
            })
        })
    },

    getMessages: function (){
        return new Promise((resolve, reject) => {
            db.all('SELECT * FROM messages', (err, row) => {
                if(err) return reject(err)
                resolve(row)
            })
        })
    },

    login: function (username){
        return new Promise((resolve, reject) => {
            db.get(`SELECT user_id id, username username, password_hash password, admin admin FROM users WHERE username = ?`,
                [username], (err, row) => {
                if(err) return reject(err)
                    resolve(row)
                })
        })
    },

    clearList: function (list){
        return new Promise((resolve, reject) => {
            db.run(`DELETE FROM ${list}`, err => {
                if(err) return reject(err)
                resolve()
            })
        })
    },

    isUserExist: function (username){
        return new Promise((resolve, reject) => {
            db.get(`SELECT username username FROM users WHERE username = ?`,
                [username], (err, row) => {
                    if(err) return reject(err)
                    resolve(row)
                })
        })
    },

    createNewUser: function (username, password_hash, admin = 0){
        return new Promise((resolve, reject) => {
            db.run('INSERT INTO users(username, password_hash, admin) VALUES(?, ?, ?)',
                [`${username}`, `${password_hash}`, `${admin}`], err => {
                if(err) return reject(err)
                    resolve()
                })
        })
    },

    loadContacts: function (id){
        return new Promise((resolve, reject) => {
            db.all('SELECT DISTINCT sender_id senderId, recipient_id recipientId FROM users_messages WHERE sender_id = ? or recipient_id = ?',
                [id, id],
                (err, row) => {
                if(err) return reject(err)

                let list = []

                row.forEach(el => {
                    if(!list.includes(el.senderId) && el.senderId != id) list.push(el.senderId)
                    if(!list.includes(el.recipientId) && el.recipientId != id) list.push(el.recipientId)
                })
                    resolve(list)
                }
                )
        })
    },
    loadDialog: function (sender, recipient){
        return new Promise((resolve, reject) => {
            db.get('SELECT * from users_messages WHERE sender_id = ? and recipient_id = ? or sender_id = ? and recipient_id = ? ORDER BY message_id DESC LIMIT 1',
                [sender, recipient, recipient, sender],
                (err, row) => {
                if(err) return reject(err)

                resolve(row)
                })
        })
    },

    getUsernameById: function (id){
        return new Promise((resolve, reject) => {
            db.get('SELECT username username FROM users WHERE user_id = ?',
                [id],
                (err, row) => {
                if(err) return reject(err)
                resolve(row)
                })
        })
    },

    getIdByUsername: function (username) {
        return new Promise((resolve, reject) => {
            db.get('SELECT user_id id FROM users WHERE username = ?', [username], (err, row) => {
                if(err) return reject(err)
                resolve(row)
            })
        })
    },

    loadMessages: function (idOne, idTwo){
        return new Promise((resolve, reject) => {
            db.all('SELECT * FROM users_messages WHERE sender_id = ? and recipient_id = ? or sender_id = ? and recipient_id = ? ORDER BY message_id DESC LIMIT 50',
                [idOne, idTwo, idTwo, idOne],
                (err, row) => {
                    if(err) return reject(err)
                    resolve(row)
                })
        })
    },

    writeMessage: function (sender, recipient, message){
        return new Promise((resolve, reject) => {
            db.run('INSERT INTO users_messages(sender_id, recipient_id, message) VALUES(?, ?, ?)',
                [`${sender}`, `${recipient}`, `${message}`], err => {
                    if(err) return console.log(err)
                    resolve(true)
                })
        })
    }

}
