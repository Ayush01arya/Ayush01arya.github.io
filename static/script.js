const chatInput = document.querySelector("#chat-input");
const sendButton = document.querySelector("#send-btn");
const voiceButton = document.querySelector("#voice-btn");
const clearButton = document.querySelector("#clear-btn");
const chatContainer = document.querySelector(".chat-container");

let userText = null;

const createChatElement = (content, className) => {
    const chatDiv = document.createElement("div");
    chatDiv.classList.add("chat", className);
    chatDiv.innerHTML = content;
    return chatDiv;
}

const scrollToBottom = () => {
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

const getChatResponse = async (incomingChatDiv) => {
    const pElement = document.createElement("p");

    try {
        const response = await fetch("/ask", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ query: userText })
        });
        const data = await response.json();
        pElement.textContent = data.response;
        speakResponse(data.response); // Speak the response
    } catch (error) {
        pElement.classList.add("error");
        pElement.textContent = "Oops! Something went wrong while retrieving the response. Please try again.";
    }

    incomingChatDiv.querySelector(".typing-animation").remove();
    incomingChatDiv.querySelector(".chat-details").appendChild(pElement);
    scrollToBottom(); // Ensure scroll to bottom
}

const speakResponse = (responseText) => {
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(responseText);
        utterance.lang = 'hi-IN'; // Adjust language as needed
        utterance.onerror = (event) => {
            console.error('Speech synthesis error:', event);
        };
        window.speechSynthesis.speak(utterance);
    } else {
        console.error('Speech synthesis not supported in this browser.');
    }
}

const showTypingAnimation = () => {
    const html = `<div class="chat-content">
                    <div class="chat-details">
                        <img src="static/bot.png" alt="chatbot-img">
                        <div class="typing-animation">
                            <div class="typing-dot" style="--delay: 0.2s"></div>
                            <div class="typing-dot" style="--delay: 0.3s"></div>
                            <div class="typing-dot" style="--delay: 0.4s"></div>
                        </div>
                    </div>
                </div>`;
    const incomingChatDiv = createChatElement(html, "incoming");
    chatContainer.appendChild(incomingChatDiv);
    scrollToBottom(); // Ensure scroll to bottom
    getChatResponse(incomingChatDiv);
}

const handleOutgoingChat = () => {
    userText = chatInput.value.trim();
    if (!userText) return;

    chatInput.value = "";
    chatInput.style.height = `${initialInputHeight}px`;

    const html = `<div class="chat-content">
                    <div class="chat-details">
                        <img src="static/profile.jpg" alt="user-img">
                        <p>${userText}</p>
                    </div>
                </div>`;

    const outgoingChatDiv = createChatElement(html, "outgoing");
    chatContainer.querySelector(".default-text")?.remove();
    chatContainer.appendChild(outgoingChatDiv);
    scrollToBottom(); // Ensure scroll to bottom
    setTimeout(showTypingAnimation, 500);
}

const handleVoiceInput = () => {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = 'hi-IN'; // Hindi language code (for Bhojpuri, as direct support might not be available)

    recognition.onstart = () => {
        console.log('Voice recognition started. Speak into the microphone.');
    };

    recognition.onspeechend = () => {
        recognition.stop();
        console.log('Voice recognition stopped.');
    };

    recognition.onresult = async (event) => {
        const speechResult = event.results[0][0].transcript;
        userText = speechResult;

        const html = `<div class="chat-content">
                        <div class="chat-details">
                            <img src="static/profile.jpg" alt="user-img">
                            <p>${userText}</p>
                        </div>
                    </div>`;

        const outgoingChatDiv = createChatElement(html, "outgoing");
        chatContainer.querySelector(".default-text")?.remove();
        chatContainer.appendChild(outgoingChatDiv);
        scrollToBottom(); // Ensure scroll to bottom
        setTimeout(showTypingAnimation, 500);
    };

    recognition.onerror = (event) => {
        console.error('Speech recognition error', event.error);
    };

    recognition.start();
}

const clearChat = () => {
    chatContainer.innerHTML = '';
    const defaultText = `<div class="default-text">
                            <h1>स्वागत है!</h1>
                            <p>चैटबॉट के साथ बातचीत शुरू करें।</p>
                         </div>`;
    chatContainer.innerHTML = defaultText;
}

sendButton.addEventListener("click", handleOutgoingChat);
voiceButton.addEventListener("click", handleVoiceInput);
clearButton.addEventListener("click", clearChat);

const initialInputHeight = chatInput.scrollHeight;

chatInput.addEventListener("input", () => {
    chatInput.style.height = `${initialInputHeight}px`;
    chatInput.style.height = `${chatInput.scrollHeight}px`;
});

chatInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleOutgoingChat();
    }
});
