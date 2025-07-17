// Chat application for L'Oréal product assistant
// Array to store all messages in the conversation
let messages = [];

// System prompt that defines the chatbot's role and strict boundaries
const systemPrompt = {
  role: "system",
  content: `You are a L'Oréal Beauty Assistant chatbot. Your ONLY purpose is to help customers with L'Oréal products and beauty advice.

WHAT YOU CAN HELP WITH:
- L'Oréal makeup products (foundations, lipsticks, mascaras, eyeshadows, etc.)
- L'Oréal skincare products and routines (cleansers, moisturizers, serums, etc.)
- L'Oréal haircare products and hair advice (shampoos, conditioners, styling products)
- L'Oréal fragrances and perfumes
- Beauty application techniques and makeup tutorials
- Product recommendations based on skin type, hair type, or beauty preferences
- Color matching and shade selection for L'Oréal products
- Beauty routines (morning/evening skincare, makeup looks)
- L'Oréal product ingredients and their benefits
- Beauty tips using L'Oréal products

WHAT YOU MUST POLITELY REFUSE:
- Questions about other beauty brands or non-L'Oréal products
- Medical advice or treatment of skin/hair conditions
- General topics unrelated to beauty (weather, news, politics, etc.)
- Other companies' products or services
- Personal information requests
- Technical support unrelated to beauty
- Fashion advice not related to beauty/makeup
- Health advice beyond basic beauty care

RESPONSE GUIDELINES:
- Always be friendly, helpful, and enthusiastic about L'Oréal beauty
- If asked about non-L'Oréal topics, politely redirect with: "I'm here specifically to help you with L'Oréal beauty products and advice! Let me know if you'd like recommendations for our amazing makeup, skincare, haircare, or fragrances. What beauty goals can I help you achieve today? ✨"
- Provide specific L'Oréal product names when possible
- Keep responses concise but informative (2-4 sentences)
- Use beauty emojis sparingly (💄, ✨, 💅) to maintain professionalism
- Always focus on L'Oréal products exclusively

Remember: You must NEVER provide information about competing beauty brands. Always redirect to L'Oréal products and beauty advice only.`,
};

// Add the system prompt to start the conversation
messages.push(systemPrompt);

// Get references to HTML elements we'll use
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");
const sendBtn = document.getElementById("sendBtn");

// Show welcome message when page loads
document.addEventListener("DOMContentLoaded", function () {
  // Display a friendly welcome message to start the conversation
  addMessage(
    "assistant",
    "Hello! Welcome to L'Oréal! 💄 I'm your personal beauty assistant, here to help you discover our incredible range of makeup, skincare, haircare, and fragrances. What beauty adventure can we start today?"
  );
});

// Handle form submission when user sends a message
chatForm.addEventListener("submit", async function (event) {
  // Prevent the form from refreshing the page
  event.preventDefault();

  // Get the user's message and remove extra spaces
  const userMessage = userInput.value.trim();

  // Don't send empty messages
  if (!userMessage) return;

  // Add the user's message to the chat window
  addMessage("user", userMessage);

  // Add the user's message to our conversation history
  messages.push({
    role: "user",
    content: userMessage,
  });

  // Clear the input field and disable the send button
  userInput.value = "";
  sendBtn.disabled = true;

  // Show typing animation while waiting for response
  showTypingIndicator();

  try {
    // Get AI response from the API
    await getAIResponse();
  } catch (error) {
    // If something goes wrong, show an error message
    console.error("Error getting AI response:", error);
    addMessage(
      "assistant",
      "Sorry, I'm having trouble connecting right now. Please try again in a moment! In the meantime, feel free to ask me about any L'Oréal products you're curious about! ✨"
    );
  } finally {
    // Re-enable the send button and remove typing indicator
    sendBtn.disabled = false;
    hideTypingIndicator();
    // Put focus back on the input field
    userInput.focus();
  }
});

// Function to add messages to the chat window with conversation-like styling
function addMessage(sender, content) {
  // Create a new div element for the message
  const messageDiv = document.createElement("div");
  messageDiv.className = `message ${sender}`;

  // Create the avatar (profile picture area)
  const avatar = document.createElement("div");
  avatar.className = "message-avatar";
  // Use 'U' for user, 'L' for L'Oréal assistant
  avatar.textContent = sender === "user" ? "U" : "L";

  // Create the message content area (the speech bubble)
  const messageContent = document.createElement("div");
  messageContent.className = "message-content";
  messageContent.textContent = content;

  // Add avatar and content to the message
  messageDiv.appendChild(avatar);
  messageDiv.appendChild(messageContent);

  // Add the complete message to the chat window
  chatWindow.appendChild(messageDiv);

  // Scroll to the bottom to show the new message with smooth animation
  setTimeout(() => {
    chatWindow.scrollTop = chatWindow.scrollHeight;
  }, 100);
}

// Function to show typing animation while AI is thinking
function showTypingIndicator() {
  // Create typing indicator element
  const typingDiv = document.createElement("div");
  typingDiv.id = "typingIndicator";
  typingDiv.className = "message assistant";

  // Create avatar for typing indicator
  const avatar = document.createElement("div");
  avatar.className = "message-avatar";
  avatar.textContent = "L";

  // Create content area for typing animation
  const typingContent = document.createElement("div");
  typingContent.className = "message-content";

  // Create the animated dots
  const typingIndicator = document.createElement("div");
  typingIndicator.className = "typing-indicator";

  // Create three dots that will animate
  for (let i = 0; i < 3; i++) {
    const dot = document.createElement("div");
    dot.className = "typing-dot";
    typingIndicator.appendChild(dot);
  }

  // Put it all together
  typingContent.appendChild(typingIndicator);
  typingDiv.appendChild(avatar);
  typingDiv.appendChild(typingContent);

  // Add to chat window and scroll to show it
  chatWindow.appendChild(typingDiv);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

// Function to remove typing indicator
function hideTypingIndicator() {
  const typingIndicator = document.getElementById("typingIndicator");
  if (typingIndicator) {
    typingIndicator.remove();
  }
}

// Function to get AI response from OpenAI API via Cloudflare Worker
async function getAIResponse() {
  // URL for our Cloudflare Worker that handles API requests securely
  const apiUrl = "https://blue-frost-b76f.tjca02.workers.dev/";

  try {
    // Make a request to the OpenAI API via Cloudflare Worker
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: messages, // Send our conversation history including system prompt
      }),
    });

    // Check if the request was successful
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Get the JSON response from the API
    const data = await response.json();

    // Extract the AI's response from the API response
    const aiResponse = data.choices[0].message.content;

    // Add the AI's response to our conversation history
    messages.push({
      role: "assistant",
      content: aiResponse,
    });

    // Display the AI's response in the chat window
    addMessage("assistant", aiResponse);
  } catch (error) {
    // Log error details and re-throw so calling function can handle it
    console.error("API request failed:", error);
    throw error;
  }
}

// Allow Enter key to send message (alternative to clicking send button)
userInput.addEventListener("keypress", function (event) {
  // Check if Enter key was pressed (but not Shift+Enter for multi-line)
  if (event.key === "Enter" && !event.shiftKey) {
    // Prevent default Enter behavior (new line)
    event.preventDefault();
    // Trigger form submission
    chatForm.dispatchEvent(new Event("submit"));
  }
});
