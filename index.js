const express = require('express');
const webpush = require('web-push');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

// อนุญาตให้ทุกเว็บเรียกใช้งาน (จำเป็นสำหรับ Github Pages)
app.use(cors());
app.use(bodyParser.json());

const publicVapidKey = 'BADoIRIstMKN9nMxO2GapvbSSssA84-1ByEFexro6syeZScJoajrGAXDPA_atNhl0SmxfeazS-ZPUGZH3DaHvnY';
const privateVapidKey = 'EtNNLH-OXPFeGm1qah4JTffWcUr6-bBuSD1tV0174bc';

webpush.setVapidDetails(
    'mailto:oonllos@gmail.com',
    publicVapidKey,
    privateVapidKey
);

// เก็บข้อมูลคน Subscribe ไว้ในหน่วยความจำชั่วคราว
// (หมายเหตุ: ถ้า Server รีสตาร์ท ข้อมูลนี้จะหายไป ของจริงควรใช้ Database)
let subscriptions = [];

app.get('/', (req, res) => {
    res.send('Makro Push Server is Running!');
});

app.post('/subscribe', (req, res) => {
    const subscription = req.body;
    subscriptions.push(subscription);
    console.log('New User Subscribed. Total:', subscriptions.length);
    res.status(201).json({});
});

app.post('/trigger-push', (req, res) => {
    const { message, branch } = req.body;
    const payload = JSON.stringify({
        title: `⚡ งานด่วน! สาขา ${branch}`,
        body: message,
    });

    Promise.all(subscriptions.map(sub => 
        webpush.sendNotification(sub, payload).catch(err => console.error(err))
    ))
    .then(() => res.json({ success: true }))
    .catch(err => res.status(500).json({ error: err.message }));
});

// ใช้ Port จากระบบ (Render) หรือ 5000 ถ้าในเครื่อง
const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server started on port ${port}`));
