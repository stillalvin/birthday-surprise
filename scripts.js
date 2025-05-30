// Constants
const BIRTHDAY_DATE = new Date('2025-05-30T22:55:00');

// DOM Elements
const countdownSection = document.getElementById('countdown-section');
const mainContent = document.getElementById('main-content');
const expiredSection = document.getElementById('expired-section');
const daysElement = document.getElementById('days');
const hoursElement = document.getElementById('hours');
const minutesElement = document.getElementById('minutes');
const secondsElement = document.getElementById('seconds');
const audioMessage = document.getElementById('audio-message');
const playAudioButton = document.getElementById('play-audio');
const waveBars = document.querySelectorAll('.wave-bar');
const blowCandleButton = document.getElementById('blow-candle');
const candleAnimation = document.querySelector('.candle-animation');
const wishesForm = document.getElementById('wishes-form');
const installPrompt = document.getElementById('install-prompt');
const installButton = document.getElementById('install-button');
const closeInstallPrompt = document.getElementById('close-install-prompt');

// Initialize floating hearts
function initializeFloatingHearts() {
    const heartsContainer = document.querySelector('.floating-hearts');
    const sizes = ['small', '', 'large'];
    const colors = [
        'var(--primary-color)',
        'var(--secondary-color)',
        'var(--accent-color)'
    ];

    const createHeart = () => {
        const heart = document.createElement('div');
        heart.className = `heart ${sizes[Math.floor(Math.random() * sizes.length)]}`;
        heart.style.left = Math.random() * 100 + '%';
        heart.style.background = colors[Math.floor(Math.random() * colors.length)];
        heart.style.filter = `blur(${Math.random() * 1}px)`;
        heartsContainer.appendChild(heart);
        
        anime({
            targets: heart,
            translateY: -window.innerHeight - 100,
            opacity: [0, 0.6, 0],
            scale: [0.8, 1, 0.8],
            easing: 'easeOutExpo',
            duration: Math.random() * 3000 + 3000,
            complete: () => heart.remove()
        });
    };

    // Create hearts more frequently but with random delays
    const createHeartWithDelay = () => {
        createHeart();
        setTimeout(createHeartWithDelay, Math.random() * 500 + 200);
    };

    // Start creating hearts
    createHeartWithDelay();
}

// Initialize audio player
function initializeAudio() {
    let isPlaying = false;
    let animationFrame;

    const animateWave = () => {
        waveBars.forEach(bar => {
            const height = Math.random() * 30 + 10;
            bar.style.height = `${height}px`;
        });
        animationFrame = requestAnimationFrame(animateWave);
    };

    playAudioButton.addEventListener('click', () => {
        if (isPlaying) {
            audioMessage.pause();
            cancelAnimationFrame(animationFrame);
            waveBars.forEach(bar => bar.style.height = '20px');
            playAudioButton.innerHTML = '<i class="fas fa-play"></i>';
        } else {
            audioMessage.play();
            animateWave();
            playAudioButton.innerHTML = '<i class="fas fa-pause"></i>';
        }
        isPlaying = !isPlaying;
    });

    audioMessage.addEventListener('ended', () => {
        isPlaying = false;
        cancelAnimationFrame(animationFrame);
        waveBars.forEach(bar => bar.style.height = '20px');
        playAudioButton.innerHTML = '<i class="fas fa-play"></i>';
    });
}

// Initialize countdown timer
function initializeCountdown() {
    function updateCountdown() {
        const now = new Date();
        const timeLeft = BIRTHDAY_DATE - now;
        const oneDayAfter = new Date(BIRTHDAY_DATE);
        oneDayAfter.setDate(oneDayAfter.getDate() + 1);

        if (now > oneDayAfter) {
            showExpiredMessage();
            return;
        } else if (timeLeft <= 0) {
            showMainContent();
            return;
        }

        const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

        daysElement.textContent = days.toString().padStart(2, '0');
        hoursElement.textContent = hours.toString().padStart(2, '0');
        minutesElement.textContent = minutes.toString().padStart(2, '0');
        secondsElement.textContent = seconds.toString().padStart(2, '0');
    }

    updateCountdown();
    setInterval(updateCountdown, 1000);
}

// Show main content with animation
function showMainContent() {
    countdownSection.classList.remove('active');
    countdownSection.classList.add('hidden');
    
    setTimeout(() => {
        mainContent.classList.remove('hidden');
        mainContent.classList.add('active');
        initializeFloatingHearts();
    }, 500);
}

// Show expired message with animation
function showExpiredMessage() {
    countdownSection.classList.remove('active');
    countdownSection.classList.add('hidden');
    mainContent.classList.remove('active');
    mainContent.classList.add('hidden');
    
    setTimeout(() => {
        expiredSection.classList.remove('hidden');
        expiredSection.classList.add('active');
    }, 500);
}

// Initialize candle animation
function initializeCandle() {
    blowCandleButton.addEventListener('click', () => {
        candleAnimation.classList.add('blown');
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
        });
        
        setTimeout(() => {
            candleAnimation.classList.remove('blown');
        }, 2000);
    });
}

// Initialize scratch card
function initializeScratchCard() {
    const scratchCard = new ScratchCard('#scratch-card', {
        scratchType: 'brush',
        containerWidth: document.querySelector('#scratch-card').offsetWidth,
        containerHeight: 300,
        imageForwardSrc: 'images/surprise.jpg', // Replace with your surprise image
        imageBackgroundSrc: 'images/scratch-bg.jpg', // Replace with your scratch background
        htmlBackground: '<div style="background: #f0f0f0; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;"><h3>Scratch to reveal your surprise! 🎁</h3></div>',
        clearZoneRadius: 60,
        nPoints: 30,
        pointSize: 4,
        percentToFinish: 50,
        callback: function() {
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            });
        }
    });

    // Wait for the DOM to be fully loaded
    setTimeout(() => {
        scratchCard.init();
    }, 1000);
}

// Initialize form submission with candle
function initializeForm() {
    const flame = document.querySelector('.flame');
    
    wishesForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Blow out the candle
        flame.classList.add('blown');
        
        // Trigger confetti
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
        });
        
        // Submit the form
        const formData = new FormData(wishesForm);
        
        fetch(wishesForm.action, {
            method: 'POST',
            body: formData,
            headers: {
                'Accept': 'application/json'
            }
        })
        .then(response => {
            if (response.ok) {
                alert('Thank you for your wishes! ❤️');
                wishesForm.reset();
                // Relight the candle after 2 seconds
                setTimeout(() => {
                    flame.classList.remove('blown');
                }, 2000);
            } else {
                throw new Error('Network response was not ok');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Oops! Something went wrong. Please try again.');
            // Relight the candle if there's an error
            flame.classList.remove('blown');
        });
    });
}

// PWA Installation
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    installPrompt.classList.remove('hidden');
});

installButton.addEventListener('click', async () => {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            console.log('User accepted the install prompt');
        }
        deferredPrompt = null;
        installPrompt.classList.add('hidden');
    }
});

closeInstallPrompt.addEventListener('click', () => {
    installPrompt.classList.add('hidden');
});

// Register Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/birthday-surprise/sw.js')
            .then(registration => {
                console.log('ServiceWorker registration successful');
            })
            .catch(err => {
                console.log('ServiceWorker registration failed: ', err);
            });
    });
}

// Initialize everything when the page loads
document.addEventListener('DOMContentLoaded', () => {
    initializeCountdown();
    initializeAudio();
    initializeForm();
    initializeScratchCard();
    initializeFloatingHearts();
}); 
