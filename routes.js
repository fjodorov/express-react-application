const express = require('express')
const router = express.Router()
const { lookup } = require('geoip-lite')
const bodyParser = require('body-parser')
const bcrypt = require('bcrypt');
const config = require('config')
const db = require('./db')
const jwt = require('jsonwebtoken');
const saltRounds = 10;

const jsonParser = bodyParser.json()
//const urlencodedParser = bodyParser.urlencoded({ extended: false })

const TOKEN_SECRET = config.get('serverSettings.token_secret')

function checkToken(token){
    try{
        return  jwt.verify(token, TOKEN_SECRET)
    }catch (e) {
        return false
    }
}




router.get('/addvisitor', (req, res) => {
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    let location = lookup(ip)
    if(location == null) location = { country: '', city: '' }
    db.addVisitor(ip, location)
    console.log('We have a visitor')
    res.sendStatus(200)
})


router.post('/write', jsonParser, (req, res) => {
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    let location = lookup(ip)
    if(location == null) location = { country: '' }
    console.log(`Message from ${location.country}:`, req.body.message)
    db.addMessage(ip, location, req.body.message)
        .then(() => {
            res.send(JSON.stringify({ answer: 'I will read it as early as possible/Скоро прочту'}))
        })
        .catch(err => console.log(err))

})

router.post('/login', jsonParser, (req, res) => {
    const { username, password } = req.body

    db.login(username)
        .then(row => {
            if(!row) return res.status(200).send({ isCorrect: false, message: 'Invalid login!' })
            bcrypt.compare(password, row.password, function (err, isCorrect) {
                if(isCorrect){
                    const token = jwt.sign({ username, admin: row.admin, id: row.id }, TOKEN_SECRET, { expiresIn: '1200s' })
                    res.status(200).send(JSON.stringify({ username, token, isCorrect, id: row.id, admin: row.admin }))
                }else{
                    res.status(200).send({ isCorrect })
                }
            })
        })
        .catch(e => console.log(e))

})

router.post('/getvisitors', jsonParser, (req, res) => {
    const ver = checkToken(req.body.token)
    if(ver.admin){
            db.getVisitors()
                .then(visits => {
                    db.getMessages()
                        .then(messages => {
                            res.status(200).send(JSON.stringify({ visits, messages, successful: true }))
                        })
                        .catch(e => res.sendStatus(403))
                })
                .catch(e => res.sendStatus(403))
        }else{
        res.send({ successful: false })
    }
})

router.post('/checkauth', jsonParser, (req, res) => {
    const ver = checkToken(req.body.token)
    if(ver){
        res.status(200).send({ authenticated: true })
    }else{
        res.status(200).send({ authenticated: false })
    }
})

router.post('/clearlist', jsonParser, (req, res) => {
    const ver = checkToken(req.body.token)

    if(ver){
        db.clearList(req.body.list)
            .then(() =>  res.status(200).send({ successful: true }))
            .catch(e => {
                console.log(e)
                res.status(500).send({ successful: false })
            })
    }else{
        res.status(200).send({ successful: false })
    }
})

router.post('/register', jsonParser, (req, res) => {
    const condidate = req.body
    if(condidate.username.length < 4 || condidate.username.length > 12)
        return res.send({ isCorrect: false, message: 'Incorrect username' })
    if(condidate.password.length < 4 || condidate.password.length > 12)
        return res.send({ isCorrect: false, message: 'Incorrect password' })
    db.isUserExist(condidate.username)
        .then(result => {
            if(result) return res.send({ isCorrect: false, message: 'Username already used' })
            bcrypt.hash(condidate.password, saltRounds, function(err, hash) {
                if(err) console.log(err)
                db.createNewUser(condidate.username, hash)
                    .then(() => {
                        db.getIdByUsername(condidate.username)
                            .then(row => {
                                const token = jwt.sign({ username: condidate.username, id: row.id, admin: 0 }, TOKEN_SECRET, { expiresIn: '12000s' })
                                res.status(200).send(JSON.stringify({ username: condidate.username, id: row.id, admin: 0, token, isCorrect: true }))
                            })
                            .catch(e => console.log(e))
                    })
                    .catch(e => console.log(e))
            });
        })
})

router.post('/getcontacts', jsonParser, async (req, res) => {
    const checkedToken = checkToken(req.body.token)
    let dialogs = []
    if(checkedToken) {
     try{
         let contacts = await db.loadContacts(checkedToken.id)
         for(const el of contacts){
             const name = await db.getUsernameById(el)
             dialogs.push({ ...await db.loadDialog(checkedToken.id, el), senderUsername: name.username })
         }
         res.send(JSON.stringify({ dialogs: dialogs }))
         console.log(dialogs)
     }
     catch (e){
         res.send(JSON.stringify({ message: 'Error' }))
         console.log('Error in getcontacts')
     }
    }
})

router.post('/loadmessages', jsonParser, async(req, res) =>{
    const checkedToken = checkToken(req.body.token)
    if(checkedToken.id === req.body.idOne || checkedToken.id === req.body.idTwo ){
        const messages = await db.loadMessages(req.body.idOne, req.body.idTwo)
        res.send(JSON.stringify({ messages }))

    }
})

router.post('/sendmessage', jsonParser, async (req, res) =>{
    const checkedToken = checkToken(req.body.token)
    if(checkedToken){
        await db.writeMessage(checkedToken.id, req.body.recipient, req.body.message)
        res.send(JSON.stringify({ message: 'ok' }))
    }else{
        res.sendStatus(201)
    }
})

router.post('/getid', jsonParser, async (req, res) => {
    const checkedToken = checkToken(req.body.token)

    if(checkedToken){
        db.getIdByUsername(req.body.username)
            .then(result => res.send(JSON.stringify({ ...result })))


    }
})



module.exports = router
