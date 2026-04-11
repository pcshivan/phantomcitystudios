document.addEventListener("DOMContentLoaded", () => {
  runSafely(setupHeaderState);
  runSafely(setupNavigation);
  runSafely(setupRevealAnimations);
  runSafely(setupAmbientPointer);
  runSafely(setupImageShowcase);
  runSafely(setupTiltCard);
  runSafely(setupFaqAccordion);
  runSafely(setupContactPackagePrefill);
  runSafely(setupContactFormSubmission);
  runSafely(setupSoundToggleLabels);
  runSafely(setCurrentYear);
});

const CONTACT_FORM_ENDPOINT = "https://formspree.io/f/xldnnovk";

function runSafely(setupFn) {
  try {
    setupFn();
  } catch (error) {
    console.error(`Unable to initialize ${setupFn.name || "page behavior"}.`, error);
  }
}

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

  window.setTimeout(() => {
    const hasVisibleItems = revealItems.some((item) => item.classList.contains("visible") || item.classList.contains("is-visible"));

    if (!hasVisibleItems) {
      revealItems.forEach(showItem);
    }
  }, 900);
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

  contactForm.setAttribute("action", CONTACT_FORM_ENDPOINT);

  try {
    const serviceSelect = document.getElementById("service-selection");
    const selectedPackage = getSelectedContactPackage();

    if (selectedPackage && serviceSelect && serviceSelect.querySelector(`[value="${selectedPackage}"]`)) {
      serviceSelect.value = selectedPackage;
    }

    syncContactFormMetadata(contactForm);
  } catch (error) {
    console.error("Unable to sync selected package from the URL.", error);
  }
}

function setupContactFormSubmission() {
  const contactForm = document.getElementById("contact-form");

  if (!contactForm) {
    return;
  }

  const submitButton = contactForm.querySelector('button[type="submit"]');
  const statusNode = contactForm.querySelector("[data-form-status]");
  const defaultButtonLabel = submitButton ? submitButton.textContent : "";

  contactForm.setAttribute("action", CONTACT_FORM_ENDPOINT);
  syncContactFormMetadata(contactForm);

  ["input", "change"].forEach((eventName) => {
    contactForm.addEventListener(eventName, () => {
      syncContactFormMetadata(contactForm);
    });
  });

  contactForm.addEventListener("submit", async (event) => {
    trimContactFormFields(contactForm);
    syncContactFormMetadata(contactForm);
    stampContactFormSubmission(contactForm);

    if (typeof window.fetch !== "function") {
      return;
    }

    event.preventDefault();

    const isValid =
      typeof contactForm.reportValidity === "function" ? contactForm.reportValidity() : contactForm.checkValidity();

    if (!isValid) {
      updateContactFormStatus(statusNode, "error", "Please review the highlighted fields and try again.");
      return;
    }

    syncContactFormMetadata(contactForm);

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "Sending...";
    }

    contactForm.setAttribute("aria-busy", "true");
    updateContactFormStatus(statusNode, "info", "Sending your enquiry...");

    try {
      const response = await fetch(CONTACT_FORM_ENDPOINT, {
        method: "POST",
        body: new FormData(contactForm),
        headers: {
          Accept: "application/json"
        }
      });

      if (!response.ok) {
        let message = "We could not send your enquiry just now. Please try again in a moment.";

        try {
          const errorData = await response.json();

          if (Array.isArray(errorData.errors) && errorData.errors.length) {
            message = errorData.errors.map((error) => error.message).join(" ");
          }
        } catch (error) {
          console.error("Unable to parse contact form error response.", error);
        }

        throw new Error(message);
      }

      contactForm.reset();
      setupContactPackagePrefill();
      updateContactFormStatus(statusNode, "success", "Thanks. Your enquiry has been sent successfully.");
    } catch (error) {
      console.error("Contact form submission failed.", error);
      updateContactFormStatus(
        statusNode,
        "error",
        error instanceof Error && error.message
          ? error.message
          : "An unexpected error occurred. Please try again shortly."
      );
    } finally {
      contactForm.removeAttribute("aria-busy");

      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = defaultButtonLabel;
      }

      syncContactFormMetadata(contactForm);
    }
  });
}

function getSelectedContactPackage() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get("package") || "";
}

function setContactFormFieldValue(contactForm, fieldName, fieldValue) {
  let field = contactForm.elements.namedItem(fieldName);

  if (!field) {
    field = document.createElement("input");
    field.type = "hidden";
    field.name = fieldName;
    contactForm.prepend(field);
  }

  if (field && "value" in field) {
    field.value = fieldValue;
  }
}

function syncContactFormMetadata(contactForm) {
  const emailField = contactForm.elements.namedItem("email");
  const serviceField = contactForm.elements.namedItem("service_interest");
  const selectedPackage = getSelectedContactPackage();
  const selectedServiceValue =
    serviceField && "value" in serviceField && serviceField.value ? serviceField.value : "";
  const selectedServiceLabel =
    serviceField &&
    "selectedOptions" in serviceField &&
    serviceField.selectedOptions &&
    serviceField.selectedOptions[0] &&
    serviceField.selectedOptions[0].value
      ? serviceField.selectedOptions[0].textContent.trim()
      : "";
  const subjectSuffix = selectedServiceValue ? ` - ${selectedServiceValue}` : "";

  setContactFormFieldValue(contactForm, "_replyto", emailField && "value" in emailField ? emailField.value.trim() : "");
  setContactFormFieldValue(contactForm, "_subject", `New Phantom City Studios Contact Enquiry${subjectSuffix}`);
  setContactFormFieldValue(contactForm, "page_url", window.location.href);
  setContactFormFieldValue(contactForm, "service_interest_label", selectedServiceLabel);
  setContactFormFieldValue(contactForm, "selected_package", selectedPackage);
}

function stampContactFormSubmission(contactForm) {
  setContactFormFieldValue(contactForm, "submitted_at", new Date().toISOString());
}

function trimContactFormFields(contactForm) {
  ["name", "email", "mobile", "details"].forEach((fieldName) => {
    const field = contactForm.elements.namedItem(fieldName);

    if (field && "value" in field && typeof field.value === "string") {
      field.value = field.value.trim();
    }
  });
}

function updateContactFormStatus(statusNode, type, message) {
  if (!statusNode) {
    return;
  }

  statusNode.hidden = false;
  statusNode.textContent = message;
  statusNode.classList.remove("is-info", "is-success", "is-error");

  if (type === "success") {
    statusNode.classList.add("is-success");
  } else if (type === "error") {
    statusNode.classList.add("is-error");
  } else {
    statusNode.classList.add("is-info");
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
