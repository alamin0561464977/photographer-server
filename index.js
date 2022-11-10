const express = require('express');
const cors = require('cors');
require("dotenv").config();
const jwt = require('jsonwebtoken');
const app = express();
const port = process.env.PORT || 5000;


app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Photographer Project Running')
});


function verifyJWT(req, res, next) {
    const headers = req.headers.authorization;
    console.log(headers)

    if (!headers) {
        return res.status(401).send('unauthorized access (401)');
    }
    const token = headers.split(' ')[1];
    jwt.verify(token, process.env.jwt_token, (error, decoded) => {
        if (error) {
            return res.status(403).send('unauthorized access (403)');
        };
        req.decoded = decoded;
    });
    next();
}

// ==============================================================================


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.db_user_name}:${process.env.db_user_password}@cluster0.blopt.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run() {
    try {
        const servicesCollection = client.db("photographer").collection("services");
        const serviceReviewCollection = client.db("photographer").collection("service-review");

        app.post('/jwt', (req, res) => {
            const email = req.body;
            const token = jwt.sign(email, process.env.jwt_token, { expiresIn: '1h' });
            console.log(email, token)
            res.send({ token })
        })

        app.get('/services', async (req, res) => {
            const services = await servicesCollection.find({}).limit(3).toArray();
            res.send(services);
        })
        app.get('/services-all', async (req, res) => {
            const services = await servicesCollection.find({}).toArray();
            res.send(services);
        });
        app.get('/service-details/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const serviceDetails = await servicesCollection.findOne(filter);
            res.send(serviceDetails);
        });
        app.get('/review/:id', async (req, res) => {
            const services_id = req.params.id;
            const filter = { details_id: services_id };
            const reviews = await serviceReviewCollection.find(filter).toArray();
            res.send(reviews);
        });
        app.get('/my-review', verifyJWT, async (req, res) => {
            const email = req.query.email;
            const id = req.params.id;
            if (req.decoded.email !== email) {
                res.status(403).send('unauthorized access (403)')
            }
            const filter = { email: email };
            const myReviews = await serviceReviewCollection.find(filter).toArray();
            res.send(myReviews);
        });
        app.get('/rreview/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const review = await serviceReviewCollection.findOne(filter);
            res.send(review)
        })

        app.post('/service-review', async (req, res) => {
            const result = await serviceReviewCollection.insertOne(req.body);
            res.send(result);
        });
        app.post('/add-service', verifyJWT, async (req, res) => {
            const service = req.body;
            const result = await servicesCollection.insertOne(service);
            res.send(result);
        });

        app.put('/update-review/:id', async (req, res) => {
            const id = req.params.id;
            const review = req.body;
            const filter = { _id: ObjectId(id) };
            const option = { upsert: true };
            const updateReview = { $set: review };
            const result = await serviceReviewCollection.updateOne(filter, updateReview, option);
            res.send(result);

        });

        app.delete('/delete-review', async (req, res) => {
            const id = req.headers.id;
            const filter = { _id: ObjectId(id) };
            const result = await serviceReviewCollection.deleteOne(filter);
            res.send(result);
        })

    }
    finally {

    }
};
run().catch(err => console.log(err))

// ==============================================================================

app.listen(port, () => {
    console.log('Photographer Project Running on Port', port)
});

