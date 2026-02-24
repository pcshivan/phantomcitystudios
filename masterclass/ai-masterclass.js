// ai-masterclass.js

document.addEventListener('DOMContentLoaded', () => {
    const enrollmentForm = document.getElementById('enrollment-form');
    const formMessage = document.getElementById('form-message');

    // --- Formspree Configuration ---
    const FORM_ENDPOINT = "https://formspree.io/f/xkgbeedy"; // Your provided Formspree URL

    // We no longer need to set form.action here, as fetch will handle it.
    // However, keeping it set for clarity or if native submission were ever desired.
    if (enrollmentForm) {
        enrollmentForm.setAttribute('action', FORM_ENDPOINT);
    }

    // --- Form Validation ---
    const validateForm = () => {
        let isValid = true;

        // Name validation
        const nameInput = document.getElementById('name');
        const nameError = document.getElementById('name-error');
        if (nameInput.value.trim() === '') {
            nameError.textContent = 'Full Name is required.';
            isValid = false;
        } else {
            nameError.textContent = '';
        }

        // Email validation
        const emailInput = document.getElementById('email');
        const emailError = document.getElementById('email-error');
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (emailInput.value.trim() === '') {
            emailError.textContent = 'Email Address is required.';
            isValid = false;
        } else if (!emailRegex.test(emailInput.value.trim())) {
            emailError.textContent = 'Please enter a valid email address.';
            isValid = false;
        } else {
            emailError.textContent = '';
        }

        // Phone validation
        const phoneInput = document.getElementById('phone');
        const phoneError = document.getElementById('phone-error');
        const phoneRegex = /^\+?[0-9\s\-()]{7,20}$/;
        if (phoneInput.value.trim() !== '' && !phoneRegex.test(phoneInput.value.trim())) {
            phoneError.textContent = 'Please enter a valid phone number.';
            isValid = false;
        } else {
            phoneError.textContent = '';
        }

        // Preferred Date validation
        const preferredDateInput = document.getElementById('preferred-date');
        const preferredDateError = document.getElementById('preferred-date-error');
        if (preferredDateInput.value === '') {
            preferredDateError.textContent = 'Please select a preferred date.';
            isValid = false;
        } else {
            preferredDateError.textContent = '';
        }

        // Preferred Time Slot validation
        const preferredTimeInput = document.getElementById('preferred-time');
        const preferredTimeError = document.getElementById('preferred-time-error');
        if (preferredTimeInput.value === '') {
            preferredTimeError.textContent = 'Please select a preferred time slot.';
            isValid = false;
        } else {
            preferredTimeError.textContent = '';
        }

        return isValid;
    };

    // --- Form Submission Handler ---
    enrollmentForm.addEventListener('submit', async (event) => { // Made async again
        event.preventDefault(); // Crucial: Prevent default form submission to use fetch

        formMessage.style.display = 'none'; // Hide previous messages
        formMessage.classList.remove('success', 'error', 'info');

        if (!validateForm()) {
            formMessage.textContent = 'Please correct the errors in the form.';
            formMessage.classList.add('error');
            formMessage.style.display = 'block';
            return; // Stop if validation fails
        }

        // Show a loading message
        formMessage.textContent = 'Processing your enrollment...';
        formMessage.classList.add('info');
        formMessage.style.display = 'block';
        enrollmentForm.querySelector('button[type="submit"]').disabled = true; // Disable button

        // Collect form data manually for fetch request
        const formData = new FormData(enrollmentForm);
        const data = {};
        for (let [key, value] of formData.entries()) {
            // Exclude Formspree's hidden fields like _next, _cc, _subject, _replyto from data sent
            // unless you explicitly want them in the email body.
            // For _replyto and _subject, Formspree handles them from hidden fields.
            if (!key.startsWith('_')) {
                 data[key] = value;
            }
        }

        try {
            const response = await fetch(FORM_ENDPOINT, {
                method: 'POST',
                body: new FormData(enrollmentForm), // Send raw FormData for Formspree to process hidden fields
                headers: {
                    'Accept': 'application/json' // Essential for Formspree to return JSON response
                }
            });

            if (response.ok) {
                // Manually construct URL parameters from the submitted data
                const queryString = new URLSearchParams(formData).toString();
                
                // Redirect to thanks.html after successful submission
                window.location.href = `thanks.html?${queryString}`;

            } else {
                const errorData = await response.json();
                if (errorData.errors && errorData.errors.some(err => err.field === 'email' && err.code === 'is_email')) {
                     formMessage.textContent = 'Enrollment failed: The provided email address is invalid or not accepted.';
                } else {
                     formMessage.textContent = `Enrollment failed: ${errorData.errors ? errorData.errors[0].message : 'Something went wrong.'}`;
                }
                formMessage.classList.add('error');
                formMessage.style.display = 'block'; // Ensure error message is displayed
            }
        } catch (error) {
            console.error('Error during enrollment:', error);
            formMessage.textContent = 'An unexpected error occurred. Please try again later.';
            formMessage.classList.add('error');
            formMessage.style.display = 'block'; // Ensure error message is displayed
        } finally {
            enrollmentForm.querySelector('button[type="submit"]').disabled = false; // Re-enable button
        }
    });

    // --- Smooth Scrolling for CTA Button ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // --- Simple Testimonial Carousel (Manual Scroll) ---
    const testimonialCarousel = document.querySelector('.testimonial-carousel');
    if (testimonialCarousel) {
        testimonialCarousel.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                testimonialCarousel.scrollBy({ left: -testimonialCarousel.offsetWidth * 0.8, behavior: 'smooth' });
            } else if (e.key === 'ArrowRight') {
                testimonialCarousel.scrollBy({ left: testimonialCarousel.offsetWidth * 0.8, behavior: 'smooth' });
            }
        });
    }

});