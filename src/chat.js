const ws = new WebSocket('ws://192.168.1.198:4000/'); 

ws.onmessage = function(event) {
    const message = JSON.parse(event.data);
    switch (message.type) {
        case "history":
            message.data.forEach(data => (addMessageToChatBox(data.username, data.content)));
            break;
        case "message":
            addMessageToChatBox(message.data.username, message.data.content);
            break;
    }
};

document.getElementById('chat-send').addEventListener('click', function() {
    const messageInput = document.getElementById('message-input');
    const message = messageInput.value.trim();
    if (message) {
        ws.send(JSON.stringify({ data: message }));
        messageInput.value = '';
    }
});

document.getElementById('message-input').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        document.getElementById('send-button').click();
    }
});

function addMessageToChatBox(username,message) {
    const chatBox = document.getElementById('message-box');
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    messageElement.innerHTML = `<strong>${username}:</strong> ${message}`;
    chatBox.appendChild(messageElement);
    chatBox.scrollTop = chatBox.scrollHeight;
}