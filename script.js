import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, push, onChildAdded, get, child } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

// Tera Firebase Config
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

// Message Send karne ka Function
function sendMessage() {
    const text = messageInput.value.trim();
    const sender = userSelect.value;

    if (text !== '') {
        const now = new Date();
        const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        push(ref(database, 'chats'), {
            sender: sender,
            text: text,
            timestamp: timeString
        });

        messageInput.value = '';
    }
}

sendBtn.addEventListener('click', sendMessage);
messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});

// Real-time Message Receive karne ka Function
onChildAdded(ref(database, 'chats'), (snapshot) => {
    const data = snapshot.val();
    const currentUser = userSelect.value;

    const msgDiv = document.createElement('div');
    msgDiv.classList.add('msg');
    
    if (data.sender === currentUser) {
        msgDiv.classList.add('me');
    } else {
        msgDiv.classList.add('her');
    }

    msgDiv.innerHTML = `${data.text} <span class="time">${data.timestamp}</span>`;
    messagesBox.appendChild(msgDiv);
    messagesBox.scrollTop = messagesBox.scrollHeight;
});

// Selector change hone par chat view update karne ke liye
userSelect.addEventListener('change', () => {
    messagesBox.innerHTML = '';
    get(child(ref(database), 'chats')).then((snapshot) => {
        if (snapshot.exists()) {
            snapshot.forEach((childSnapshot) => {
                const data = childSnapshot.val();
                const currentUser = userSelect.value;

                const msgDiv = document.createElement('div');
                msgDiv.classList.add('msg');
                
                if (data.sender === currentUser) {
                    msgDiv.classList.add('me');
                } else {
                    msgDiv.classList.add('her');
                }

                msgDiv.innerHTML = `${data.text} <span class="time">${data.timestamp}</span>`;
                messagesBox.appendChild(msgDiv);
            });
            messagesBox.scrollTop = messagesBox.scrollHeight;
        }
    });
});
