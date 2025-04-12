document.addEventListener('DOMContentLoaded', function() {
    const messageContainer = document.getElementById('messageContainer');
    const chatForm = document.getElementById('chatForm');
    const messageInput = document.getElementById('messageInput');
    const loadingSpinnerTemplate = document.getElementById('loadingSpinner');

    function scrollToBottom() {
        messageContainer.scrollTop = messageContainer.scrollHeight;
    }

    function createMessageElement(content, isUser = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = isUser ? 'user-message' : 'ai-message';
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        messageContent.textContent = content;
        
        messageDiv.appendChild(messageContent);
        return messageDiv;
    }

    function showLoadingIndicator() {
        const loadingElement = loadingSpinnerTemplate.content.cloneNode(true);
        messageContainer.appendChild(loadingElement);
        scrollToBottom();
    }

    function removeLoadingIndicator() {
        const loadingElement = messageContainer.querySelector('.loading');
        if (loadingElement) {
            loadingElement.parentElement.remove();
        }
    }

    async function handleSubmit(e) {
        e.preventDefault();
        
        const message = messageInput.value.trim();
        if (!message) return;

        // Clear input
        messageInput.value = '';

        // Add user message
        messageContainer.appendChild(createMessageElement(message, true));
        scrollToBottom();

        // Show loading indicator
        showLoadingIndicator();

        try {
            const response = await fetch('/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: message })
            });

            const data = await response.json();

            // Remove loading indicator
            removeLoadingIndicator();

            if (response.ok) {
                // Add AI response
                messageContainer.appendChild(createMessageElement(data.response));
            } else {
                // Add error message
                messageContainer.appendChild(
                    createMessageElement('Sorry, I encountered an error: ' + (data.error || 'Unknown error'))
                );
            }
        } catch (error) {
            // Remove loading indicator
            removeLoadingIndicator();
            
            // Add error message
            messageContainer.appendChild(
                createMessageElement('Sorry, I encountered a network error. Please try again.')
            );
        }

        scrollToBottom();
    }

    // Event Listeners
    chatForm.addEventListener('submit', handleSubmit);

    // Enable enter key to submit
    messageInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            chatForm.dispatchEvent(new Event('submit'));
        }
    });

    // Initial scroll to bottom
    scrollToBottom();
});
