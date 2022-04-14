const express = require('express')
const app = express()
const WebSocket = require('ws');
const routes = require('./routes')
const cors = require('cors')
const config = require('config')
const PORT = config.get('serverSettings.port')
const { createProxyMiddleware } = require('http-proxy-middleware');

const options = {
    target: 'http://localhost:8080', // target host
    changeOrigin: true, // needed for virtual hosted sites
    ws: true, // proxy websockets
    pathRewrite: {
        '^/api/old-path': '/api/new-path', // rewrite path
        '^/api/remove/path': '/path', // remove base path
    }
};

const exampleProxy = createProxyMiddleware(options);
app.use('/ws', exampleProxy);


app.use(cors())
app.use('/api', routes)
app.use('/ks', express.static('ks'))
app.use('/', express.static('client/build'))
// app.use('/mainpage', express.static('static'))
// app.use('/check', express.static('static/check'))


app.use(function(req, res, next) {
    res.status(404)

    // respond with html page
    if (req.accepts('html')) {
        res.redirect('/')
        return;
    }

    // default to plain-text. send()
    res.type('txt').send('Not found');
})





app.listen(PORT, () => {
    console.log(`Server running at ${PORT}`);
})

const wss = new WebSocket.Server({ port: 8080 })
let wsClients = {}
let counter = 0

wss.on('connection', function connection(ws) {
    ws.customId = counter++
    ws.on('message', function incoming(message) {
        message = JSON.parse(message)
        ws.userId = message.userId
        switch (message.type){
            case 'newUser':
                wsClients[message.userId] = ws
                break
            case 'newMessage':
                if(wsClients[message.recipientId])
                    wsClients[message.recipientId].send(JSON.stringify({ message }))
                break

            default:
                console.log('err')
                break

        }
    })
    ws.on('close', function (msg){
        delete wsClients[ws.userId]
    } )
});