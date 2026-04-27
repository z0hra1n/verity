const express = require('express')
const app = express()
const axios = require('axios')
const FormData = require('form-data')
const fs = require('fs')

data = new FormData();
data.append('media', fs.createReadStream('C:\\Users\\IQRA\\Downloads\\ai\\img2.png'))
data.append('models', 'genai')
data.append('api_user', '3684042');
data.append('api_secret', 'ooKBRuMvUVZmsvXRZNGKqfsUmnuwhtXJ');

axios({
    method: 'post',
    url:'https://api.sightengine.com/1.0/check.json',
data:data,
headers: data.getHeaders()
})

.then(function (response){

    console.log(response.data);
})

.catch(function (error) {
    if(error.response) 
        console.log(error.response.data);
    else 
        console.log(error.message);
});

app.get('/', (req, res) => {
   res.sendFile(__dirname + '/index.html')
});

app.listen(3000, () => {
    console.log('Server running!')
});
