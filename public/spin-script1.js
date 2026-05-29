let isSpinning = false;
let currentRotation = 0;
let totalSegments = 20;
let degreesPerSegment = 360 / totalSegments; // ၁၈ ဒီဂရီစီ

// ဆုမဲအမျိုးအစားအလိုက် ပုံထဲက မူရင်းအိုင်ကွန်များ သတ်မှတ်ခြင်း
const prizeIcons = {
    "Diamond": "💎",
    "Gold": "🥇",
    "Silver": "🥈",
    "Bronze": "🥉",
    "default": "🎁"
};

// ======================================================================
// INITIALIZE & REFRESH PROTECTION
// ======================================================================
document.addEventListener("DOMContentLoaded", () => {
    const loginUser = JSON.parse(localStorage.getItem("user")) || null;
    if (!loginUser) return;

    // 🎯 စာမျက်နှာစဖွင့်တာနဲ့ အကွက် ၂၀ ဒေတာကို ဘီးပေါ်တင်မည်
    setupWheelSegments();

    const currentSession = localStorage.getItem("sessionName");
    const prizeSession = localStorage.getItem("pendingPrizeSession");
    const pendingPrize = localStorage.getItem("pendingPrizeName");

    if (pendingPrize) {
        showCustomPopup(pendingPrize);
    }
    else if (pendingPrize && currentSession !== prizeSession) {
        localStorage.removeItem("pendingPrizeName");
    }
});

// 🎯 Database မဲစာရင်းကို ယူပြီး မူရင်းဒီဇိုင်းမပျက် အကွက် ၂၀ သီပေးသည့်စနစ်
async function setupWheelSegments() {
    const wheel = document.getElementById('wheel');
    if (!wheel) return;

    wheel.innerHTML = '<div class="inner-center-pin"></div>';

    try {
        const response = await fetch('/api/prizes');
        const prizes = await response.json();

        for (let i = 1; i <= totalSegments; i++) {
            const tag = document.createElement('div');
            tag.className = 'number-tag';
            tag.style.setProperty('--i', i);

            // Database က prizeid 10 မှ 20 အလိုက် တွဲစစ်သည်
            let matchingPrize = prizes.find(p => p.prizeid === (i + 9));
            let prizeText = `${i}`; // စာသားရှည်ကြီးတွေအစား ပုံထဲကလို နံပါတ်စဥ်ပြမည်
            let currentIcon = prizeIcons["default"];

            if (matchingPrize) {
                tag.setAttribute('data-prizeid', matchingPrize.prizeid);

                // ဆုမဲနာမည်အလိုက် သက်ဆိုင်ရာအိုင်ကွန် ရွေးချယ်ခြင်း
                const name = matchingPrize.prizename;
                if (name.includes("Diamond")) currentIcon = prizeIcons["Diamond"];
                else if (name.includes("Gold")) currentIcon = prizeIcons["Gold"];
                else if (name.includes("Silver")) currentIcon = prizeIcons["Silver"];
                else if (name.includes("Bronze")) currentIcon = prizeIcons["Bronze"];

                // အရေအတွက် ကုန်သွားပါက စာသားပြောင်းမည်
                if (matchingPrize.prizecount <= 0) {
                    prizeText = "ကုန်ပြီ";
                    currentIcon = "❌";
                }
            }

            // မူရင်းပုံစံအတိုင်း အိုင်ကွန်တစ်ခုစီနဲ့ အောက်က နံပါတ်စဥ်လေး ပေါ်လာစေရန်
            tag.innerHTML = `
                <div class="item-content">
                    <span class="icon">${currentIcon}</span>
                    <span class="label">${prizeText}</span>
                </div>
            `;
            wheel.appendChild(tag);
        }
    } catch (error) {
        console.error("Error loading prizes:", error);
        // Backup အနေဖြင့် ပြသပေးထားမည့် ပုံစံ
        for (let i = 1; i <= totalSegments; i++) {
            const tag = document.createElement('div');
            tag.className = 'number-tag';
            tag.style.setProperty('--i', i);
            tag.innerHTML = `
                <div class="item-content">
                    <span class="icon">🎁</span>
                    <span class="label">${i}</span>
                </div>
            `;
            wheel.appendChild(tag);
        }
    }
}

function showCustomPopup(prizeName) {
    document.getElementById("popupPrizeName").innerText = prizeName;
    document.getElementById("prizePopup").classList.add("show");
}

function closePopup() {
    document.getElementById("prizePopup").classList.remove("show");
    localStorage.setItem("need_stamp", "true");
    localStorage.removeItem("pendingPrizeName");
    window.location.href = "home.html";
}

// ======================================================================
// SPIN CORE FUNCTION (လှည့်သည့်စနစ်)
// ======================================================================
function startSpin() {
    if (isSpinning) return;

    const spinBtn = document.getElementById('spinBtn');
    const wheel = document.getElementById('wheel');
    const loginUser = JSON.parse(localStorage.getItem("user")) || {};

    const userId = loginUser.id || loginUser.userid || localStorage.getItem("winner_userid");
    const sessionId = localStorage.getItem("sessionName");

    if (!userId) {
        alert("ကျေးဇူးပြု၍ အရင်ဆုံး Login ဝင်ပေးပါ!");
        window.location.href = "login.html";
        return;
    }

    isSpinning = true;
    spinBtn.disabled = true;

    fetch('/api/spin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userid: userId, sessionid: sessionId })
    })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'error' || data.status === 'empty') {
                alert(data.message);
                isSpinning = false;
                spinBtn.disabled = false;
                return;
            }

            if (data.status === 'success') {
                const targetPrizeId = data.prizeid;
                const wheelSegmentNumber = targetPrizeId - 9; // ဘီးပေါ်က အကွက်နံပါတ်

                // 🎯 အကွက် ၂၀ အတွက် တိကျသော ဒီဂရီတွက်ချက်မှု ပုံသေနည်း
                const targetCenterDegree = (wheelSegmentNumber * degreesPerSegment) - (degreesPerSegment / 2);
                const stopDegree = (360 - targetCenterDegree) % 360;
                const extraRounds = 3600;

                currentRotation += extraRounds + stopDegree - (currentRotation % 360);
                wheel.style.transform = `rotate(${currentRotation}deg)`;

                localStorage.setItem("pendingPrizeName", data.prizename);
                localStorage.setItem("pendingPrizeSession", sessionId);

                setTimeout(() => {
                    isSpinning = false;
                    spinBtn.disabled = false;

                    // 🎯 မဲပေါက်သွားသော အကွက်ကို ချက်ချင်း '❌ ကုန်ပြီ' ပြောင်းလဲပယ်ဖျက်ခြင်း
                    updatePrizeUIOnWheel(targetPrizeId);

                    showCustomPopup(data.prizename);
                }, 5000);
            }
        })
        .catch(error => {
            console.error("Error during spin:", error);
            isSpinning = false;
            spinBtn.disabled = false;
        });
}

function updatePrizeUIOnWheel(prizeId) {
    const tags = document.querySelectorAll('.number-tag');
    tags.forEach(tag => {
        if (tag.getAttribute('data-prizeid') == prizeId) {
            const label = tag.querySelector('.label');
            const icon = tag.querySelector('.icon');
            if (label && icon) {
                label.innerText = "ကုန်ပြီ";
                icon.innerText = "❌";
                tag.style.opacity = '0.3'; // မှိန်ချပစ်ခြင်း
            }
        }
    });
}