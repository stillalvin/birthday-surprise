// Constants
const BIRTHDAY_DATE = new Date('2025-05-31T23:05:00');
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
    initializeForm();
    initializeCandle();
    checkDate();
    initializeNotifications();
    initializeAudioMessage();
    initializeFloatingHearts();
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
    showInstallPrompt();
    // Ensure floating hearts continue
    if (!window.floatingHeartsInterval) {
        initializeFloatingHearts();
    }
}

function showExpiredMessage() {
    countdownSection.classList.add('hidden');
    mainContent.classList.add('hidden');
    expiredSection.classList.remove('hidden');
    expiredSection.classList.add('active', 'fade-in');
}

// Updated Candle and Form Handling
function initializeCandle() {
    const blowCandleBtn = document.getElementById('blow-candle-btn');
    const flame = document.querySelector('.flame');
    const wishesForm = document.getElementById('wishes-form');
    const wishForSelf = document.getElementById('wish-for-self');
    const wishForFriendship = document.getElementById('wish-for-friendship');

    blowCandleBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        
        // Check if form is filled
        if (!wishForSelf.value.trim() || !wishForFriendship.value.trim()) {
            // Show gentle reminder to fill the form
            const reminderMessage = document.createElement('div');
            reminderMessage.className = 'form-reminder';
            reminderMessage.innerHTML = `
                <i class="fas fa-heart"></i>
                <p>GIRL! write your wishes before blowing the candle!</p>
            `;
            
            // Remove any existing reminder
            const existingReminder = document.querySelector('.form-reminder');
            if (existingReminder) {
                existingReminder.remove();
            }
            
            // Add the new reminder
            wishesForm.insertBefore(reminderMessage, blowCandleBtn);
            
            // Highlight empty fields
            if (!wishForSelf.value.trim()) {
                wishForSelf.classList.add('highlight');
                wishForSelf.focus();
            }
            if (!wishForFriendship.value.trim()) {
                wishForFriendship.classList.add('highlight');
                if (wishForSelf.value.trim()) {
                    wishForFriendship.focus();
                }
            }
            
            // Remove highlight after user starts typing
            const removeHighlight = (e) => {
                e.target.classList.remove('highlight');
                e.target.removeEventListener('input', removeHighlight);
            };
            wishForSelf.addEventListener('input', removeHighlight);
            wishForFriendship.addEventListener('input', removeHighlight);
            
            return;
        }
        
        // If form is filled, proceed with submission
        blowCandleBtn.disabled = true;
        
        // Submit the form
        const formData = new FormData(wishesForm);
        try {
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
                    <h3>Your wish has been released into the stars! ✨</h3>
                `;
                wishesForm.innerHTML = '';
                wishesForm.appendChild(successMessage);
                
                // Wait for success message to be visible
                await new Promise(resolve => setTimeout(resolve, 2000));
                
                // Fade out success message
                successMessage.classList.add('fade-out');
                
                // Wait for fade out animation
                await new Promise(resolve => setTimeout(resolve, 500));
                
                // Remove success message
                successMessage.remove();
                
                // Blow out the candle
                flame.classList.add('blown');
                
                // Wait for candle animation
                await new Promise(resolve => setTimeout(resolve, 500));
                
                // Show birthday message
                const birthdayMessage = document.createElement('div');
                birthdayMessage.className = 'birthday-message';
                birthdayMessage.innerHTML = `
                    <h2>HAPPY BIRTHDAY!</h2>
                    <p>May all your wishes come true! 🎂✨</p>
                `;
                wishesForm.appendChild(birthdayMessage);
                
                // Trigger confetti
                triggerConfetti();
            } else {
                throw new Error('Wishes submission failed');
            }
        } catch (error) {
            console.error('Error:', error);
            blowCandleBtn.innerHTML = '<i class="fas fa-exclamation-circle"></i> Error! Try Again';
            blowCandleBtn.disabled = false;
        }
    });
}

// Confetti Effect
function triggerConfetti() {
    confetti({
        particleCount: 50,
        spread: 50,
        origin: { y: 0.6 },
        disableForReducedMotion: true,
        ticks: 200
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

// Audio Message Player
function initializeAudioMessage() {
    const audioPlayer = document.getElementById('special-message');
    const playButton = document.getElementById('play-audio');
    const equalizer = document.querySelector('.equalizer');
    const bars = equalizer.querySelectorAll('.bar');
    let isPlaying = false;
    let audioContext;
    let analyser;
    let dataArray;
    let source;
    let animationFrame;

    // Initialize audio context and analyzer
    function initAudioContext() {
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            analyser = audioContext.createAnalyser();
            analyser.fftSize = 32;
            const bufferLength = analyser.frequencyBinCount;
            dataArray = new Uint8Array(bufferLength);
            
            source = audioContext.createMediaElementSource(audioPlayer);
            source.connect(analyser);
            analyser.connect(audioContext.destination);
        }
    }

    // Update equalizer bars based on audio frequencies
    function updateEqualizer() {
        if (!isPlaying) return;
        
        analyser.getByteFrequencyData(dataArray);
        
        // Map frequency data to bars
        const barCount = bars.length;
        const frequencyStep = Math.floor(dataArray.length / barCount);
        
        for (let i = 0; i < barCount; i++) {
            const frequencyIndex = i * frequencyStep;
            const value = dataArray[frequencyIndex];
            const height = (value / 255) * 100; // Convert to percentage
            bars[i].style.transform = `scaleY(${Math.max(0.2, height / 100)})`;
        }
        
        animationFrame = requestAnimationFrame(updateEqualizer);
    }

    playButton.addEventListener('click', () => {
        if (isPlaying) {
            audioPlayer.pause();
            playButton.classList.remove('playing');
            playButton.innerHTML = '<i class="fas fa-play"></i>';
            equalizer.classList.remove('active');
            cancelAnimationFrame(animationFrame);
        } else {
            initAudioContext();
            audioPlayer.play();
            playButton.classList.add('playing');
            playButton.innerHTML = '<i class="fas fa-pause"></i>';
            equalizer.classList.add('active');
            updateEqualizer();
        }
        isPlaying = !isPlaying;
    });

    audioPlayer.addEventListener('ended', () => {
        playButton.classList.remove('playing');
        playButton.innerHTML = '<i class="fas fa-play"></i>';
        equalizer.classList.remove('active');
        cancelAnimationFrame(animationFrame);
        isPlaying = false;
    });
}

// Form Handling
function initializeForm() {
    const submitButton = wishesForm.querySelector('.submit-button');
    
    // Check if form was already submitted
    if (localStorage.getItem('wishesSubmitted') === 'true') {
        // Show success message if already submitted
        const successMessage = document.createElement('div');
        successMessage.className = 'form-success active';
        successMessage.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <h3>Your wish has been released into the stars! ✨</h3>
        `;
        wishesForm.innerHTML = '';
        wishesForm.appendChild(successMessage);
        return;
    }

    wishesForm.addEventListener('submit', async (e) => {
        e.preventDefault();
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
                // Store submission state
                localStorage.setItem('wishesSubmitted', 'true');
                
                // Show success message
                const successMessage = document.createElement('div');
                successMessage.className = 'form-success active';
                successMessage.innerHTML = `
                    <i class="fas fa-check-circle"></i>
                    <h3>Your wish has been released into the stars! ✨</h3>
                `;
                wishesForm.innerHTML = '';
                wishesForm.appendChild(successMessage);
                
                // Wait for success message to be visible
                await new Promise(resolve => setTimeout(resolve, 1500));
                
                // Fade out success message
                successMessage.classList.add('fade-out');
                
                // Wait for fade out animation
                await new Promise(resolve => setTimeout(resolve, 300));
                
                // Remove success message
                successMessage.remove();
                
                // Blow out the candle
                const flame = document.querySelector('.flame');
                flame.classList.add('blown');
                
                // Wait for candle animation
                await new Promise(resolve => setTimeout(resolve, 300));
                
                // Show birthday message
                const birthdayMessage = document.createElement('div');
                birthdayMessage.className = 'birthday-message';
                birthdayMessage.innerHTML = `
                    <h2>HAPPY BIRTHDAY!</h2>
                    <p>May all your wishes come true! 🎂✨</p>
                `;
                wishesForm.appendChild(birthdayMessage);
                
                // Trigger confetti with a slight delay
                setTimeout(() => {
                    triggerConfetti();
                }, 100);
            } else {
                throw new Error('Wishes submission failed');
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
    function showInstallPrompt() {
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
    }

    // Hide prompt if app is already installed
    window.addEventListener('appinstalled', () => {
        installPrompt.classList.remove('active');
        installPrompt.classList.add('hidden');
        deferredPrompt = null;
    });
}

// Notifications
function initializeNotifications() {
    if ('Notification' in window) {
        // Check if app is installed
        const isStandalone = () => {
            return window.navigator.standalone || window.matchMedia('(display-mode: standalone)').matches;
        };

        // Only show notification prompt if app is not installed
        if (!isStandalone() && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
            // Show a custom prompt first
            const notificationPrompt = document.createElement('div');
            notificationPrompt.className = 'notification-prompt';
            notificationPrompt.innerHTML = `
                <div class="notification-prompt-content">
                    <h3><i class="fas fa-bell"></i> Enable Notifications</h3>
                    <p>Would you like to receive a special birthday surprise when the timer ends?</p>
                    <div class="notification-buttons">
                        <button id="enable-notifications" class="enable-button">
                            <i class="fas fa-check"></i> Yes, Enable
                        </button>
                        <button id="skip-notifications" class="skip-button">
                            <i class="fas fa-times"></i> No, Skip
                        </button>
                    </div>
                </div>
            `;
            document.body.appendChild(notificationPrompt);

            // Handle enable button click
            document.getElementById('enable-notifications').addEventListener('click', async () => {
                try {
                    const permission = await Notification.requestPermission();
                    if (permission === 'granted') {
                        // Register service worker for push notifications
                        if ('serviceWorker' in navigator) {
                            const registration = await navigator.serviceWorker.register('/birthday-surprise/sw.js');
                            console.log('Service Worker registered:', registration);
                            
                            // Store the permission in localStorage
                            localStorage.setItem('notificationsEnabled', 'true');
                        }
                    }
                } catch (error) {
                    console.error('Error enabling notifications:', error);
                }
                notificationPrompt.remove();
            });

            // Handle skip button click
            document.getElementById('skip-notifications').addEventListener('click', () => {
                notificationPrompt.remove();
            });
        }
    }
}

function showNotification() {
    if ('Notification' in window && Notification.permission === 'granted') {
        // Check if we're on a mobile device
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        
        if (isMobile && 'serviceWorker' in navigator) {
            // For mobile devices, use service worker to show notification
            navigator.serviceWorker.ready.then(registration => {
                registration.showNotification('🎉 Happy Birthday Jenny!', {
                    body: 'I made you something special!',
                    icon: '/birthday-surprise/images/gift.png',
                    badge: '/birthday-surprise/images/gift.png',
                    vibrate: [200, 100, 200],
                    requireInteraction: true,
                    tag: 'birthday-notification',
                    actions: [
                        {
                            action: 'open',
                            title: 'Open Gift'
                        }
                    ]
                });
            });
        } else {
            // For desktop devices
            const notification = new Notification('🎉 Happy Birthday Jenny!', {
                body: 'I made you something special!',
                icon: '/birthday-surprise/images/gift.png',
                badge: '/birthday-surprise/images/gift.png',
                vibrate: [200, 100, 200],
                requireInteraction: true,
                tag: 'birthday-notification'
            });

            // Handle notification click
            notification.onclick = function() {
                window.focus();
                this.close();
            };
        }
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
        showNotification(); // Show notification when birthday arrives
    }
}

// Floating Hearts Animation
function initializeFloatingHearts() {
    const container = document.getElementById('floating-hearts');
    const heartEmojis = ['❤️', '💖', '💝', '💕', '💗', '💓'];
    
    function createHeart() {
        const heart = document.createElement('div');
        heart.className = 'floating-heart';
        heart.textContent = heartEmojis[Math.floor(Math.random() * heartEmojis.length)];
        
        // Random starting position
        heart.style.left = `${Math.random() * 100}%`;
        
        // Random size
        const size = 1 + Math.random() * 1.5;
        heart.style.fontSize = `${size}rem`;
        
        // Random animation duration
        const duration = 4 + Math.random() * 4;
        heart.style.animationDuration = `${duration}s`;
        
        // Random delay
        heart.style.animationDelay = `${Math.random() * 2}s`;
        
        container.appendChild(heart);
        
        // Remove heart after animation
        heart.addEventListener('animationend', () => {
            heart.remove();
        });
    }
    
    // Create hearts periodically
    window.floatingHeartsInterval = setInterval(createHeart, 1000);
    
    // Create initial batch of hearts
    for (let i = 0; i < 5; i++) {
        createHeart();
    }
} 