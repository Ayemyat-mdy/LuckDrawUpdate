let isSpinning = false;
let currentRotation = 0;

// LocalStorage ထဲမှာ သိမ်းထားမည့် ပေါက်ပြီးသား ဆုဟောင်း ID စာရင်း (အကွက်မှိန်ရန်အတွက်)
let claimedPrizes = JSON.parse(localStorage.getItem("claimedPrizes")) || [];

// ======================================================================
// REFRESH PROTECTION LOGIC
// ======================================================================
document.addEventListener("DOMContentLoaded", () => {
    // ဘီးပေါ်မှာ ပေါက်ပြီးသားဆုတွေရှိရင် ❌ Sold Out အဖြစ် ကြိုတင် Update ပြုလုပ်ရန်
    setupWheelPrizes();

    // 💡 လက်ရှိ Login ဝင်ထားတဲ့ Session Name ကို ယူမယ်
    const currentSession = localStorage.getItem("sessionName");
    // ဆုပေါက်စဉ်က ဘယ် Session လဲဆိုတာကို မှတ်ထားဖို့ Key အသစ်တစ်ခုနဲ့ တွဲစစ်ပါမယ်
    const prizeSession = localStorage.getItem("pendingPrizeSession");
    const pendingPrize = localStorage.getItem("pendingPrizeName");

    if (pendingPrize && currentSession === prizeSession) {
        // အကယ်၍ အရင်က ပေါက်ထားတာရှိပြီး OK မနှိပ်ရသေးဘဲ Refresh ဖြစ်သွားပါက Popup ကို ပြန်ဖွင့်ပေးမည်
        showCustomPopup(pendingPrize);
    }
    else if (pendingPrize && currentSession !== prizeSession) {
        // အကယ်၍ Session မတူတော့ရင် ဆုဟောင်းကြီး ဖြစ်နေလို့ ဖျက်ထုတ်ပစ်မယ်
        localStorage.removeItem("pendingPrizeName");
        localStorage.removeItem("pendingPrizeSession");
    }
});

// ပေါက်သွားသော အကွက်များကို ဘီးပေါ်တွင် ❌ Sold Out ပြောင်းလဲ၍ မှိန်ပစ်ခြင်း လုပ်ဆောင်ချက်
function setupWheelPrizes() {
    claimedPrizes.forEach(prizeId => {
        const tag = document.querySelector(`.number-tag[data-id="${prizeId}"]`);
        if (tag) {
            tag.classList.add("removed-prize");
            const contentDiv = tag.querySelector('.prize-content');
            if (contentDiv) {
                contentDiv.innerText = "❌ Sold Out"; // တစောင်းအတိုင်း ကွက်တိပြောင်းပေးမည်
            }
        }
    });
}

// Popup ကို လှမ်းပြမည့် Function
function showCustomPopup(prizeName) {
    document.getElementById("popupPrizeName").innerText = prizeName;
    document.getElementById("prizePopup").classList.add("show");
}

// OK နှိပ်ပြီး Popup ပိတ်မည့် Function
function closePopup() {
    document.getElementById("prizePopup").classList.remove("show");

    // ၁။ နိုင်ပြီးကြောင်းမှတ်သားခြင်း
    localStorage.setItem("need_stamp", "true");

    // 💡 ပေါက်ပြီးသား ဆုဟောင်းဒေတာကို စက်ထဲက အပြီးဖျက်ထုတ်ပစ်ရန်
    localStorage.removeItem("pendingPrizeName");
    localStorage.removeItem("pendingPrizeSession");

    // ၂။ Login ပြန်ဝင်ခိုင်းမယ့်အစား Home သို့ ပြန်ပို့ခြင်း
    window.location.href = "home.html";
}

// 💡 ကစားသမား အဟောင်းဒေတာများကို ဖျက်ပြီး Login သို့ ပို့ပေးမည့် Function
function clearUserDataAndRedirect() {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = "login.html";
}

// ======================================================================
// 🎯 START SPIN FUNCTION (FINAL PRODUCTION READY)
// ======================================================================
function startSpin() {
    if (isSpinning) return;

    const spinBtn = document.getElementById('spinBtn');
    const wheel = document.getElementById('wheel');

    // 💡 [TESTING MODE] Login ပိတ်ထားစဉ် စမ်းသပ်ရန် Mock Data များ
    const userId = localStorage.getItem("winner_userid") || "test_player_1";
    const sessionId = localStorage.getItem("sessionName") || "session_real_world";

    isSpinning = true;
    spinBtn.disabled = true;

    // 🌐 Node.js API Server (Port 3000) သို့ စနစ်တကျ လှမ်းခေါ်ခြင်း
    fetch('/api/spin', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            userid: userId,
            sessionid: sessionId,
            randomTicket: localStorage.getItem("randomTicket") || "0",
            rankid: localStorage.getItem("rankid") || null
        })
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP network error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            // ၁။ ဆာဗာဘက်မှ အယ်ရာပြန်ပို့လာလျှင်
            if (data.status === 'error') {
                alert("ဆာဗာအမှား: " + data.message);
                isSpinning = false;
                spinBtn.disabled = false;
                return;
            }

            // ၂။ ဆုမဲများ အကုန်လုံး ကုန်သွားလျှင်
            if (data.status === 'empty') {
                alert(data.message);
                spinBtn.innerText = "ကုန်ပါပြီ";
                isSpinning = false;
                return;
            }

            // ၃။ အောင်မြင်စွာ ဒေတာကျလာလျှင် ဘီးစတင်လည်မည်
            if (data.status === 'success') {
                const targetPrizeId = Number(data.prizeid); // ဆာဗာမှပေးသော ID (၁ မှ ၂၀)

                // 🎯 [MATH FIX FOR ID 10-20]: Database ID ကို ဘီးပေါ်က အကွက်နံပါတ် (1 မှ 20) ဖြစ်အောင် 9 နှုတ်ပေးရပါမည်။
                //const wheelSegmentNumber = targetPrizeId - 9; // ဥပမာ - ID 10 ဆိုလျှင် အကွက်နံပါတ် 1 ဖြစ်သွားမည်။
                // အကွက် ၂၀ စာအတွက် တစ်ကွက်လျှင် ကွက်တိ ၁၈ ဒီဂရီ
                const degreesPerSegment = 18;

                // 🎯 [MATHEMATICAL FIX]: CSS ၏ 0deg အနေအထားနှင့် မြှားရှိရာ အပေါ်တည့်တည့် (Top Center) သို့ ကွက်တိကျစေမည့် ပုံသေနည်းသစ်
                // HTML Structure အရ ID 1 သည် ပထမဆုံး အကွက်ဖြစ်သောကြောင့် ယင်းအကွက်ဗဟိုသို့ လှည့်ပေးခြင်းဖြစ်သည်
                const targetDegree = 360 - ((targetPrizeId - 1) * degreesPerSegment + (degreesPerSegment / 2));

                // ယခင်လည်ပတ်မှု အကြွင်းများကို ရှင်းထုတ်ပြီး အပတ်ရေ ၁၀ ပတ် (၃၆00deg) အရှိန်ထည့်ပေါင်းခြင်း
                currentRotation = (currentRotation - (currentRotation % 360)) + 3600 + targetDegree;

                console.log(`🎁 Won Prize: ${data.prizename} (ID: ${targetPrizeId}) | Rotation: ${currentRotation}deg`);

                // 🚀 CSS Transform မောင်းနှင်၍ ဘီးကို ရှယ်လည်ပတ်စေခြင်း
                wheel.style.transform = `rotate(${currentRotation}deg)`;

                // မတော်တဆ လည်နေတုန်း Refresh ဖြစ်သွားပါက ကာကွယ်ရန် ယာယီမှတ်သားခြင်း
                localStorage.setItem("pendingPrizeName", data.prizename);
                localStorage.setItem("pendingPrizeSession", sessionId);

                // ၅ စက္ကန့်ပြည့်မြောက်၍ Animation ရပ်တန့်ချိန်တွင် Popup ပြသခြင်း
                setTimeout(() => {
                    isSpinning = false;
                    spinBtn.disabled = false;

                    // ပေါက်သွားသော ဆုမဲ ID ကို စာရင်းထဲထည့်သွင်းပြီး ဘီးကို Update လုပ်မည်
                    if (!claimedPrizes.includes(targetPrizeId)) {
                        claimedPrizes.push(targetPrizeId);
                        localStorage.setItem("claimedPrizes", JSON.stringify(claimedPrizes));
                    }

                    setupWheelPrizes();

                    // ဆုမဲပေါက်ကြောင်း Custom Popup ထုတ်ပြခြင်း
                    showCustomPopup(data.prizename);
                }, 5000);
            }
        })
        .catch(error => {
            console.error("Fetch Error:", error);
            alert("⚠️ ကွန်ရက်ချိတ်ဆက်မှု ပြဿနာဖြစ်ပွားနေပါသည်၊ Node.js Server ပွင့်နေခြင်း ရှိ/မရှိ ပြန်လည်စစ်ဆေးပါဦး!");
            isSpinning = false;
            spinBtn.disabled = false;
        });
}