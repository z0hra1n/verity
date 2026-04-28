const express = require('express')
const app = express()
const axios = require('axios')
const FormData = require('form-data')
const fs = require('fs')
const multer = require('multer')
const upload = multer({dest: 'uploads/'})

app.use(express.static('public'));

app.post('/verify-art', upload.single('artImage'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    

const fs = require('fs');
data = new FormData();
data.append('media', fs.createReadStream(req.file.path))
data.append('models', 'genai')
data.append('api_user', '3684042');
data.append('api_secret', 'ooKBRuMvUVZmsvXRZNGKqfsUmnuwhtXJ');

if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
    }

axios({
    method: 'post',
    url:'https://api.sightengine.com/1.0/check.json',
data:data,
headers: data.getHeaders()
})

.then(apiRes => {
    fs.unlinkSync(req.file.path);
    res.json(apiRes.data);
})

.catch(err =>{
    res.status(500).json({ error: err.message});
})
});

app.get('/', (req, res) => {
   res.sendFile(__dirname + '/index.html')
});

app.listen(3000, () => {
    console.log('Server running!')
});
