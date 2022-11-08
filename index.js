const express = require('express');
const cors = require('cors');
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;


app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Photographer Project Running')
});


// ==============================================================================


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.db_user_name}:${process.env.db_user_password}@cluster0.blopt.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run() {
    try {
        const servicesCollection = client.db("photographer").collection("services");
        const serviceReviewCollection = client.db("photographer").collection("service-review");

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

        app.post('/service-review', async (req, res) => {
            const result = await serviceReviewCollection.insertOne(req.body);
            console.log(result);
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
















