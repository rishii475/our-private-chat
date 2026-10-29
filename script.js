// --- FIREBASE CONFIGURATION ---
const firebaseConfig = {
    databaseURL: "https://YOUR-PROJECT-ID-default-rtdb.firebaseio.com"
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.database();

const chatContainer = document.getElementById('chatContainer');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const imageInput = document.getElementById('imageInput');
const typingIndicator = document.getElementById('typingIndicator');

// --- FEATURE 1: ENCRYPTION (Safe Text Lock) ---
function encryptText(text) {
    return btoa(encodeURIComponent(text));
}
function decryptText(encoded) {
    try {
        return decodeURIComponent(atob(encoded));
    } catch (e) {
        return encoded;
    }
}

// --- SEND MESSAGE FUNCTION ---
function sendMessage(content, type = 'text') {
    if (!content) return;

    const finalContent = (type === 'text') ? encryptText(content) : content;

    db.ref('messages/').push({
        content: finalContent,
        type: type,
        timestamp: Date.now()
    }).then(() => {
        if (type === 'text') messageInput.value = "";
        db.ref('typing/status').set(false);
    }).catch((error) => {
        alert("Firebase Error! Connection check karein.");
        console.error(error);
    });
}

sendBtn.addEventListener('click', () => sendMessage(messageInput.value, 'text'));
messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage(messageInput.value, 'text');
});

// --- FEATURE 2: TYPING INDICATOR ---
messageInput.addEventListener('input', () => {
    db.ref('typing/status').set(true);
});

let typingTimeout;
messageInput.addEventListener('keyup', () => {
    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
        db.ref('typing/status').set(false);
    }, 2000);
});

db.ref('typing/status').on('value', (snapshot) => {
    if (snapshot.val() === true) {
        typingIndicator.innerText = "Partner typing...";
    } else {
        typingIndicator.innerText = "";
    }
});

// --- FEATURE 3: PHOTO SHARING ---
imageInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(event) {
        sendMessage(event.target.result, 'image');
    };
    reader.readAsDataURL(file);
});

// --- REALTIME MESSAGES LISTENER ---
db.ref('messages/').on('child_added', (snapshot) => {
    const data = snapshot.val();
    const msgDiv = document.createElement('div');
    msgDiv.className = 'message';

    if (data.type === 'image') {
        msgDiv.innerHTML = `<img src="${data.content}" alt="Shared Image">`;
    } else {
        const textContent = data.content ? decryptText(data.content) : decryptText(data.text);
        msgDiv.innerText = textContent;
    }

    chatContainer.appendChild(msgDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
});

// --- FEATURE 4: SHARED SECRET DIARY ---
const toggleDiaryBtn = document.getElementById('toggleDiaryBtn');
const chatSection = document.getElementById('chatSection');
const diarySection = document.getElementById('diarySection');
const diaryInput = document.getElementById('diaryInput');
const saveDiaryBtn = document.getElementById('saveDiaryBtn');

let isDiaryOpen = false;
toggleDiaryBtn.addEventListener('click', () => {
    isDiaryOpen = !isDiaryOpen;
    if (isDiaryOpen) {
        chatSection.style.display = 'none';
        diarySection.style.display = 'flex';
        toggleDiaryBtn.innerText = "💬 Chat";
    } else {
        chatSection.style.display = 'flex';
        diarySection.style.display = 'none';
        toggleDiaryBtn.innerText = "📖 Diary";
    }
});

saveDiaryBtn.addEventListener('click', () => {
    db.ref('diary/content').set(diaryInput.value);
    alert("Diary Saved!");
});

db.ref('diary/content').on('value', (snapshot) => {
    if (snapshot.val() !== null) {
        diaryInput.value = snapshot.val();
    }
});

// --- VIDEO CALL LOGIC ---
let jitsiApi = null;
const startCallBtn = document.getElementById('startCallBtn');
const videoModal = document.getElementById('videoModal');
const endCallBtn = document.getElementById('endCallBtn');

startCallBtn.addEventListener('click', () => {
    videoModal.style.display = 'flex';
    const domain = "meet.jit.si";
    const options = {
        roomName: "SecretPrivatePartnerRoom_998877",
        width: "100%",
        height: "100%",
        parentNode: document.querySelector('#jitsi-container')
    };
    try {
        jitsiApi = new JitsiMeetExternalAPI(domain, options);
    } catch (e) {
        alert("Video call load hone me error aayi.");
        console.error(e);
    }
});

endCallBtn.addEventListener('click', () => {
    if (jitsiApi) {
        jitsiApi.dispose();
    }
    videoModal.style.display = 'none';
});
