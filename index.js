// index.js ฉบับแก้ไขสมบูรณ์ (20 Jan 2026)

// 1. โหลด Environment Variables
require('dotenv').config();

const express = require('express');
const webpush = require('web-push');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

// 2. ตั้งค่า Server
app.use(cors());
app.use(bodyParser.json());

// 3. ดึงค่า Key จาก Render
const publicVapidKey = process.env.PUBLIC_VAPID_KEY;
const privateVapidKey = process.env.PRIVATE_VAPID_KEY;
const mailtoEmail = process.env.MAILTO_EMAIL || 'mailto:oonllos@gmail.com';

// ตรวจสอบว่ามี Key ครบไหม
if (!publicVapidKey || !privateVapidKey) {
    console.error("❌ ERROR: ไม่พบ VAPID Keys กรุณาตรวจสอบ Environment Variables ใน Render");
} else {
    console.log("✅ VAPID Keys Loaded Ready.");
    // ตั้งค่า Web Push
    webpush.setVapidDetails(
        mailtoEmail,
        publicVapidKey,
        privateVapidKey
    );
}

// ตัวแปรเก็บข้อมูล Subscription (ใน RAM)
let subscriptions = [];

// --- Routes ---

// เช็คสถานะ Server
app.get('/', (req, res) => {
    res.send('Makro Push Server is Running (Fixed Version)!');
});

// รับการลงทะเบียน (Subscribe)
app.post('/subscribe', (req, res) => {
    const subscription = req.body;
    subscriptions.push(subscription);
    console.log(`➕ ผู้ใช้ใหม่ลงทะเบียน (Total: ${subscriptions.length})`);
    res.status(201).json({});
});

// ส่งแจ้งเตือน (Trigger Push)
app.post('/trigger-push', (req, res) => {
    const { message, branch } = req.body;

    const notificationPayload = JSON.stringify({
        title: `⚡ งานด่วน! สาขา ${branch || 'ไม่ระบุ'}`,
        body: message || 'มีตำแหน่งงานว่าง รีบสมัครด่วน!',
        icon: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
        data: {
            // ⭐ แก้ตรงนี้: ใส่ URL เต็มๆ ของเว็บคุณลงไปเลย
            url: 'https://oonllos.github.io/Pick-Pack/?mode=apply' 
        }
    });

    console.log(`🚀 กำลังส่งแจ้งเตือนไปยัง ${subscriptions.length} คน...`);

    Promise.all(subscriptions.map(sub =>
        webpush.sendNotification(sub, notificationPayload)
            .catch(err => {
                console.error("ส่งไม่ผ่าน 1 คน (อาจจะปิด Browser ไปแล้ว):", err.statusCode);
                return null;
            })
    ))
    .then(() => {
        console.log("✅ ส่ง Broadcast สำเร็จ");
        res.json({ success: true, count: subscriptions.length });
    })
    .catch(err => {
        console.error("❌ เกิดข้อผิดพลาด:", err);
        res.status(500).json({ error: 'Failed to send notifications' });
    });
});

// เริ่มต้น Server
const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});
