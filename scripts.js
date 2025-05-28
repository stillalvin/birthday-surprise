// Constants
const BIRTHDAY_DATE = new Date('2024-05-29T00:00:00');
const GOOGLE_FORM_URL = ''; // Add your Google Form URL here
const BIRTHDAY_SONG_URL = ''; // Add your birthday song URL here

// DOM Elements
const countdownSection = document.getElementById('countdown-section');
const mainContent = document.getElementById('main-content');
const expiredSection = document.getElementById('expired-section');
const daysElement = document.getElementById('days');
const hoursElement = document.getElementById('hours');
const minutesElement = document.getElementById('minutes');
const secondsElement = document.getElementById('seconds');
const blowCandleButton = document.getElementById('blow-candle');
const flame = document.querySelector('.flame');
const audioPlayer = document.getElementById('audio-player');
const birthdaySong = document.getElementById('birthday-song');
const toggleMusicButton = document.getElementById('toggle-music');
const wishesForm = document.getElementById('wishes-form');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initializeCountdown();
    initializePWA();
    initializeAudio();
    initializeForm();
    checkDate();
});

// Countdown Timer
function initializeCountdown() {
    function updateCountdown() {
        const now = new Date();
        const difference = BIRTHDAY_DATE - now;

        if (difference <= 0) {
            clearInterval(countdownInterval);
            showMainContent();
            return;
        }

        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        daysElement.textContent = String(days).padStart(2, '0');
        hoursElement.textContent = String(hours).padStart(2, '0');
        minutesElement.textContent = String(minutes).padStart(2, '0');
        secondsElement.textContent = String(seconds).padStart(2, '0');
    }

    const countdownInterval = setInterval(updateCountdown, 1000);
    updateCountdown();
}

// Content Management
function showMainContent() {
    countdownSection.classList.remove('active');
    countdownSection.classList.add('hidden');
    mainContent.classList.remove('hidden');
    mainContent.classList.add('active', 'fade-in');
    audioPlayer.classList.remove('hidden');
    showNotification();
}

function showExpiredMessage() {
    countdownSection.classList.add('hidden');
    mainContent.classList.add('hidden');
    expiredSection.classList.remove('hidden');
    expiredSection.classList.add('active', 'fade-in');
}

// Candle Animation
function initializeCandle() {
    blowCandleButton.addEventListener('click', () => {
        flame.classList.add('active');
        setTimeout(() => {
            flame.classList.remove('active');
            triggerConfetti();
        }, 1000);
    });
}

// Confetti Effect
function triggerConfetti() {
    confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
    });
}

// Audio Player
function initializeAudio() {
    if (BIRTHDAY_SONG_URL) {
        birthdaySong.src = BIRTHDAY_SONG_URL;
        toggleMusicButton.addEventListener('click', () => {
            if (birthdaySong.paused) {
                birthdaySong.play();
                toggleMusicButton.innerHTML = '<i class="fas fa-volume-up"></i>';
            } else {
                birthdaySong.pause();
                toggleMusicButton.innerHTML = '<i class="fas fa-volume-mute"></i>';
            }
        });
    }
}

// Google Form
function initializeForm() {
    if (GOOGLE_FORM_URL) {
        wishesForm.src = GOOGLE_FORM_URL;
    }
}

// PWA Features
function initializePWA() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('ServiceWorker registration successful');
            })
            .catch(err => {
                console.log('ServiceWorker registration failed: ', err);
            });
    }

    // Add to Home Screen Prompt
    let deferredPrompt;
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        // You can show a custom install button here if desired
    });
}

// Notifications
function showNotification() {
    if ('Notification' in window) {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                new Notification('🎉 Happy Birthday!', {
                    body: 'Alvin made you something special!',
                    icon: '/images/icon-192x192.png'
                });
            }
        });
    }
}

// Date Check
function checkDate() {
    const now = new Date();
    const afterBirthday = now > BIRTHDAY_DATE;
    const oneDayAfter = new Date(BIRTHDAY_DATE);
    oneDayAfter.setDate(oneDayAfter.getDate() + 1);

    if (now > oneDayAfter) {
        showExpiredMessage();
    } else if (afterBirthday) {
        showMainContent();
    }
} 