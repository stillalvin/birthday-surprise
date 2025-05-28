// Constants
const BIRTHDAY_DATE = new Date('2025-05-29T00:00:00');
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
const installPrompt = document.getElementById('install-prompt');
const installButton = document.getElementById('install-button');
const closeInstallPrompt = document.getElementById('close-install-prompt');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initializeCountdown();
    initializePWA();
    initializeAudio();
    initializeForm();
    initializeCandle();
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

// Form Handling
function initializeForm() {
    wishesForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitButton = wishesForm.querySelector('.submit-button');
        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';

        try {
            const formData = new FormData(wishesForm);
            const response = await fetch(wishesForm.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                // Show success message
                const successMessage = document.createElement('div');
                successMessage.className = 'form-success active';
                successMessage.innerHTML = `
                    <i class="fas fa-check-circle"></i>
                    <h3>Thank you for your wishes!</h3>
                    <p>Your wishes have been sent successfully.</p>
                `;
                wishesForm.innerHTML = '';
                wishesForm.appendChild(successMessage);
            } else {
                throw new Error('Form submission failed');
            }
        } catch (error) {
            console.error('Error:', error);
            submitButton.innerHTML = '<i class="fas fa-exclamation-circle"></i> Error! Try Again';
            submitButton.disabled = false;
        }
    });
}

// PWA Features
function initializePWA() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/birthday-surprise/sw.js')
            .then(registration => {
                console.log('ServiceWorker registration successful');
            })
            .catch(err => {
                console.log('ServiceWorker registration failed: ', err);
            });
    }

    // Improved Safari detection
    const isSafari = () => {
        const ua = navigator.userAgent.toLowerCase();
        return ua.includes('safari') && !ua.includes('chrome');
    };

    const isIOS = () => {
        return [
            'iPad Simulator',
            'iPhone Simulator',
            'iPod Simulator',
            'iPad',
            'iPhone',
            'iPod'
        ].includes(navigator.platform)
        || (navigator.userAgent.includes("Mac") && "ontouchend" in document);
    };

    // Check if app is already installed
    const isStandalone = () => {
        return window.navigator.standalone || window.matchMedia('(display-mode: standalone)').matches;
    };

    // Show appropriate prompt based on browser
    if (isSafari() && isIOS() && !isStandalone()) {
        console.log('Safari on iOS detected and not installed');
        const safariPrompt = document.getElementById('safari-install-prompt');
        const closeSafariPrompt = document.getElementById('close-safari-prompt');
        
        // Show prompt after a short delay to ensure the page is loaded
        setTimeout(() => {
            safariPrompt.classList.remove('hidden');
        }, 2000);
        
        closeSafariPrompt.addEventListener('click', () => {
            safariPrompt.classList.add('hidden');
        });
    } else {
        // Handle regular PWA install prompt
        let deferredPrompt;
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            
            // Show our custom install prompt
            installPrompt.classList.remove('hidden');
            installPrompt.classList.add('active');
        });

        // Handle install button click
        installButton.addEventListener('click', async () => {
            if (deferredPrompt) {
                deferredPrompt.prompt();
                const { outcome } = await deferredPrompt.userChoice;
                console.log(`User response to the install prompt: ${outcome}`);
                deferredPrompt = null;
                installPrompt.classList.remove('active');
                installPrompt.classList.add('hidden');
            }
        });

        // Handle close button click
        closeInstallPrompt.addEventListener('click', () => {
            installPrompt.classList.remove('active');
            installPrompt.classList.add('hidden');
        });
    }

    // Hide prompt if app is already installed
    window.addEventListener('appinstalled', () => {
        installPrompt.classList.remove('active');
        installPrompt.classList.add('hidden');
        deferredPrompt = null;
    });
}

// Notifications
function showNotification() {
    if ('Notification' in window) {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                new Notification('🎉 Happy Birthday!', {
                    body: 'Alvin made you something special!',
                    icon: '/birthday-surprise/images/gift.png'
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