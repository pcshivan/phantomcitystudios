// phantomcity_chat_widget.js

(function() {
    // --- Configuration Variables (ADJUST THESE TO MATCH YOUR SITE & BACKEND) ---
    const BACKEND_API_URL = 'http://127.0.0.1:5000/chat'; // IMPORTANT: Change this to your deployed backend URL
    const CLIENT_EMAIL_SEND_API_URL = 'http://127.00.1:5000/send_client_email'; // Placeholder: Backend endpoint for sending client email
    const CHAT_INACTIVITY_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes in milliseconds
    const MIN_CONVERSATIONS_FOR_SENDGRID = 5; // Minimum number of exchanges to consider for SendGrid list
    const SENDGRID_LIST_API_URL = 'http://127.0.0.1:5000/add_to_sendgrid'; // Placeholder: Backend endpoint for SendGrid integration

    // --- HTML Structure for the Chat Widget ---
    const chatWidgetHTML = `
        <div id="phantom-chat-container">
            <button id="phantom-chat-toggle-button">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-message-circle"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 5.6 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-2.2c-.6-.9-1-2.1-1-3.4a8.38 8.38 0 0 1 .9-3.8 8.5 8.5 0 0 1 7.6-5.6 8.38 8.38 0 0 1 3.8.9L21 3l-1.9 2.2c.6.9 1 2.1 1 3.4z"></path></svg>
            </button>
            <div id="phantom-chat-window">
                <div id="phantom-chat-header">
                    <h3>Phantom City Studios Chat</h3>
                    <span id="phantom-chat-status">Online</span>
                    <button id="phantom-chat-close-button">&times;</button>
                </div>
                <div id="phantom-chat-messages">
                    <div class="message system">
                        Welcome to Phantom City Studios! How can we assist you with your creative vision today?
                    </div>
                </div>
                <div id="phantom-chat-input-area">
                    <textarea id="phantom-chat-input" placeholder="Type your message..." rows="1"></textarea>
                    <button id="phantom-chat-send-button">Send</button>
                </div>
            </div>
        </div>
    `;

    // --- CSS Styling (CUSTOMIZE THIS TO MATCH YOUR WEBSITE'S AESTHETICS) ---
    const chatWidgetCSS = `
        #phantom-chat-container * {
            box-sizing: border-box;
            font-family: 'Montserrat', sans-serif; /* Example: Use your site's primary font */
        }

        #phantom-chat-container {
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 1000;
            user-select: none;
        }

        #phantom-chat-toggle-button {
            background-color: #A020F0; /* Phantom City primary color - Adjust! */
            color: #fff;
            border: none;
            border-radius: 50%;
            width: 60px;
            height: 60px;
            font-size: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
            transition: transform 0.3s ease, background-color 0.3s ease;
            outline: none;
        }
        #phantom-chat-toggle-button:hover {
            transform: scale(1.05);
            background-color: #8A00C0; /* Slightly darker hover color - Adjust! */
        }
        #phantom-chat-toggle-button svg {
            width: 30px;
            height: 30px;
        }

        #phantom-chat-window {
            background-color: #1A1A1A; /* Dark background matching your site - Adjust! */
            border-radius: 12px;
            box-shadow: 0 8px 30px rgba(0, 0, 0, 0.4);
            width: 350px;
            height: 500px;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            position: absolute;
            bottom: calc(100% + 15px); /* Position above the toggle button */
            right: 0;
            transform-origin: bottom right;
            transform: scale(0);
            opacity: 0;
            transition: transform 0.3s ease, opacity 0.3s ease;
        }
        #phantom-chat-window.open {
            transform: scale(1);
            opacity: 1;
        }

        #phantom-chat-header {
            background-color: #282828; /* Header background - Adjust! */
            color: #fff;
            padding: 15px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            border-bottom: 1px solid #333; /* Border color - Adjust! */
            position: relative;
        }
        #phantom-chat-header h3 {
            margin: 0;
            font-size: 1.1em;
            color: #A020F0; /* Your primary color for heading - Adjust! */
        }
        #phantom-chat-status {
            font-size: 0.8em;
            color: #777; /* Status color - Adjust! */
            margin-left: 10px;
        }
        #phantom-chat-close-button {
            background: none;
            border: none;
            color: #aaa;
            font-size: 24px;
            cursor: pointer;
            line-height: 1;
            padding: 0;
            transition: color 0.2s ease;
        }
        #phantom-chat-close-button:hover {
            color: #fff;
        }

        #phantom-chat-messages {
            flex-grow: 1;
            padding: 15px;
            overflow-y: auto;
            background-color: #1A1A1A; /* Chat background - Adjust! */
            color: #E0E0E0; /* Text color - Adjust! */
            display: flex;
            flex-direction: column;
            gap: 10px;
            scrollbar-width: thin;
            scrollbar-color: #A020F0 #222; /* Thumb and track color - Adjust! */
        }
        #phantom-chat-messages::-webkit-scrollbar {
            width: 8px;
        }
        #phantom-chat-messages::-webkit-scrollbar-track {
            background: #222; /* Scrollbar track - Adjust! */
            border-radius: 10px;
        }
        #phantom-chat-messages::-webkit-scrollbar-thumb {
            background-color: #A020F0; /* Scrollbar thumb - Adjust! */
            border-radius: 10px;
            border: 2px solid #222;
        }

        .message {
            max-width: 80%;
            padding: 10px 15px;
            border-radius: 18px;
            line-height: 1.4;
            word-wrap: break-word;
        }
        .message.user {
            background-color: #A020F0; /* User message bubble - Adjust! */
            color: #fff;
            align-self: flex-end;
            border-bottom-right-radius: 4px;
        }
        .message.agent {
            background-color: #333; /* Agent message bubble - Adjust! */
            color: #E0E0E0;
            align-self: flex-start;
            border-bottom-left-radius: 4px;
        }
        .message.system {
            background-color: #444;
            color: #ccc;
            align-self: center;
            text-align: center;
            font-style: italic;
            font-size: 0.9em;
            max-width: 90%;
            border-radius: 8px;
        }

        #phantom-chat-input-area {
            display: flex;
            padding: 10px 15px;
            border-top: 1px solid #333; /* Input area border - Adjust! */
            background-color: #282828; /* Input area background - Adjust! */
        }
        #phantom-chat-input {
            flex-grow: 1;
            border: 1px solid #555; /* Input border - Adjust! */
            border-radius: 20px;
            padding: 10px 15px;
            background-color: #383838; /* Input background - Adjust! */
            color: #eee;
            font-size: 1em;
            resize: none; /* Prevent manual resize */
            overflow: hidden; /* Hide scrollbar if content exceeds height */
            min-height: 38px; /* Standard single line height */
            max-height: 120px; /* Max height before scrolling */
            transition: all 0.2s ease;
        }
        #phantom-chat-input:focus {
            outline: none;
            border-color: #A020F0; /* Focus border color - Adjust! */
            box-shadow: 0 0 0 2px rgba(160, 32, 240, 0.3);
        }
        #phantom-chat-input::placeholder {
            color: #888;
        }

        #phantom-chat-send-button {
            background-color: #A020F0; /* Send button - Adjust! */
            color: #fff;
            border: none;
            border-radius: 20px;
            padding: 10px 18px;
            margin-left: 10px;
            cursor: pointer;
            font-size: 1em;
            transition: background-color 0.2s ease, transform 0.1s ease;
            white-space: nowrap;
        }
        #phantom-chat-send-button:hover {
            background-color: #8A00C0; /* Send button hover - Adjust! */
        }
        #phantom-chat-send-button:active {
            transform: scale(0.98);
        }
    `;

    // --- Core Chat Logic ---
    let chatHistory = [];
    let sessionId = sessionStorage.getItem('phantom_chat_session_id') || generateSessionId();
    let inactivityTimer;
    let conversationTurnCount = 0; // Tracks number of user-agent exchanges

    // Function to generate a unique session ID
    function generateSessionId() {
        const id = 'chat_' + Date.now() + Math.random().toString(36).substr(2, 9);
        sessionStorage.setItem('phantom_chat_session_id', id);
        return id;
    }

    // Function to initialize the chat widget
    function initChatWidget() {
        // Inject HTML
        document.body.insertAdjacentHTML('beforeend', chatWidgetHTML);

        // Inject CSS
        const styleTag = document.createElement('style');
        styleTag.innerHTML = chatWidgetCSS;
        document.head.appendChild(styleTag);

        // Get DOM elements
        const chatContainer = document.getElementById('phantom-chat-container');
        const chatToggleButton = document.getElementById('phantom-chat-toggle-button');
        const chatWindow = document.getElementById('phantom-chat-window');
        const chatCloseButton = document.getElementById('phantom-chat-close-button');
        const chatMessages = document.getElementById('phantom-chat-messages');
        const chatInput = document.getElementById('phantom-chat-input');
        const chatSendButton = document.getElementById('phantom-chat-send-button');

        // Event Listeners
        chatToggleButton.addEventListener('click', () => {
            chatWindow.classList.toggle('open');
            if (chatWindow.classList.contains('open')) {
                resetInactivityTimer();
                chatInput.focus();
                scrollToBottom(chatMessages);
            } else {
                clearTimeout(inactivityTimer); // Stop timer when closed
            }
        });

        chatCloseButton.addEventListener('click', () => {
            chatWindow.classList.remove('open');
            clearTimeout(inactivityTimer); // Stop timer when closed
        });

        chatSendButton.addEventListener('click', sendMessage);
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault(); // Prevent new line
                sendMessage();
            }
        });

        // Auto-resize textarea
        chatInput.addEventListener('input', autoResizeTextarea);

        // Load existing history if available (e.g., from server on page reload if persistent)
        // For simplicity, we'll start fresh unless you implement server-side history retrieval.
        // For current persistence across page reloads in a single browser session:
        const storedHistory = sessionStorage.getItem(`phantom_chat_history_${sessionId}`);
        if (storedHistory) {
            chatHistory = JSON.parse(storedHistory);
            chatHistory.forEach(msg => displayMessage(msg.content, msg.role));
            scrollToBottom(chatMessages);
        } else {
            // Add initial system message if no history
            chatHistory.push({ role: 'system', content: 'Welcome to Phantom City Studios! How can we assist you with your creative vision today?' });
        }


        resetInactivityTimer(); // Start timer on page load

        // Add a dummy endpoint in backend to send client full conversation history
        // This is a placeholder for a new backend route
        async function sendClientConversationEmail(emailAddress, conversation) {
            try {
                const response = await fetch(CLIENT_EMAIL_SEND_API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: emailAddress, conversation: conversation, subject: "Your Chat with Phantom City Studios" })
                });
                if (!response.ok) {
                    console.error('Failed to send client conversation email:', await response.text());
                }
            } catch (error) {
                console.error('Error sending client conversation email:', error);
            }
        }
    }

    // Function to display messages in the chat window
    function displayMessage(message, sender) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', sender);
        messageElement.innerHTML = message.replace(/\n/g, '<br>'); // Preserve newlines
        document.getElementById('phantom-chat-messages').appendChild(messageElement);
        scrollToBottom(document.getElementById('phantom-chat-messages'));
    }

    // Function to scroll to the bottom of the chat window
    function scrollToBottom(element) {
        element.scrollTop = element.scrollHeight;
    }

    // Function to auto-resize textarea based on content
    function autoResizeTextarea() {
        const input = document.getElementById('phantom-chat-input');
        input.style.height = 'auto'; // Reset height
        input.style.height = input.scrollHeight + 'px'; // Set to scroll height
    }

    // Function to send message to backend
    async function sendMessage() {
        const inputField = document.getElementById('phantom-chat-input');
        const userMessage = inputField.value.trim();

        if (userMessage === '') {
            return;
        }

        displayMessage(userMessage, 'user');
        chatHistory.push({ role: 'user', content: userMessage });
        inputField.value = '';
        autoResizeTextarea(); // Reset textarea height after clearing

        resetInactivityTimer(); // Reset timer on every user message

        // Add a loading indicator
        const loadingMessage = document.createElement('div');
        loadingMessage.classList.add('message', 'agent', 'loading');
        loadingMessage.innerHTML = 'Thinking...';
        document.getElementById('phantom-chat-messages').appendChild(loadingMessage);
        scrollToBottom(document.getElementById('phantom-chat-messages'));

        try {
            const response = await fetch(BACKEND_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: userMessage, session_id: sessionId }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            document.getElementById('phantom-chat-messages').removeChild(loadingMessage); // Remove loading indicator

            const agentResponse = data.response;
            displayMessage(agentResponse, 'agent');
            chatHistory.push({ role: 'assistant', content: agentResponse });
            conversationTurnCount++;

            // --- Robustness & Best Practices for Lead Generation ---

            // Save history to session storage
            sessionStorage.setItem(`phantom_chat_history_${sessionId}`, JSON.stringify(chatHistory));

            // Check if agent asked for email, then prompt user to enter it for SendGrid
            // This is a simple keyword check; a more advanced solution would involve a structured response from the LLM
            if (agentResponse.toLowerCase().includes('email address') || agentResponse.toLowerCase().includes('contact information')) {
                // You might want a dedicated modal or input field for this for better UX
                const emailPrompt = document.createElement('div');
                emailPrompt.classList.add('message', 'system');
                emailPrompt.innerHTML = "If you'd like to receive more information, please type your email address below.";
                document.getElementById('phantom-chat-messages').appendChild(emailPrompt);
                scrollToBottom(document.getElementById('phantom-chat-messages'));

                // Listen for the next message to be an email address
                // This is a very basic implementation. For production, you'd want
                // a state machine or a more robust way to handle this flow.
                const handleEmailInput = async (event) => {
                    if (event.type === 'keypress' && event.key !== 'Enter') return;
                    if (event.type === 'click' && event.target !== chatSendButton) return;

                    const emailInputAttempt = inputField.value.trim();
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (emailRegex.test(emailInputAttempt)) {
                        displayMessage(emailInputAttempt, 'user'); // Show user's email input
                        chatHistory.push({ role: 'user', content: `(Provided Email): ${emailInputAttempt}` }); // Store it in history

                        displayMessage("Thank you! We've noted your email and will be in touch shortly.", 'agent');
                        chatHistory.push({ role: 'assistant', content: "Thank you! We've noted your email and will be in touch shortly." });

                        // Send email to SendGrid via backend
                        await addEmailToSendGrid(emailInputAttempt);

                        // Remove this listener after email is captured
                        chatSendButton.removeEventListener('click', handleEmailInput);
                        chatInput.removeEventListener('keypress', handleEmailInput);

                        inputField.value = '';
                        autoResizeTextarea();
                        scrollToBottom(document.getElementById('phantom-chat-messages'));
                    } else if (emailInputAttempt !== '') {
                        displayMessage("That doesn't look like a valid email. Please try again or continue chatting.", 'system');
                        inputField.value = '';
                        autoResizeTextarea();
                    }
                };

                // Add temporary listeners for email capture
                chatSendButton.addEventListener('click', handleEmailInput, { once: true }); // Use once to auto-remove
                chatInput.addEventListener('keypress', handleEmailInput, { once: true });
            }


            // --- SendGrid Integration (after 5 conversations) ---
            if (conversationTurnCount >= MIN_CONVERSATIONS_FOR_SENDGRID) {
                // The agent has already asked for email in its response if conditions met.
                // We assume the prompt above handles the collection.
                // This is just a conceptual trigger point.
                // Actual SendGrid integration should happen *after* capturing the email.
                // The `addEmailToSendGrid` function (called in the email capture logic) handles the actual SendGrid API call.
            }

        } catch (error) {
            console.error('Error sending message:', error);
        
            document.getElementById('phantom-chat-messages').removeChild(loadingMessage); // Remove loading indicator
        
            displayMessage(
                `All our support staff are currently assisting other clients. <br>
                Please feel free to <a href="https://phantomcitystudios.com/contact" target="_blank" style="color:#007bff; text-decoration:underline;">contact us directly here</a>. We’ll be right with you!`,
                'agent'
            );
        }
    }

    // --- Chat Timeout and Conversation Emailing to Client ---
    function resetInactivityTimer() {
        if (inactivityTimer) {
            clearTimeout(inactivityTimer);
        }
        inactivityTimer = setTimeout(endChatSession, CHAT_INACTIVITY_TIMEOUT_MS);
    }

    async function endChatSession() {
        console.log("Chat session timed out or ended.");
        // Prompt user for email to send transcript
        const emailPromptMessage = "It looks like our conversation has ended. Would you like a transcript of our chat sent to your email? If so, please provide your email address.";
        displayMessage(emailPromptMessage, 'system');
        scrollToBottom(document.getElementById('phantom-chat-messages'));

        // Temporarily change send button/input behavior to capture email for transcript
        const inputField = document.getElementById('phantom-chat-input');
        const originalSendMessage = chatSendButton.onclick;
        const originalKeypress = chatInput.onkeypress;

        const handleEmailForTranscript = async (event) => {
            if (event.type === 'keypress' && event.key !== 'Enter') return;
            if (event.type === 'click' && event.target !== chatSendButton) return;

            const emailInputAttempt = inputField.value.trim();
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (emailRegex.test(emailInputAttempt)) {
                displayMessage(emailInputAttempt, 'user');
                displayMessage("Great! Sending the transcript to your inbox now. Thank you for chatting!", 'agent');
                inputField.value = '';
                autoResizeTextarea();

                // Format conversation for email
                const formattedConversation = chatHistory.map(msg => `${msg.role.toUpperCase()}: ${msg.content}`).join('\n\n');
                await sendClientConversationEmail(emailInputAttempt, formattedConversation);

                // Reset chat for new session
                resetChatState();
                chatSendButton.removeEventListener('click', handleEmailForTranscript);
                chatInput.removeEventListener('keypress', handleEmailForTranscript);

            } else if (emailInputAttempt !== '') {
                displayMessage("That doesn't look like a valid email. Please try again or type 'no' to end without transcript.", 'system');
                inputField.value = '';
                autoResizeTextarea();
                if (emailInputAttempt.toLowerCase() === 'no') {
                     displayMessage("No problem! Thank you for chatting with Phantom City Studios.", 'agent');
                     resetChatState();
                     chatSendButton.removeEventListener('click', handleEmailForTranscript);
                     chatInput.removeEventListener('keypress', handleEmailForTranscript);
                }
            }
        };

        // Attach event listeners for email capture during timeout
        chatSendButton.addEventListener('click', handleEmailForTranscript, { once: true });
        chatInput.addEventListener('keypress', handleEmailForTranscript, { once: true });

        // If user closes chat without providing email, just reset
        const chatWindow = document.getElementById('phantom-chat-window');
        chatWindow.addEventListener('transitionend', function handler() {
            if (!chatWindow.classList.contains('open')) {
                resetChatState();
                chatWindow.removeEventListener('transitionend', handler);
                chatSendButton.removeEventListener('click', handleEmailForTranscript);
                chatInput.removeEventListener('keypress', handleEmailForTranscript);
            }
        });
    }

    function resetChatState() {
        chatHistory = [];
        sessionId = generateSessionId(); // Generate new session ID
        sessionStorage.removeItem(`phantom_chat_history_${sessionId}`); // Clear old history
        document.getElementById('phantom-chat-messages').innerHTML = `
            <div class="message system">
                Welcome to Phantom City Studios! How can we assist you with your creative vision today?
            </div>
        `;
        conversationTurnCount = 0;
        document.getElementById('phantom-chat-input').value = '';
        autoResizeTextarea();
        clearTimeout(inactivityTimer); // Ensure timer is cleared
        resetInactivityTimer(); // Start new timer for the fresh session
    }


    // --- Backend Calls for SendGrid & Client Email (PLACEHOLDERS) ---

    async function addEmailToSendGrid(email) {
        console.log(`Attempting to add ${email} to SendGrid list via backend.`);
        try {
            const response = await fetch(SENDGRID_LIST_API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email, source: 'Chat Agent' })
            });
            if (response.ok) {
                console.log(`Email ${email} successfully sent to SendGrid via backend.`);
            } else {
                console.error('Failed to add email to SendGrid list:', await response.text());
            }
        } catch (error) {
            console.error('Error adding email to SendGrid list:', error);
        }
    }


    // Initialize the chat widget once the DOM is fully loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initChatWidget);
    } else {
        initChatWidget();
    }
})();
