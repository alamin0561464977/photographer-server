const express = require('express');
const cors = require('cors');
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;


app.use(cors());
app.use(express.json());

console.log(process.env.db_user_password)

app.get('/', (req, res) => {
    res.send('Photographer Project Running')
});

app.listen(port, () => {
    console.log('Photographer Project Running on Port', port)
})