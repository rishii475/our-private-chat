import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, push, onChildAdded, onChildRemoved, remove, get, child } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyA2XtoNORv4fpPvDxNjQOpzreSiSdMI40M",
  authDomain: "ourchatapp-5536f.firebaseapp.com",
  databaseURL: "https://ourchatapp-5536f-default-rtdb.firebaseio.com",
  projectId: "ourchatapp-5536f",
  storageBucket: "ourchatapp-5536f.firebasestorage.app",
  messagingSenderId: "987833778802",
  appId: "1:987833778802:web:8abaa462fb6b96eef3b8eb"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app, "https://ourchatapp-5536f-default-rtdb.firebaseio.com");

const messageInput = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');
const messagesBox = document.getElementById('messages-box');
const userSelect = document.getElementById('user-select');
const replyPreview = document.getElementById('reply-preview');
const replyingToText = document.getElementById('replying-to-text');
const cancelReplyBtn = document.getElementById('cancel-reply');

let replyingTo = null; // Store message info being replied to

// Message Send karne ka Function
function sendMessage() {
    const text = messageInput.value.trim();
    const sender = userSelect.value;

    if (text !== '') {
        const now = new Date();
        const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        const messageData = {
            sender: sender,
            text: text,
            timestamp: timeString,
            replyTo: replyingTo ? replyingTo : null
        };

        push(ref(database, 'chats'), messageData);

        messageInput.value = '';
        cancelReply();
    }
}

sendBtn.addEventListener('click', sendMessage);
messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});

cancelReplyBtn.addEventListener('click', cancelReply);

function cancelReply() {
    replyingTo = null;
    replyPreview.style.display = 'none';
}

// Function to render a single message in DOM
function appendMessage(snapshot) {
    const data = snapshot.val();
    const messageKey = snapshot.key;
    const currentUser = userSelect.value;

    const msgDiv = document.createElement('div');
    msgDiv.classList.add('msg');
    msgDiv.setAttribute('data-id', messageKey);
    
    if (data.sender === currentUser) {
        msgDiv.classList.add('me');
    } else {
        msgDiv.classList.add('her');
    }

    let replyHtml = '';
    if (data.replyTo) {
        replyHtml = `<div class="replied-box"><strong>${data.replyTo.sender}:</strong> ${data.replyTo.text}</div>`;
    }

    msgDiv.innerHTML = `
        ${replyHtml}
        <span class="msg-text">${data.text}</span>
        <div class="msg-footer">
            <button class="unsend-btn" onclick="unsendMsg('${messageKey}')">Unsend</button>
            <span class="time">${data.timestamp}</span>
        </div>
    `;

    // Click to Reply feature
    msgDiv.addEventListener('click', (e) => {
        if(e.target.classList.contains('unsend-btn')) return; // Don't trigger reply on unsend click
        replyingTo = { sender: data.sender, text: data.text };
        replyingToText.innerText = `Replying to ${data.sender}: ${data.text}`;
        replyPreview.style.display = 'flex';
        messageInput.focus();
    });

    messagesBox.appendChild(msgDiv);
    messagesBox.scrollTop = messagesBox.scrollHeight;
}

// Global function for Unsend
window.unsendMsg = function(key) {
    remove(ref(database, 'chats/' + key));
};

// Real-time Message Receive
onChildAdded(ref(database, 'chats'), (snapshot) => {
    appendMessage(snapshot);
});

// Real-time Message Remove (Unsend for both sides)
onChildRemoved(ref(database, 'chats'), (snapshot) => {
    const deletedKey = snapshot.key;
    const element = document.querySelector(`[data-id='${deletedKey}']`);
    if (element) {
        element.remove();
    }
});

// Selector change hone par chat view update karne ke liye
userSelect.addEventListener('change', () => {
    messagesBox.innerHTML = '';
    get(child(ref(database), 'chats')).then((snapshot) => {
        if (snapshot.exists()) {
            snapshot.forEach((childSnapshot) => {
                appendMessage(childSnapshot);
            });
        }
    });
});
