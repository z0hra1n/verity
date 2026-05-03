const express = require('express')
const app = express()
const axios = require('axios')
const FormData = require('form-data')
const fs = require('fs')
const multer = require('multer')
const upload = multer({dest: 'uploads/'})
const cloudinary = require('cloudinary').v2;
const { createClient } = require('@supabase/supabase-js');

cloudinary.config({
    cloud_name:'djwx9zdot',
    api_key: '137748942481153',
    api_secret: 'smntiUUsS1gCskNWsuVI7WSgHAg'
})

const supabase = createClient(
    'https://dyudxshfokqzlasmejxw.supabase.co',
    'sb_publishable_rbTveADeGa999mYwQ0qKjg_MrNnMGkq'
)

app.use(express.json());
app.use(express.static('public'));



app.post('/verify-art', upload.single('artImage'), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    console.log("--- New Upload Attempt ---");
    console.log("Artist:", req.body.artistName); // If this says 'undefined', fix your frontend order!

    const data = new FormData();
    data.append('media', fs.createReadStream(req.file.path));
    data.append('models', 'genai');
    data.append('api_user', '3684042');
    data.append('api_secret', 'ooKBRuMvUVZmsvXRZNGKqfsUmnuwhtXJ');

    try {
        const apiRes = await axios({
            method: 'post',
            url: 'https://api.sightengine.com/1.0/check.json',
            data: data,
            headers: data.getHeaders()
        });

        // Safe extraction of the score
        const aiScore = (apiRes.data && apiRes.data.type) ? apiRes.data.type.ai_generated : 0;
        console.log("AI Score from Sightengine:", aiScore);

        // Check the score (0.99 for testing to be super safe)
        if (aiScore >= 0.70) {
            console.log("REJECTED BY AI POLICY");
            if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
            return res.json({ status: 'fail', score: aiScore });
        }

        console.log("Passed AI check. Uploading to Cloudinary...");
        const cloudRes = await cloudinary.uploader.upload(req.file.path);

        const randomID = Math.random().toString(36).toUpperCase().substring(2, 10);
        const serialCode = `VRT-${randomID}`;

        console.log("Saving to Supabase...");
        const { error: dbError } = await supabase
            .from('certifications')
            .insert([{
                serial: serialCode,
                artist: req.body.artistName || 'Anonymous',
                art: req.body.artName || 'Untitled',
                image: cloudRes.secure_url
            }]);

        if (dbError) {
            const { data, error } = await supabase
           .from('certifications')
           .insert([{
           serial: serialCode,
           artist: req.body.artistName || 'Anonymous',
           art: req.body.artName || 'Untitled',
           image: cloudRes.secure_url
          }]);

        console.log("INSERT DATA:", data);
        console.log("INSERT ERROR:", error);
            if (error){
                throw error;
            }
        }

        if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        
        console.log("SUCCESS! Serial generated:", serialCode);
        return res.json({ status: 'success', serial: serialCode, score: aiScore });

    } catch (err) {
        console.error("SERVER CRASH DETAILS:", err.message);
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        // Send actual error back so frontend doesn't just "guess" rejection
        return res.status(500).json({ status: 'error', message: err.message });
    }
});

   app.post('/update-metadata', async (req, res) => {
    console.log("Incoming body:", req.body);
    const { serial, artist, art } = req.body;
    const { error } = await supabase
    .from('certifications')
    .update({
        artist: artist,
        art: art
        
    })
    .eq('serial', serial);

    if (error) {
        return res.status(500).json({ error: error.message });
    }

    res.json({ status: 'updated' });


   });

   

    app.get('/', (req, res) => {
   res.sendFile(__dirname + '/index.html')
});

app.listen(3000, '0.0.0.0', () => {
    console.log('Server running!')
});



