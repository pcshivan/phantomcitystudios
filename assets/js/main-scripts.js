document.addEventListener("DOMContentLoaded", () => {
  setupHeaderState();
  setupNavigation();
  setupRevealAnimations();
  setupAmbientPointer();
  setupImageShowcase();
  setupTiltCard();
  setupFaqAccordion();
  setupContactPackagePrefill();
  setupSoundToggleLabels();
  setCurrentYear();
});

function setupNavigation() {
  const hamburger = document.querySelector(".hamburger-menu");
  const mobileNav = document.querySelector(".mobile-nav");

  if (!hamburger || !mobileNav) {
    return;
  }

  const setOpenState = (isOpen) => {
    hamburger.classList.toggle("is-active", isOpen);
    mobileNav.classList.toggle("is-active", isOpen);
    hamburger.setAttribute("aria-expanded", String(isOpen));
    document.body.classList.toggle("nav-open", isOpen);
  };

  setOpenState(false);

  hamburger.addEventListener("click", () => {
    setOpenState(!mobileNav.classList.contains("is-active"));
  });

  mobileNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setOpenState(false));
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      setOpenState(false);
    }
  });
}

function setupHeaderState() {
  const header = document.querySelector(".main-header");

  if (!header) {
    return;
  }

  const syncHeader = () => {
    header.classList.toggle("is-scrolled", window.scrollY > 18);
  };

  syncHeader();
  window.addEventListener("scroll", syncHeader, { passive: true });
}

function setupRevealAnimations() {
  const revealItems = Array.from(document.querySelectorAll(".scroll-fade, [data-reveal]"));

  if (!revealItems.length) {
    return;
  }

  const showItem = (item) => {
    item.classList.add("visible");
    item.classList.add("is-visible");
  };

  const prefersReducedMotion =
    typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    revealItems.forEach(showItem);
    return;
  }

  document.body.classList.add("has-scroll-reveal");

  revealItems.forEach((item) => {
    const rect = item.getBoundingClientRect();

    if (rect.top <= window.innerHeight * 0.92) {
      showItem(item);
    }
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        showItem(entry.target);
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.18,
      rootMargin: "0px 0px -42px 0px"
    }
  );

  revealItems.forEach((item) => {
    if (item.classList.contains("visible") || item.classList.contains("is-visible")) {
      return;
    }

    observer.observe(item);
  });
}

function setupAmbientPointer() {
  const root = document.documentElement;

  const syncPointer = (clientX, clientY) => {
    const x = `${(clientX / window.innerWidth) * 100}%`;
    const y = `${(clientY / window.innerHeight) * 100}%`;
    root.style.setProperty("--pointer-x", x);
    root.style.setProperty("--pointer-y", y);
  };

  window.addEventListener(
    "pointermove",
    (event) => {
      syncPointer(event.clientX, event.clientY);
    },
    { passive: true }
  );
}

function setupImageShowcase() {
  const imageBox = document.querySelector(".image-box");

  if (!imageBox) {
    return;
  }

  const images = imageBox.querySelectorAll("img");

  if (images.length < 2) {
    return;
  }

  let currentIndex = 0;
  images[0].classList.add("active");

  window.setInterval(() => {
    images[currentIndex].classList.remove("active");
    currentIndex = (currentIndex + 1) % images.length;
    images[currentIndex].classList.add("active");
  }, 3200);
}

function setupTiltCard() {
  const tiltCard = document.querySelector(".image-box");

  if (!tiltCard) {
    return;
  }

  const handleTilt = (event) => {
    const rect = tiltCard.getBoundingClientRect();
    const touchPoint = event.touches && event.touches[0] ? event.touches[0] : null;
    const pointX = typeof event.clientX === "number" ? event.clientX : touchPoint ? touchPoint.clientX : rect.left + rect.width / 2;
    const pointY = typeof event.clientY === "number" ? event.clientY : touchPoint ? touchPoint.clientY : rect.top + rect.height / 2;
    const localX = pointX - rect.left;
    const localY = pointY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((localY - centerY) / centerY) * 6;
    const rotateY = ((localX - centerX) / centerX) * -6;
    tiltCard.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  };

  const resetTilt = () => {
    tiltCard.style.transform = "rotateX(0deg) rotateY(0deg)";
  };

  tiltCard.addEventListener("mousemove", handleTilt);
  tiltCard.addEventListener("mouseleave", resetTilt);
  tiltCard.addEventListener("touchmove", handleTilt, { passive: true });
  tiltCard.addEventListener("touchend", resetTilt);
}

function setupFaqAccordion() {
  const faqItems = document.querySelectorAll(".faq-item");

  if (!faqItems.length) {
    return;
  }

  faqItems.forEach((item) => {
    const question = item.querySelector(".faq-question");
    const answer = item.querySelector(".faq-answer");

    if (!question || !answer) {
      return;
    }

    question.setAttribute("role", "button");
    question.setAttribute("tabindex", "0");
    question.setAttribute("aria-expanded", "false");

    const toggleItem = () => {
      const isOpen = item.classList.contains("active");

      faqItems.forEach((otherItem) => {
        const otherQuestion = otherItem.querySelector(".faq-question");
        const otherAnswer = otherItem.querySelector(".faq-answer");

        otherItem.classList.remove("active");

        if (otherQuestion) {
          otherQuestion.setAttribute("aria-expanded", "false");
        }

        if (otherAnswer) {
          otherAnswer.style.maxHeight = "0px";
          otherAnswer.style.paddingTop = "0";
          otherAnswer.style.paddingBottom = "0";
        }
      });

      if (!isOpen) {
        item.classList.add("active");
        question.setAttribute("aria-expanded", "true");
        answer.style.maxHeight = `${answer.scrollHeight + 16}px`;
        answer.style.paddingTop = "0";
        answer.style.paddingBottom = "1.2rem";
      }
    };

    question.addEventListener("click", toggleItem);
    question.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        toggleItem();
      }
    });
  });
}

function setupContactPackagePrefill() {
  const contactForm = document.getElementById("contact-form");

  if (!contactForm) {
    return;
  }

  contactForm.setAttribute("action", "https://formspree.io/f/xldnnovk");

  try {
    const urlParams = new URLSearchParams(window.location.search);
    const selectedPackage = urlParams.get("package");
    const serviceSelect = document.getElementById("service-selection");

    if (selectedPackage && serviceSelect && serviceSelect.querySelector(`[value="${selectedPackage}"]`)) {
      serviceSelect.value = selectedPackage;
    }
  } catch (error) {
    console.error("Unable to sync selected package from the URL.", error);
  }
}

function setupSoundToggleLabels() {
  document.querySelectorAll(".sound-toggle").forEach((button) => {
    if (!button.textContent.trim()) {
      button.textContent = "Muted";
    }
  });
}

const players = {};

function onYouTubeIframeAPIReady() {
  const playerDivs = document.querySelectorAll(".yt-player");

  playerDivs.forEach((div, index) => {
    const videoId = div.dataset.videoId;
    const playerId = `player-${index}`;
    div.id = playerId;
    players[playerId] = createPlayer(playerId, videoId);
  });
}

function createPlayer(elementId, videoId) {
  return new YT.Player(elementId, {
    height: "100%",
    width: "100%",
    videoId,
    playerVars: {
      autoplay: 0,
      controls: 0,
      loop: 1,
      playlist: videoId,
      modestbranding: 1,
      rel: 0,
      disablekb: 1,
      mute: 1
    },
    events: {
      onReady: onPlayerReady
    }
  });
}

function onPlayerReady(event) {
  const iframe = event.target.getIframe();
  const card = iframe.closest(".project-card");
  const soundToggle = card ? card.querySelector(".sound-toggle") : null;

  if (card) {
    card.addEventListener("mouseenter", () => {
      event.target.playVideo();
    });

    card.addEventListener("mouseleave", () => {
      event.target.pauseVideo();
    });
  }

  if (soundToggle) {
    soundToggle.textContent = "Muted";
  }
}

document.addEventListener("click", (event) => {
  const button = event.target.closest(".sound-toggle");

  if (!button) {
    return;
  }

  const card = button.closest(".project-card");
  const playerDiv = card ? card.querySelector(".yt-player") : null;
  const player = playerDiv ? players[playerDiv.id] : null;

  if (!player || typeof player.isMuted !== "function") {
    return;
  }

  if (player.isMuted()) {
    player.unMute();
    button.textContent = "Sound On";
    button.setAttribute("aria-label", "Mute video");
  } else {
    player.mute();
    button.textContent = "Muted";
    button.setAttribute("aria-label", "Unmute video");
  }
});

function setCurrentYear() {
  document.querySelectorAll("[data-current-year]").forEach((node) => {
    node.textContent = String(new Date().getFullYear());
  });
}
