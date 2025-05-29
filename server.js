const express = require('express');
const webpush = require('web-push');
const cors = require('cors');
const path = require('path');
const app = express();

// Your VAPID keys
const publicVapidKey = 'BAxkYCGx9HJzvdMgvuA22kaAnbv1RKVCJShjLF5HyIH_c_UxMZJ5xHlrJwZRMA7gaXufxp1nAkBnobj4tu2jW9U';
const privateVapidKey = 'Q3fADfoBxTb-zZ0zSA2Nq1aaUieEmzinXnMA-UZvNAc';

// Set VAPID keys
webpush.setVapidDetails(
    'mailto:amfree8050@gmail.com',
    publicVapidKey,
    privateVapidKey
);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

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
        body: 'I made you something special!',
        icon: '/images/gift.png'
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

// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Scheduled notification check
const BIRTHDAY_DATE = new Date('2025-05-29T22:22:00');

function checkAndSendNotifications() {
    const now = new Date();
    const timeUntilBirthday = BIRTHDAY_DATE - now;
    
    // If it's birthday time (within 1 minute of the target time)
    if (timeUntilBirthday > 0 && timeUntilBirthday <= 60000) {
        const payload = JSON.stringify({
            title: '🎉 Happy Birthday Jenny!',
            body: 'I made you something special!',
            icon: '/images/gift.png'
        });

        // Send to all subscriptions
        subscriptions.forEach(subscription => {
            webpush.sendNotification(subscription, payload)
                .catch(error => {
                    console.error('Error sending notification:', error);
                    // Remove invalid subscriptions
                    if (error.statusCode === 410) {
                        subscriptions = subscriptions.filter(sub => sub !== subscription);
                    }
                });
        });
    }
}

// Check every minute
setInterval(checkAndSendNotifications, 60000);

// Also check immediately when server starts
checkAndSendNotifications();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 