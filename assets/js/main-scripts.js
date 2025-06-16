/*
  Phantom City Studios - Main Scripts
  Version: 2.0
  Author: Gemini AI
*/

document.addEventListener('DOMContentLoaded', () => {

    // --- Mobile Hamburger Menu Logic ---
    const hamburger = document.querySelector('.hamburger-menu');
    const mobileNav = document.querySelector('.mobile-nav');
    if (hamburger && mobileNav) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('is-active');
            mobileNav.classList.toggle('is-active');
        });
    }

    // --- Dynamic Image Slideshow for index.html ---
    const imageBox = document.querySelector('.image-box');
    if (imageBox) {
        const images = imageBox.querySelectorAll('img');
        if (images.length > 0) {
            let currentIndex = 0;
            images[0].classList.add('active'); 

            setInterval(() => {
                images[currentIndex].classList.remove('active');
                currentIndex = (currentIndex + 1) % images.length;
                images[currentIndex].classList.add('active');
            }, 3000);
        }
    }

    // --- Scroll Fade-In Effect for all pages ---
    const faders = document.querySelectorAll('.scroll-fade');
    if (faders.length > 0) {
        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15 });

        faders.forEach(fader => observer.observe(fader));
    }


    // --- 3D Tilt Effect for Image Box ---
    if (imageBox) {
        const handleTilt = (e) => {
            const box = imageBox.getBoundingClientRect();
            const x = (e.clientX || (e.touches && e.touches[0].clientX)) - box.left;
            const y = (e.clientY || (e.touches && e.touches[0].clientY)) - box.top;
            const centerX = box.width / 2;
            const centerY = box.height / 2;
            const rotateX = ((y - centerY) / centerY) * 8; // Reduced intensity
            const rotateY = ((x - centerX) / centerX) * -8; // Reduced intensity
            imageBox.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        }

        const resetTilt = () => {
            imageBox.style.transform = 'rotateX(0deg) rotateY(0deg)';
        }

        imageBox.addEventListener('mousemove', handleTilt);
        imageBox.addEventListener('mouseleave', resetTilt);
        imageBox.addEventListener('touchmove', handleTilt, { passive: true });
        imageBox.addEventListener('touchend', resetTilt);
    }
});

/* --- YouTube IFrame API Player Logic for Portfolio --- */
/*
  This script finds all elements with the class '.yt-player' on the page,
  reads the 'data-video-id' attribute, and creates a unique YouTube player
  for each one. This makes adding new videos to the portfolio as simple
  as adding a new HTML block.
*/

// Global object to hold all player instances
const players = {}; 

function onYouTubeIframeAPIReady() {
    const playerDivs = document.querySelectorAll('.yt-player');
    playerDivs.forEach((div, index) => {
        const videoId = div.dataset.videoId;
        const playerId = `player-${index}`;
        div.id = playerId; // Assign a unique ID for the API to target
        players[playerId] = createPlayer(playerId, videoId);
    });
}

function createPlayer(elementId, videoId) {
    return new YT.Player(elementId, {
        height: '100%',
        width: '100%',
        videoId: videoId,
        playerVars: {
            'autoplay': 0,        // Don't autoplay on load
            'controls': 0,        // Hide default controls
            'loop': 1,            // Enable looping
            'playlist': videoId,  // Required for looping a single video
            'showinfo': 0,
            'modestbranding': 1,
            'rel': 0,
            'disablekb': 1,
            'mute': 1             // Start muted
        },
        events: {
            'onReady': onPlayerReady
        }
    });
}

function onPlayerReady(event) {
    const playerElement = event.target.getIframe();
    // Get the main project card container
    const container = playerElement.closest('.project-card');
    
    if (container) {
        container.addEventListener('mouseenter', () => {
            event.target.playVideo();
        });
        container.addEventListener('mouseleave', () => {
            event.target.pauseVideo();
        });
    }
}

document.querySelectorAll('.sound-toggle').forEach(button => {
    button.addEventListener('click', (e) => {
        // Find the player within the same project card
        const card = e.currentTarget.closest('.project-card');
        const playerDiv = card.querySelector('.yt-player');
        const playerId = playerDiv.id;
        const player = players[playerId];
        const icon = button.querySelector('i');

        if (player && typeof player.isMuted === 'function') {
            if (player.isMuted()) {
                player.unMute();
                icon.classList.remove('fa-volume-mute');
                icon.classList.add('fa-volume-up');
            } else {
                player.mute();
                icon.classList.remove('fa-volume-up');
                icon.classList.add('fa-volume-mute');
            }
        }
    });
});
