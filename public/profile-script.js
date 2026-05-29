// ================= Fetching Database Profile Fields =================

// backend သို့မဟုတ် local Session ကနေရလာမယ့် ဒေတာဘေ့စ် Row ပုံစံတူ ဥပမာဒေတာ
const databaseMockData = {
    userid: 1024,
    username: "Ko Myo",
    userph: "09-450011223",
    useremail: "komyo.maba@gmail.com",
    userage: 24,
    useroccup: "Studying (Harvard University)"
};

// စာမျက်နှာ Loading တက်လာတာနဲ့ ဒေတာဘေ့စ် ကော်လံတွေကို နေရာချမှာဖြစ်ပါတယ်
document.addEventListener("DOMContentLoaded", function () {
    // 🌟 ၁။ နေရာစုံမှ User ID ကို မပျောက်ပျက်အောင် အသေအချာ ရှာဖွေဖတ်ယူခြင်း
    const storedUserString = localStorage.getItem('user');
    let activeUserId = localStorage.getItem('userid'); // မူလ Key မှ ရှာကြည့်ခြင်း

    if (storedUserString) {
        try {
            const parsedUser = JSON.parse(storedUserString);
            if (parsedUser && (parsedUser.userid || parsedUser.id)) {
                activeUserId = parsedUser.userid || parsedUser.id;
            }
        } catch (e) {
            console.error("Error parsing user data from localStorage", e);
        }
    }

    // 🌟 ၂။ အကယ်၍ User ID လုံးဝမရှိပါက Login ဆီ ပြန်မောင်းထုတ်ခြင်း
    if (!activeUserId) {
        alert("အသုံးပြုသူ အချက်အလက် မရှိပါ။ ကျေးဇူးပြု၍ အကောင့်ပြန်ဝင်ပေးပါ။");
        window.location.href = "login.html";
        return;
    }

    // 🌟 ၃။ Backend API ဆီသို့ ဒေတာလှမ်းတောင်းခြင်း (ပြင်ဆင်ထားသော profile endpoint သို့ ချိတ်ဆက်သည်)
    fetch(`/api/profile/${activeUserId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error("ဒေတာ ဆွဲယူ၍ မရနိုင်ပါ။");
            }
            return response.json();
        })
        .then(data => {
            // Backend ကပေးပို့တဲ့ { success: true, ... } ပုံစံရှိမရှိ စစ်ဆေးပြီး ဒေတာဆွဲထုတ်ခြင်း
            const userData = data.success ? data : data;

            // 🌟 ၄။ HTML ထဲတွင် ရှိနေနိုင်သမျှသော ID ပုံစံအားလုံးနှင့် ကိုက်ညီအောင် ညှိနှိုင်းပြသခြင်း

            // နာမည်ပြသခြင်း
            const nameEl = document.getElementById("userName") || document.getElementById('usernameDisplay') || document.getElementById('profileName');
            if (nameEl) nameEl.textContent = userData.username || "Unknown User";

            // User ID ပြသခြင်း
            const idEl = document.getElementById("userId") || document.getElementById('userIdDisplay');
            if (idEl) {
                idEl.textContent = idEl.id === 'userIdDisplay' ? `User ID: #${userData.userid || activeUserId}` : (userData.userid || activeUserId);
            }

            // ဖုန်းနံပါတ်ပြသခြင်း
            const phoneEl = document.getElementById("userPhone") || document.getElementById('phoneDisplay') || document.getElementById('profilePhone');
            if (phoneEl) phoneEl.textContent = userData.userph || "Not Provided";

            // အီးမေးလ်ပြသခြင်း
            const emailEl = document.getElementById("userEmail") || document.getElementById('emailDisplay') || document.getElementById('profileEmail');
            if (emailEl) {
                const emailVal = userData.useremail;
                emailEl.textContent = (emailVal && emailVal !== 'null' && emailVal.trim() !== "") ? emailVal : "မရှိပါ";
            }

            // အသက်ပြသခြင်း
            const ageEl = document.getElementById("userAge") || document.getElementById('ageDisplay') || document.getElementById('profileAge');
            if (ageEl) {
                if (userData.userage) {
                    ageEl.textContent = ageEl.id === 'userAge' ? `${userData.userage} Years Old` : `${userData.userage} နှစ်`;
                } else {
                    ageEl.textContent = "မရှိပါ";
                }
            }

            // အလုပ်အကိုင်ပြသခြင်း
            const occupEl = document.getElementById("userStatus") || document.getElementById('occupDisplay') || document.getElementById('profileOccup');
            if (occupEl) {
                const occupVal = userData.useroccup;
                occupEl.textContent = (occupVal && occupVal !== 'null' && occupVal.trim() !== "") ? occupVal : "Free / Other";
            }
        })
        .catch(error => {
            console.error("Profile Fetch Error:", error);
            alert("Database နှင့် အဆက်အသွယ်မရရှိပါ။");

            // Error ဖြစ်သွားပါက UI Loading စာသားများကို ပြောင်းလဲပေးခြင်း
            const allLoadings = document.querySelectorAll('.loading-placeholder');
            allLoadings.forEach(el => el.textContent = "Error Loading");

            // ယာယီအသုံးပြုရန် LocalStorage ထဲမှ ပြသပေးခြင်း
            if (storedUserString) {
                try {
                    const parsedUser = JSON.parse(storedUserString);
                    const nameEl = document.getElementById("userName") || document.getElementById('usernameDisplay');
                    if (nameEl && parsedUser.username) nameEl.textContent = parsedUser.username;
                    const idEl = document.getElementById("userId") || document.getElementById('userIdDisplay');
                    if (idEl) idEl.textContent = activeUserId;
                } catch (e) { }
            }
        });

    // 🔴 LOGOUT FUNCTION (ပြင်ဆင်ပြီးသား - အယ်ရာ လုံးဝကင်းစင်စေရမည်)
    const logoutBtn = document.getElementById("profileLogoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", function () {

            // 🌟 [အဓိကပြင်ဆင်ချက်] လက်ရှိ Logout လုပ်မယ့် User ရဲ့ ID သီးသန့်ကို ယူလိုက်တယ်
            if (activeUserId) {
                // လက်ရှိ session ID (မရှိရင် default 1 လို့ ထားမယ်)
                const currentSessionId = localStorage.getItem('currentSessionId') || "1";

                // နိုင်တဲ့သူ/ဆော့ပြီးသားသူတွေရဲ့ Stream Code ပျောက်ရမယ့် Key ကို User ID အလိုက် ခွဲဖျက်တယ်
                // (ဒါက ဒုတိယ အယ်ရာအတွက်ပါ တစ်ခါတည်း ကြိုပြင်ပေးထားတာ သားကြီး)
                localStorage.removeItem(`stream_code_user_${activeUserId}_session_${currentSessionId}`);
                localStorage.removeItem(`stamp_status_user_${activeUserId}_session_${currentSessionId}`);
            }

            // 🌟 လက်ရှိ Login ဝင်ထားတဲ့ အခြေခံ အချက်အလက်တွေကိုပဲ ဖျက်ချမယ်
            localStorage.removeItem('user');
            localStorage.removeItem('userid');
            localStorage.removeItem('username');
            localStorage.removeItem('userph');

            // 🌟 ဒီကောင်က အကောင့်အားလုံးနဲ့ ဆိုင်တဲ့အတွက် ဖျက်စရာမလိုတော့လို့ Comment ပိတ်လိုက်ပြီ
            // localStorage.removeItem('saved_current_index'); 

            // Login Page ကို ပြန်မောင်းထုတ်မယ်
            window.location.href = "login.html";
        });
    }
});