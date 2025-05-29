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
    console.log('New subscription received:', subscription);
    
    // Check if subscription already exists
    const exists = subscriptions.some(sub => 
        sub.endpoint === subscription.endpoint
    );
    
    if (!exists) {
        subscriptions.push(subscription);
        console.log('Total subscriptions:', subscriptions.length);
    }
    
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
        console.log('Sending notifications to', subscriptions.length, 'subscribers');
        // Send to all subscriptions
        const notifications = subscriptions.map(subscription => 
            webpush.sendNotification(subscription, payload)
                .catch(error => {
                    console.error('Error sending to subscription:', error);
                    if (error.statusCode === 410) {
                        // Remove invalid subscription
                        subscriptions = subscriptions.filter(sub => sub !== subscription);
                    }
                    return null;
                })
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
const BIRTHDAY_DATE = new Date('2025-05-30T00:00:00');

function checkAndSendNotifications() {
    const now = new Date();
    const timeUntilBirthday = BIRTHDAY_DATE - now;
    
    console.log('Checking time until birthday:', timeUntilBirthday);
    
    // If it's birthday time (within 1 minute of the target time)
    if (timeUntilBirthday > 0 && timeUntilBirthday <= 60000) {
        console.log('Sending birthday notifications!');
        const payload = JSON.stringify({
            title: '🎉 Happy Birthday Jenny!',
            body: 'I made you something special!',
            icon: '/images/gift.png'
        });

        // Send to all subscriptions
        subscriptions.forEach(subscription => {
            webpush.sendNotification(subscription, payload)
                .then(() => {
                    console.log('Notification sent successfully to:', subscription.endpoint);
                })
                .catch(error => {
                    console.error('Error sending notification:', error);
                    // Remove invalid subscriptions
                    if (error.statusCode === 410) {
                        subscriptions = subscriptions.filter(sub => sub !== subscription);
                        console.log('Removed invalid subscription');
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
    console.log('Birthday date set to:', BIRTHDAY_DATE);
}); 