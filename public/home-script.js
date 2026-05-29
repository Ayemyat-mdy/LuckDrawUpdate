// ၁။ လက်ရှိ login ဝင်ထားတဲ့ session_id ပေါ်မူတည်ပြီး LocalStorage Key ကို ခွဲထုတ်ပေးတဲ့ Function
function getAccountKey(baseKey) {
    // အကယ်၍ user Object ထဲမှာ ဆောက်ထားရင် အကောင့်မရောအောင် user phone သို့မဟုတ် username ကို ယူသုံးမယ်
    const storedUser = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
    const sessionId = storedUser ? (storedUser.userph || storedUser.username) : (localStorage.getItem('session_id') || 'guest');
    return `${sessionId}_${baseKey}`;
}

document.addEventListener('DOMContentLoaded', () => {
    const menuTrigger = document.getElementById('menu-trigger');
    const dropdownMenu = document.getElementById('dropdown-menu');
    const loginLink = document.getElementById('login-link');

    if (menuTrigger && dropdownMenu) {
        menuTrigger.addEventListener('click', (event) => {
            event.preventDefault();
            dropdownMenu.classList.toggle('show');
        });

        document.addEventListener('click', (event) => {
            if (!menuTrigger.contains(event.target) && !dropdownMenu.contains(event.target)) {
                dropdownMenu.classList.remove('show');
            }
        });
    }
});

// Map Nodes Setup
const nodes = [
    { cx: 60, cy: 40 }, { cx: 200, cy: 40 }, { cx: 340, cy: 40 },
    { cx: 260, cy: 120 }, { cx: 200, cy: 200 }, { cx: 340, cy: 200 },
    { cx: 260, cy: 280 }, { cx: 100, cy: 280 }, { cx: 160, cy: 360 },
    { cx: 340, cy: 360 }, { cx: 300, cy: 440 }, { cx: 220, cy: 440 }
];

// 🎯 [ပြင်ဆင်ချက်] ဒုတိယအကြိမ် ထပ်ကြေညာမိတဲ့ Error ကို ရှင်းပြီး အကောင့်အလိုက် တန်းဖတ်ခိုင်းလိုက်သည်
const savedIndexStr = localStorage.getItem(getAccountKey('saved_current_index'));
let currentIndex = savedIndexStr ? parseInt(savedIndexStr) : 0;

const playerGroup = document.getElementById('player-group');
const playerChar = document.getElementById('player-char');
const playerIcon = document.getElementById('player-icon');
const clipCircle = document.getElementById('clip-inner-circle');
const playerInputBox = document.getElementById('player-input-box');
const inputField = document.querySelector('.char-top-input');
const submitBtn = document.querySelector('.input-submit-btn');
const goBtn = document.querySelector('.go-btn');
const playerClickTarget = document.getElementById('player-click-target');

function initGame() {
    // 🎯 [GO BUTTON LOGIC ပြင်ဆင်ချက်] Stamp Code မှန်ထားသူ (Index > 0) ဖြစ်လျှင် GO ခလုတ်ကို အမြဲတမ်း ဖွင့်ပေးထားမည်
    if (goBtn) {
        if (currentIndex > 10) {
            goBtn.disabled = false;
            goBtn.style.opacity = "1"; // လင်းစေမည်
        } else {
            goBtn.disabled = true;
            goBtn.style.opacity = "0.5"; // မှိန်ထားမည်
        }
    }

    // icon အရောင်ခြယ်ခြင်း Logic
    document.querySelectorAll('.map-node').forEach(node => {
        const nodeIndex = parseInt(node.getAttribute('data-index'));
        if (nodeIndex > 0 && nodeIndex < currentIndex) {
            node.classList.add('stamp-success');
        } else {
            node.classList.remove('stamp-success');
        }
    });

    // လက်ရှိ index ရှိတဲ့ နေရာကို Character ရွှေ့ပေးမယ်
    if (nodes[currentIndex]) {
        movePlayerComponents(nodes[currentIndex].cx, nodes[currentIndex].cy);
    }
}



function movePlayerComponents(cx, cy) {
    if (playerChar) playerChar.setAttribute('cx', cx);
    if (clipCircle) clipCircle.setAttribute('cx', cx);
    if (clipCircle) clipCircle.setAttribute('cy', cy);
    if (playerChar) playerChar.setAttribute('cy', cy);

    if (playerIcon) {
        playerIcon.setAttribute('x', cx - 21);
        playerIcon.setAttribute('y', cy - 26);
    }

    if (playerGroup) {
        playerGroup.style.setProperty('--char-origin-x', `${cx}px`);
        playerGroup.style.setProperty('--char-origin-y', `${cy}px`);
        playerGroup.classList.add('pulse-character');
    }

    if (playerInputBox) {
        playerInputBox.setAttribute('x', cx - 80);
        playerInputBox.setAttribute('y', cy - 65);
    }
}

// ကြောင်ရုပ်ကို နှိပ်လျှင် လုပ်ဆောင်မည့် လော့ဂျစ်
if (playerClickTarget) {
    playerClickTarget.addEventListener('click', (e) => {
        e.stopPropagation();

        // Start နေရာ (Index 0) မှာ ရှိနေရင် စာရိုက်စရာမလိုဘဲ အကောင့်အလိုက် သိမ်းပြီး နောက်စက်ဝိုင်းသို့ သွားမည်
        if (currentIndex === 0) {
            currentIndex++;
            localStorage.setItem(getAccountKey('saved_current_index'), currentIndex);
            initGame();
            return;
        }

        if (currentIndex === nodes.length - 1) {
            alert("🎉 ဂိမ်းလမ်းကြောင်း ပြီးဆုံးပါပြီ။ အောက်က 'GO' ခလုတ်ကို နှိပ်ပြီး ဆက်လက်ကစားနိုင်ပါပြီ။");
            return;
        }

        if (playerGroup) playerGroup.classList.add('show-input');
        if (inputField) setTimeout(() => inputField.focus(), 50);
    });
}

async function checkInputAndAdvance() {
    if (!inputField) return;
    const userInput = inputField.value.trim();

    if (!userInput) {
        alert("⚠️ ကျေးဇူးပြု၍ Code ရိုက်ထည့်ပါ!");
        return;
    }

    const storedUser = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
    const userPhone = storedUser ? storedUser.userph : localStorage.getItem('userph');

    if (!userPhone) {
        alert("⚠️ အသုံးပြုသူအချက်အလက် မရှိပါ။ ကျေးဇူးပြု၍ အကောင့်ပြန်ဝင်ပါ။");
        return;
    }

    try {
        const response = await fetch('http://192.168.21.168:3000/api/verify-stampcode', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                stampCode: userInput,
                userph: userPhone
            })
        });
        const data = await response.json();

        if (response.ok && data.success) {
            if (playerGroup) playerGroup.classList.remove('show-input');
            inputField.value = '';

            const currentCircle = document.querySelector(`.map-node[data-index="${currentIndex}"]`);
            if (currentCircle) {
                currentCircle.classList.add('stamp-success');
            }

            if (currentIndex < nodes.length - 1) {
                currentIndex++;
                // 🎯 [ပြင်ဆင်ချက်] အကောင့်တစ်ခုချင်းစီအလိုက် ခွဲခြားပြီး LocalStorage ထဲ သိမ်းဆည်းရန် ပြောင်းလဲလိုက်သည်
                localStorage.setItem(getAccountKey('saved_current_index'), currentIndex);
                initGame();
            } else {
                localStorage.setItem("play_authorized", "true");
                initGame();
            }
        } else {
            alert(`❌ ${data.message || "စာသားမမှန်ကန်ပါ။ ထပ်မံ ကြိုးစားကြည့်ပါ!"}`);
            setTimeout(() => inputField.focus(), 50);
        }

    } catch (error) {
        console.error("Error verifying code:", error);
        alert("🌐 Server ချိတ်ဆက်မှု အခက်အခဲရှိနေပါသည်။ ခဏနေမှ ပြန်ကြိုးစားပါ။");
    }
}

if (submitBtn) {
    submitBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        checkInputAndAdvance();
    });
}

if (inputField) {
    inputField.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            checkInputAndAdvance();
        }
    });
}

// 🚀 [GO BUTTON LOGIC]
/*if (goBtn) {
    goBtn.addEventListener('click', (e) => {
        e.stopImmediatePropagation();
        e.preventDefault();

        if (currentIndex > 0) {
            localStorage.setItem("play_authorized", "true");
            window.location.href = "play.html";
        } else {
            alert("⚠️ ကျေးဇူးပြု၍ Stamp Code ကို အရင်ရိုက်ထည့်ပေးပါ။");
        }
    });
}*/
// 🚀 [GO BUTTON LOGIC]
if (goBtn) {
    goBtn.addEventListener('click', async (e) => {
        e.stopImmediatePropagation();
        e.preventDefault();

        if (currentIndex > 0) {
            // ၁။ မျက်နှာပြင်ပေါ်က Session Name (ဥပမာ: SECTION 3) ကို ယူမယ်
            const sessionTitleEl = document.getElementById("displaySessionTitle");
            const sessionName = sessionTitleEl ? sessionTitleEl.textContent.trim() : "SECTION 3";

            // ၂။ Login ဝင်စဉ်က မှတ်ထားခဲ့တဲ့ userid ကို ပြန်ထုတ်ယူမယ်
            const userId = localStorage.getItem("userid");

            if (!userId) {
                alert("⚠️ User ID မတွေ့ရှိပါ။ ကျေးဇူးပြု၍ ပြန်လည် Login ဝင်ပေးပါ။");
                return;
            }

            try {
                // =========================================================================
                // 🎯 [STEP 1] ကစားသမား ယခု Session တွင် ဆော့ပြီးသားလား အရင်စစ်ဆေးခြင်း
                // =========================================================================
                const checkResponse = await fetch(`/api/check-player-played?userid=${userId}&session_name=${sessionName}`);
                const checkResult = await checkResponse.json();

                if (checkResult.success && checkResult.hasPlayed) {
                    // 🚨 [အရေးကြီးဆုံး ပြင်ဆင်ချက်] ဆော့ပြီးသားပွဲဖြစ်လို့ တားဆီးမယ်။
                    alert(`🚨 သင်သည် ယခုပွဲစဉ် (${sessionName}) တွင် ပါဝင်ကစားပြီး ဖြစ်ပါသဖြင့် ထပ်မံကစားခွင့်မရှိပါ။ \n\n💡 သင်၏ Stamp Code ကို မဆုံးရှုံးစေရန် ထိန်းသိမ်းပေးထားပါသည်။ အခြား Session ပွဲစဉ်အသစ်များတွင် ပြန်လည်အသုံးပြုနိုင်ပါသည်။`);

                    // ⚠️ ဒီနေရာမှာ 'currentIndex' ကို 0 ပြန်မလုပ်ပါဘူး။ 
                    // မျက်နှာပြင်ပေါ်က စာရိုက်တဲ့ input box တွေကိုလည်း မရှင်းပစ်ပါဘူး။
                    // return သက်သက်ပဲ လုပ်ပြီး ထွက်လိုက်တာမို့ Player ရဲ့ လက်ရှိ Stamp အခြေအနေက Home မှာ ပုံမှန်အတိုင်း ကျန်နေပါလိမ့်မယ်။
                    return;
                }
                // =========================================================================

                // ၃။ ယခုပွဲကို မဆော့ရသေးပါက ပုံမှန်အတိုင်း Stamp ကို အသုံးပြုပြီး ဒေတာဘေ့စ်တွင် သိမ်းမည်
                const response = await fetch('/api/update-session', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        userId: userId,
                        sessionName: sessionName
                    })
                });

                const result = await response.json();

                if (result.success) {
                    // ၄။ Database ထဲမှာ အောင်မြင်စွာ သိမ်းဆည်းပြီးမှ play.html သို့ သွားမယ်
                    localStorage.setItem("play_authorized", "true");
                    window.location.href = "play.html";
                } else {
                    alert("⚠️ Error: " + result.message);
                }

            } catch (error) {
                console.error("Network Error:", error);
                alert("⚠️ Node.js Server နှင့် ချိတ်ဆက်မှု မအောင်မြင်ပါ။");
            }

        } else {
            alert("⚠️ ကျေးဇူးပြု၍ Stamp Code ကို အရင်ရိုက်ထည့်ပေးပါ။");
        }
    });
}

// LOGIN STATUS UPDATE FUNCTION
function updateLoginStatus(username) {
    const loginLink = document.getElementById('login-link');
    if (!loginLink) return;

    if (username) {
        loginLink.innerHTML = `<i class="fa-solid fa-user" style="margin-right: 5px;"></i><span id="nav-username">${username}</span>`;
        loginLink.setAttribute('href', 'profile.html');
        loginLink.onclick = null;
    } else {
        loginLink.innerHTML = `<i class="fa-solid fa-user" style="margin-right: 5px;"></i><span id="nav-username">Login</span>`;
        loginLink.setAttribute('href', 'login.html');
        loginLink.onclick = function () {
            window.location.href = "login.html";
        };
    }
}

// PROFILE & SESSION HANDLING
document.addEventListener('DOMContentLoaded', () => {
    initGame();

    const userDataString = localStorage.getItem('user');
    let finalUsername = localStorage.getItem('username');

    if (userDataString) {
        try {
            const userData = JSON.parse(userDataString);
            if (userData && userData.username) {
                finalUsername = userData.username;
            }
        } catch (e) {
            console.error("Error parsing user storage", e);
        }
    }

    if (finalUsername) {
        updateLoginStatus(finalUsername);
        const nameText = document.getElementById("nav-username");
        if (nameText) {
            nameText.textContent = finalUsername;
        }
    } else {
        updateLoginStatus(null);
    }

    const profileMenuBtn = document.getElementById("profile-menu-item");
    if (profileMenuBtn) {
        profileMenuBtn.addEventListener("click", function (e) {
            e.preventDefault();
            const checkUserData = localStorage.getItem('user');
            const checkUserPh = localStorage.getItem('userph');

            if (checkUserData || checkUserPh) {
                window.location.href = "profile.html";
            } else {
                alert("ကျေးဇူးပြု၍ အရင် Login ဝင်ပေးပါရန်။");
                window.location.href = 'login.html';
            }
        });
    }
});

// Timer Setup
function updateTimer() {
    const timerElement = document.getElementById('timer');
    if (!timerElement) return;

    const now = new Date();
    const sessions = [
        { h: 11, m: 0 },
        { h: 14, m: 0 },
        { h: 17, m: 0 }
    ];

    let target = new Date();
    let found = false;

    for (let session of sessions) {
        target.setHours(session.h, session.m, 0, 0);
        if (target > now) {
            found = true;
            break;
        }
    }

    if (!found) {
        timerElement.innerText = "00:00:00";
        return;
    }

    const diff = target - now;
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);

    timerElement.innerText =
        `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

// Window Load Event 
window.addEventListener('DOMContentLoaded', () => {
    setInterval(updateTimer, 1000);
    updateTimer();

    // 🎯 [ပြင်ဆင်ချက်] အကောင့်အလိုက် Key ပြောင်းလဲဖတ်နိုင်ရန်အတွက် အပေါ်ဆုံးက Function အတိုင်း စနစ်တကျ ပြောင်းလဲဖတ်ခိုင်းသည်
    let savedIndexStr = localStorage.getItem(getAccountKey('saved_current_index'));

    if (savedIndexStr === '0') {
        localStorage.removeItem('session_id');
        localStorage.removeItem('stamp_code');

        const inputSection = document.getElementById('session-input-section');
        const mainGameSection = document.getElementById('main-game-section');

        if (inputSection) inputSection.style.display = 'block';
        if (mainGameSection) mainGameSection.style.display = 'none';

        const sessionBox = document.getElementById('session-input-box');
        if (sessionBox) {
            sessionBox.value = '';
        }
    }
});

window.addEventListener('DOMContentLoaded', () => {
    // နိုင်ပြီးသားဖြစ်ရင် Stamp Code ရိုက်ခိုင်းတဲ့ Box ကို ပြပါ
    if (localStorage.getItem("need_stamp") === "true") {
        alert("နောက်တစ်ပွဲကစားရန် Stamp Code ရိုက်ထည့်ပါ!");
        // Stamp Code input section ကို show လုပ်ပေးပါ
        document.getElementById('player-group').classList.add('show-input');
    }
});