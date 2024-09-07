const mongoCleint = require("mongodb").MongoClient
const ObjectId = require("mongodb").ObjectId
const express = require("express")
const app = express()
const multer = require('multer')
const upload = multer()
let router = express.Router()
const bodyParser = require("body-parser")
let url = "mongodb+srv://zizoBoy:741852@islam-data.iovdiwe.mongodb.net/all-data?retryWrites=true&w=majority"
let url2 = "mongodb+srv://abdelazizelhor:COr5wnnV0v4HSOGd@chat.d3kycik.mongodb.net/?retryWrites=true&w=majority"
const { Server } = require('socket.io');
const { createServer } = require('node:http');
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});
let client = new mongoCleint(url, {
    family: 4,
})
var id2 = ''
io.on('connection', (socket) => {
    socket.on('UserId', (id) => {
        socket.id = id;
        id2 = id
        client.connect().then((client) => {
            let db = client.db("chat")
            db.collection(`chat-chat-All-users`).updateOne({ _id: new ObjectId(id) }, {
                $set: {
                    status: 'online'
                }
            }).catch(err => {
            })
            io.sockets.emit('UsersChange', id)
        }).catch(err => {
        })
    });
    socket.on('chat', (msg) => {
        const all = msg;
        client.connect().then((client) => {
            let db = client.db("chat")
            db.collection(`chat-${all.chatId}`).insertOne(all.msg)
                .catch(err => {
                })
        }).catch(err => {
        })
        io.sockets.emit('chat', msg)
    });
    socket.on('disconnect', (e) => {
        client.connect().then((client) => {
            let db = client.db("chat")
            db.collection(`chat-chat-All-users`).updateOne({ _id: new ObjectId(socket.id) }, {
                $set: {
                    status: 'offline',
                    inDate: new Date()
                }
            }).catch(err => {
            })
            io.sockets.emit('UsersChange', id2)
        }).catch(err => {
        })
    });
});

app.use(bodyParser.json())
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*")
    res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
    res.setHeader("Access-Control-Allow-Headers", "Content-Type")
    res.setHeader("Content-Type", "application/json")
    next()
});
app.use(router)
app.get("/get", upload.array(), (req, res) => {
    client.connect().then((client) => {
        let db = client.db("chat")
        db.collection("chat").find({}).toArray().then((data) => {
            res.json(data)
        }).catch(err => {
        })
    }).catch(err => {
    })
})
app.get("/get/:id", upload.array(), (req, res) => {
    let id = req.params.id
    client.connect().then((client) => {
        let db = client.db("chat")
        db.collection(`chat-${id}`).find({}).toArray().then((data) => {
            res.json(data)

        }).catch(err => {
        })

    }).catch(err => {
    })
})
router.post("/add", (req, res, next) => {
    const all = req.body
    client.connect().then((client) => {
        let db = client.db("chat")


        db.collection("chat").insertOne(all)
            .catch(err => {
            })
    }).catch(err => {
    })
})

router.post("/add/:id", (req, res, next) => {
    let id = req.params.id
    const all = req.body;
    client.connect().then((client) => {
        let db = client.db("chat")
        db.collection(`chat-${id}`).insertOne(all)
            .catch(err => {
            }).then(e => {
                res.json(e)
            })
    }).catch(err => {
    })
})


router.post("/update/:chatId/:id", (req, res, next) => {
    let id = req.params.id
    let chatId = req.params.chatId
    const all = req.body
    client.connect().then((client) => {
        let db = client.db("chat")
        db.collection(`chat-${chatId}`).updateOne({ _id: new ObjectId(id) }, {
            $set: {
                ...all
            }
        })

            .catch(err => {
            })
    }).catch(err => {
    }).finally(() => {
        res.json(all)
    })
})

router.use("/delete/:chatId/:id", (req, res, next) => {
    let id = req.params.id
    let chatId = req.params.chatId
    client.connect().then((client) => {
        let db = client.db("chat")
        db.collection(`chat-${chatId}`).deleteOne({ _id: new ObjectId(id) })
            .catch(err => {
            })
    }).catch(err => {
    }).finally(() => {
    })
})

router.post("/emitAll/:chatId", (req, res, next) => {
    console.log(req.body);
    let chatId = req.params.chatId
    io.sockets.emit(chatId, req.body);
});
server.listen(process.env.PORT || 6060, () => {
    console.log("go")
})