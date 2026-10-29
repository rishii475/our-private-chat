// --- 1. FIREBASE CONFIGURATION ---
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

if (sendBtn) {
    sendBtn.addEventListener('click', sendMessage);
}

if (messageInput) {
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
}

// --- 3. REALTIME MESSAGE LISTENER ---
db.ref('messages/').on('child_added', (snapshot) => {
    const data = snapshot.val();
    if (data && data.text && chatContainer) {
        const msgDiv = document.createElement('div');
        msgDiv.className = 'message';
        msgDiv.innerText = data.text;
        chatContainer.appendChild(msgDiv);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }
});

// --- 4. VIDEO CALL LOGIC (Using meet.ffmuc.net) ---
let jitsiApi = null;
const startCallBtn = document.getElementById('startCallBtn');
const videoModal = document.getElementById('videoModal');
const endCallBtn = document.getElementById('endCallBtn');

if (startCallBtn) {
    startCallBtn.addEventListener('click', () => {
        if (videoModal) {
            videoModal.style.display = 'flex';
        }

        const domain = "meet.ffmuc.net";
        const options = {
            roomName: "SecretPrivatePartnerRoom_998877",
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
            if (typeof JitsiMeetExternalAPI !== 'undefined') {
                jitsiApi = new JitsiMeetExternalAPI(domain, options);
            } else {
                alert("Jitsi library load nahi ho paayi. Internet connection check karein.");
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
            jitsiApi = null;
        }
        if (videoModal) {
            videoModal.style.display = 'none';
        }
    });
              }
