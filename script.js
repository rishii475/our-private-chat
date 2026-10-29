// --- FIREBASE CONFIGURATION ---
const firebaseConfig = {
    projectId: "ourchatapp-5536f",
    databaseURL: "https://ourchatapp-5536f-default-rtdb.firebaseio.com/"
};

let db = null;
try {
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
    db = firebase.database();
} catch (e) {
    console.error("Firebase Init Error: ", e);
}

const chatContainer = document.getElementById('chatContainer');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const imageInput = document.getElementById('imageInput');
const typingIndicator = document.getElementById('typingIndicator');

// Simple Text Encryption
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

// --- SEND MESSAGE ---
function sendMessage(content, type = 'text') {
    if (!content) return;
    if (!db) {
        alert("Database connected nahi hai!");
        return;
    }

    const finalContent = (type === 'text') ? encryptText(content) : content;

    db.ref('private_chat_room/messages').push({
        content: finalContent,
        type: type,
        timestamp: Date.now()
    }).then(() => {
        if (type === 'text') messageInput.value = "";
        db.ref('private_chat_room/typing').set(false);
    }).catch((error) => {
        alert("Message send nahi ho paya. Rules check karein.");
        console.error(error);
    });
}

if (sendBtn) {
    sendBtn.addEventListener('click', () => sendMessage(messageInput.value, 'text'));
}
if (messageInput) {
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage(messageInput.value, 'text');
    });
}

// --- TYPING INDICATOR ---
if (messageInput && db) {
    messageInput.addEventListener('input', () => {
        db.ref('private_chat_room/typing').set(true);
    });

    let typingTimeout;
    messageInput.addEventListener('keyup', () => {
        clearTimeout(typingTimeout);
        typingTimeout = setTimeout(() => {
            db.ref('private_chat_room/typing').set(false);
        }, 2000);
    });
}

if (db) {
    db.ref('private_chat_room/typing').on('value', (snapshot) => {
        if (typingIndicator) {
            if (snapshot.val() === true) {
                typingIndicator.innerText = "Partner typing...";
            } else {
                typingIndicator.innerText = "";
            }
        }
    });
}

// --- PHOTO SHARING ---
if (imageInput) {
    imageInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(event) {
            sendMessage(event.target.result, 'image');
        };
        reader.readAsDataURL(file);
    });
}

// --- REALTIME MESSAGE LISTENER ---
if (db) {
    db.ref('private_chat_room/messages').on('child_added', (snapshot) => {
        const data = snapshot.val();
        if (!data) return;

        const msgDiv = document.createElement('div');
        msgDiv.className = 'message';

        if (data.type === 'image') {
            msgDiv.innerHTML = `<img src="${data.content}" alt="Image">`;
        } else {
            const textContent = data.content ? decryptText(data.content) : "";
            msgDiv.innerText = textContent;
        }

        if (chatContainer) {
            chatContainer.appendChild(msgDiv);
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }
    });
}

// --- SHARED SECRET DIARY ---
const toggleDiaryBtn = document.getElementById('toggleDiaryBtn');
const chatSection = document.getElementById('chatSection');
const diarySection = document.getElementById('diarySection');
const diaryInput = document.getElementById('diaryInput');
const saveDiaryBtn = document.getElementById('saveDiaryBtn');

let isDiaryOpen = false;
if (toggleDiaryBtn) {
    toggleDiaryBtn.addEventListener('click', () => {
        isDiaryOpen = !isDiaryOpen;
        if (isDiaryOpen) {
            if (chatSection) chatSection.style.display = 'none';
            if (diarySection) diarySection.style.display = 'flex';
            toggleDiaryBtn.innerText = "💬 Chat";
        } else {
            if (chatSection) chatSection.style.display = 'flex';
            if (diarySection) diarySection.style.display = 'none';
            toggleDiaryBtn.innerText = "📖 Diary";
        }
    });
}

if (saveDiaryBtn && db) {
    saveDiaryBtn.addEventListener('click', () => {
        db.ref('private_chat_room/diary').set(diaryInput.value);
        alert("Diary Saved!");
    });
}

if (db) {
    db.ref('private_chat_room/diary').on('value', (snapshot) => {
        if (diaryInput && snapshot.val() !== null) {
            diaryInput.value = snapshot.val();
        }
    });
}

// --- VIDEO CALL (FIXED JITSI CONFIG) ---
let jitsiApi = null;
const startCallBtn = document.getElementById('startCallBtn');
const videoModal = document.getElementById('videoModal');
const endCallBtn = document.getElementById('endCallBtn');

if (startCallBtn) {
    startCallBtn.addEventListener('click', () => {
        if (videoModal) videoModal.style.display = 'flex';
        
        const domain = "meet.jit.si";
        const options = {
            roomName: "OurSecurePrivateRoom12345",
            width: "100%",
            height: "100%",
            parentNode: document.querySelector('#jitsi-container'),
            configOverwrite: {
                startWithAudioMuted: false,
                startWithVideoMuted: false,
                disableModeratorIndicator: true,
                enableWelcomePage: false
            },
            interfaceConfigOverwrite: {
                MOBILE_APP_PROMO: false
            }
        };

        try {
            if (window.JitsiMeetExternalAPI) {
                jitsiApi = new JitsiMeetExternalAPI(domain, options);
            } else {
                alert("Jitsi library load nahi ho payi.");
            }
        } catch (e) {
            alert("Video call load hone me error aayi.");
            console.error(e);
        }
    });
}

if (endCallBtn) {
    endCallBtn.addEventListener('click', () => {
        if (jitsiApi) {
            jitsiApi.dispose();
        }
        if (videoModal) videoModal.style.display = 'none';
    });
        }
