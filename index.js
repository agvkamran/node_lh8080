// const fs = require('fs');

// fs.writeFile('./test.txt', 'second time from node js server', (err) => {
//     console.log(err);
// });

// fs.readFile('./test.txt', {
//     encoding: 'utf8'
// }, (err, data) => {
//     console.log(err);
//     console.log(data);
// })

// const http = require('http');
// const server = http.createServer();
// server.listen(3000, () => {
//     console.log('listening port: 3000')
// })

// server.on('request', () => {
//     console.log('somebody')
// })

// server.on('request', (req, res) =>{
//     res.end(`
//     <h1>Hello</h1>
//     <h2>Bye</h2>
//     `)
// })

// server.on('request', (req, res) => {
//     req.on('data', data => {
//         const reqData = JSON.parse(data.toString());
//         console.log(reqData, reqData.name);
//     })
//     res.end('Hello');
// })


// server.on('request', (req, res) => {
//     req.on('data', data => {
//         const reqData = JSON.parse(data.toString());
//         console.log(reqData)
//     })
//     res.end('byebye')
// })

// const express = require('express');
// const app = express();

// const handleRoot = (req, res) => {
//     res.end('hello from express')
// }

// const handleUsers = (req, res) => {
//     res.end('users array')
// }

// app.get('/', handleRoot);
// app.get('/users', handleUsers);

// app.listen(8080, () => {
//     console.log('hello')
// });


// const app = express();

// const handleRoot = (req, res) => {
//     res.end('handleRoot message')
// }

// const handleUsers = (req, res) => {
//     res.end(`ARRAY`)
// }

// const handleUsersPut = (req, res) => {
//     res.end('ARRAY PUT')
// }

// app.get('/', handleRoot);
// app.get('/users', handleUsers);
// app.put('/users', handleUsersPut);


const express = require('express');
const mongo = require('mongodb').MongoClient;
const url = 'mongodb+srv://user:user123@cluster0.ubhbr.mongodb.net/myFirstDatabase?retryWrites=true&w=majority';
const ObjectId = require('mongodb').ObjectId;

const app = express();
var cors = require('cors')

app.use(express.json());
app.use(cors())

const checkIsNoteCorrect = (note) => {
    if (note && 'title' in note && 'description' in note) {
        return true;
    }
    return false;
}

const handleRoot = (_, res) => {
    res.end('server is working')
}

const handleAddNote = (req, res, db) => {
    console.log(`Received requsest ${JSON.stringify(req.body)}`);
    const isCorrect = checkIsNoteCorrect(req.body);
    if (isCorrect) {
        if (db) {
            const { title, description } = req.body;
            const newNote = { title, description };
            db
                .collection('notes')
                .insertOne(newNote)
                .then(data => {
                    res.statusCode = 201;
                    console.log(`Note succesfully added for ${JSON.stringify(req.body)}`);
                    resp = { id: data.insertedId, title: title, description: description };
                    res.end(JSON.stringify(resp));
                })
                .catch(e => {
                    console.error('handleAddNote', e)
                    res.statusCode = 500;
                    res.end('Error adding note')
                });
        }
    }
    else {
        res.statusCode = 400;
        console.log(`invalid data in ${JSON.stringify(req.body)}`);
        res.end('Not valid data')
    }
}

const handleDelete = (req, res, db) => {
    if (req.body.id) {
        const { id } = req.body;
        db
            .collection('notes')
            .deleteOne({ "_id": ObjectId(id) })
            .then(n => {
                res.statusCode = 200;
                console.log(n);
                console.log('***note deleted***')
                res.end('Deleted note')
            })
            .catch(e => {
                res.statusCode = 500;
                res.end('Error deliting note')
                console.error('handleDelete', e)
            })
    }
    else {
        res.statusCode = 400;
        res.end('Not valid data, BAD REQUEST');
    }
}

const handleChangeNote = () => {

}

const handleGetNote = (req, res, db) => {
    db
        .collection('notes')
        .find({}).toArray(function (err, findRes) {
            if (err) throw err;
            res.statusCode = 200;
            res.contentType("application/json");
            res.end(JSON.stringify(findRes.map(note => {
                return { id: note._id, title: note.title, description: note.description };
            })));
        });
}


mongo.connect(url, (err, client) => {
    if (err) return err;
    console.log("Connected to DB");
    const db = client.db('notesDB');


    app.get('/', handleRoot);
    app.get('/note', (req, res) => handleGetNote(req, res, db));
    app.post('/note', (req, res) => handleAddNote(req, res, db));
    app.delete('/note', (req, res) => handleDelete(req, res, db));

    app.listen(8080, () => {
        console.log('listening 8080')
    })
});


