const ws = new WebSocket('ws://192.168.1.198:4000/'); 

ws.onmessage = function(event) {
    const message = JSON.parse(event.data);
    switch (message.type) {
        case "history":
            message.data.forEach(data => (addMessageToChatBox(data.username, data.content, data.unixTimestamp)));
            break;
        case "message":
            addMessageToChatBox(message.data.username, message.data.content, message.data.unixTimestamp);
            break;
    }
};

document.getElementById('chat-send').addEventListener('click', function() {
    const messageInput = document.getElementById('message-input');
    const message = messageInput.value.trim();

    if (message) {
        ws.send(JSON.stringify({ data: message}));
        messageInput.value = '';
    }
});

document.getElementById('message-input').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        document.getElementById('send-button').click();
    }
});

function addMessageToChatBox(username,message,date) {
    const chatBox = document.getElementById('message-box');
    const messageElement = document.createElement('div');
    const chatElement = document.createElement('div');
    const dateElement = document.createElement('div');
    chatElement.classList.add('chat');
    dateElement.classList.add('date');
    messageElement.classList.add('message');
    chatElement.innerHTML = `<strong>${username} </strong> ${message}`;
    console.log(date);
    date = formatUnixTimestamp(date);
    dateElement.innerHTML = `${date.year}-${date.month}-${date.day} ${date.hour}:${date.minute}:${date.second}`;
    messageElement.appendChild(chatElement);
    messageElement.appendChild(dateElement);
    chatBox.appendChild(messageElement);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function formatUnixTimestamp(unixTimestamp) {
    const date = new Date(unixTimestamp * 1000); // Convert to milliseconds

    const yy = String(date.getFullYear()).slice(-2); // Get last 2 digits of year
    const mm = String(date.getMonth() + 1).padStart(2, '0'); // Month (0-11) + 1
    const dd = String(date.getDate()).padStart(2, '0'); // Day
    const hh = String(date.getHours()).padStart(2, '0'); // Hours
    const mi = String(date.getMinutes()).padStart(2, '0'); // Minutes
    const ss = String(date.getSeconds()).padStart(2, '0'); // Seconds

    return {year: yy, month: mm, day: dd, hour: hh, minute: mi, second: ss};
}