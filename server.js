const express = require('express');
const webpush = require('web-push');
const cors = require('cors');
const app = express();

// Your VAPID keys
const publicVapidKey = 'BAxkYCGx9HJzvdMgvuA22kaAnbv1RKVCJShjLF5HyIH_c_UxMZJ5xHlrJwZRMA7gaXufxp1nAkBnobj4tu2jW9U';
const privateVapidKey = 'Q3fADfoBxTb-zZ0zSA2Nq1aaUieEmzinXnMA-UZvNAc'; // Replace with your private key

// Set VAPID keys
webpush.setVapidDetails(
    'mailto:amfree8050@gmail.com', // Replace with your email
    publicVapidKey,
    privateVapidKey
);

// Middleware
app.use(cors());
app.use(express.json());

// Store subscriptions (in a real app, you'd use a database)
let subscriptions = [];

// Subscribe Route
app.post('/subscribe', (req, res) => {
    const subscription = req.body;
    subscriptions.push(subscription);
    res.status(201).json({});
});

// Send Notification Route
app.post('/send-notification', async (req, res) => {
    const payload = JSON.stringify({
        title: '🎉 Happy Birthday Jenny!',
        body: 'I(Alvin) made you something special!',
        icon: '/birthday-surprise/images/gift.png'
    });

    try {
        // Send to all subscriptions
        const notifications = subscriptions.map(subscription => 
            webpush.sendNotification(subscription, payload)
        );
        await Promise.all(notifications);
        res.status(200).json({ message: 'Notifications sent successfully' });
    } catch (error) {
        console.error('Error sending notifications:', error);
        res.status(500).json({ error: 'Failed to send notifications' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 