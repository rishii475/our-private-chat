// --- 1. FIREBASE CONFIGURATION ---
// Yahan apna asli Firebase Realtime Database URL daal lena!
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

// --- 2. SEND MESSAGE FUNCTION ---
function sendMessage() {
    const text = messageInput.value.trim();
    if (!text) return;

    db.ref('messages/').push({
        text: text,
        timestamp: Date.now()
    }).then(() => {
        messageInput.value = "";
    }).catch((error) => {
        alert("Message Send Error! Database URL check karein.");
        console.error(error);
    });
}

sendBtn.addEventListener('click', sendMessage);
messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

// --- 3. REALTIME MESSAGE LISTENER ---
db.ref('messages/').on('child_added', (snapshot) => {
    const data = snapshot.val();
    const msgDiv = document.createElement('div');
    msgDiv.className = 'message';
    msgDiv.innerText = data.text;
    chatContainer.appendChild(msgDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
});

// --- 4. VIDEO CALL LOGIC (JITSI MEET) ---
let jitsiApi = null;
const startCallBtn = document.getElementById('startCallBtn');
const videoModal = document.getElementById('videoModal');
const endCallBtn = document.getElementById('endCallBtn');

startCallBtn.addEventListener('click', () => {
    videoModal.style.display = 'flex';

    const domain = "meet.jit.si";
    const options = {
        roomName: "SecretPrivatePartnerRoom_998877", // Dono ke liye room name bilkul same hona chahiye
        width: "100%",
        height: "100%",
        parentNode: document.querySelector('#jitsi-container'),
        userInfo: {
            displayName: "Private Partner"
        },
        configOverwrite: {
            startWithAudioMuted: false,
            startWithVideoMuted: false
        },
        interfaceConfigOverwrite: {
            MOBILE_APP_PROMO: false
        }
    };

    try {
        jitsiApi = new JitsiMeetExternalAPI(domain, options);
    } catch (e) {
        alert("Video call load hone me error aayi. Internet connection check karein.");
        console.error(e);
    }
});

endCallBtn.addEventListener('click', () => {
    if (jitsiApi) {
        jitsiApi.dispose();
    }
    videoModal.style.display = 'none';
});
    
