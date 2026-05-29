// ================= DOM CONTENT LOADED GUARD =================
// စာမျက်နှာရှိ Element များ အားလုံး တက်လာပြီးမှ Event Listener များ ထည့်ရန်
document.addEventListener('DOMContentLoaded', () => {
    // Phone Input Handling
    const phoneInputs = [
        document.getElementById('loginPhone'),
        document.getElementById('regPhone')
    ];

    phoneInputs.forEach(input => {
        if (input) {
            input.addEventListener('input', function () {
                // ဂဏန်းသီးသန့်သာ ရိုက်ခွင့်ပြုခြင်း
                this.value = this.value.replace(/[^0-9]/g, '');
            });
        }
    });

    // Checkbox Validation Setup
    const agreeCheckbox = document.getElementById('agreeCheckbox');
    const acceptBtn = document.getElementById('acceptBtn');

    if (agreeCheckbox && acceptBtn) {
        agreeCheckbox.addEventListener('change', function () {
            acceptBtn.disabled = !this.checked;
        });
    }

    // Form Submissions Listeners
    const regForm = document.getElementById('registrationForm');
    if (regForm) {
        regForm.addEventListener('submit', validateRegisterForm);
    }

    // 🌟 LOGIN FORM အတွက် SUBMIT EVENT LISTENER ချိတ်ဆက်ခြင်း
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', validateLoginForm);
    }

    const occupationEl = document.getElementById('occupation');
    if (occupationEl) {
        occupationEl.addEventListener('change', toggleOccupationFields);
    }

    // 09- အစရှိတဲ့ dash (-) ကို ခွင့်ပြုရန်
    const regPhoneInput = document.getElementById('regPhone');
    if (regPhoneInput) {
        regPhoneInput.addEventListener('input', function () {
            this.value = this.value.replace(/[^0-9-]/g, '');
        });
    }
});

// ================= Form Auto-switching Setup =================

function switchForm(formType) {
    const loginBox = document.getElementById('loginBox');
    const registerBox = document.getElementById('registerBox');

    if (loginBox && registerBox) {
        if (formType === 'login') {
            registerBox.style.display = 'none';
            loginBox.style.display = 'block';
        } else if (formType === 'register') {
            loginBox.style.display = 'none';
            registerBox.style.display = 'block';
        }
    }
}

// ================= Occupation Fields Toggle =================

function toggleOccupationFields() {
    const occupationEl = document.getElementById('occupation');
    if (!occupationEl) return;

    const occupation = occupationEl.value;
    const workField = document.getElementById('workField');
    const studyField = document.getElementById('studyField');
    const jobTitleEl = document.getElementById('jobTitle');
    const schoolNameEl = document.getElementById('schoolName');

    if (workField) workField.style.display = 'none';
    if (studyField) studyField.style.display = 'none';

    if (jobTitleEl) jobTitleEl.required = false;
    if (schoolNameEl) schoolNameEl.required = false;

    if (occupation === 'work' && workField && jobTitleEl) {
        workField.style.display = 'flex';
        jobTitleEl.required = true;
    } else if (occupation === 'study' && studyField && schoolNameEl) {
        studyField.style.display = 'flex';
        schoolNameEl.required = true;
    }
}

// ================= REGISTER VALIDATION & DATABASE INSERT =================

async function validateRegisterForm(event) {
    event.preventDefault();

    let isValid = true;

    const username = document.getElementById('username').value.trim();
    const phone = document.getElementById('regPhone').value.trim();
    const email = document.getElementById('email').value.trim();
    const age = document.getElementById('age').value.trim();
    const occupation = document.getElementById('occupation').value;

    const usernameError = document.getElementById('usernameError');
    const phoneError = document.getElementById('regPhoneError');
    const emailError = document.getElementById('emailError');
    const ageError = document.getElementById('ageError');

    // USERNAME VALIDATION
    const alphaRegex = /^[A-Za-z\s]+$/;
    if (!alphaRegex.test(username)) {
        if (usernameError) usernameError.style.display = 'block';
        isValid = false;
    } else {
        if (usernameError) usernameError.style.display = 'none';
    }

    // PHONE VALIDATION
    const phoneRegex = /^09\d{7,9}$/;
    if (!phoneRegex.test(phone)) {
        if (phoneError) {
            phoneError.textContent = "Phone must start with 09 followed by 7 to 9 digits.";
            phoneError.style.display = 'block';
        }
        isValid = false;
    } else {
        if (phoneError) phoneError.style.display = 'none';
    }

    // EMAIL VALIDATION
    if (email !== "") {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            if (emailError) emailError.style.display = 'block';
            isValid = false;
        } else {
            if (emailError) emailError.style.display = 'none';
        }
    } else {
        if (emailError) emailError.style.display = 'none';
    }

    // AGE VALIDATION
    const ageRegex = /^[0-9]+$/;
    if (!ageRegex.test(age) || parseInt(age) < 10 || parseInt(age) > 80) {
        if (ageError) ageError.style.display = 'block';
        isValid = false;
    } else {
        if (ageError) ageError.style.display = 'none';
    }

    // DATABASE SEND
    if (isValid) {
        let useroccup = "";

        if (occupation === "work") {
            useroccup = document.getElementById("jobTitle").value.trim();
        } else if (occupation === "study") {
            useroccup = document.getElementById("schoolName").value.trim();
        } else {
            useroccup = "Free / Other";
        }

        try {
            const response = await fetch("/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    username: username,
                    userph: phone,
                    useremail: email || null,
                    userage: parseInt(age, 10),
                    useroccup: useroccup
                })
            });

            const data = await response.json();

            if (data.success) {
                document.getElementById("registrationForm").reset();
                if (typeof toggleOccupationFields === "function") {
                    toggleOccupationFields();
                }
                // switchForm('login');
                window.location.href = 'login.html';
            } else {
                if (phoneError) {
                    phoneError.textContent = data.message || "Phone number already exists.";
                    phoneError.style.display = 'block';
                }
                const regPhoneInput = document.getElementById('regPhone');
                if (regPhoneInput) regPhoneInput.focus();
            }
        } catch (error) {
            console.log(error);
            alert("Server Error during registration");
        }
    }

    return isValid;
}

// ================= 🎰 LOGIN FORM VALIDATION & REDIRECT TO HOME =================

/*async function validateLoginForm(event) {
    event.preventDefault(); // Form refresh ဖြစ်ပြီး page ပျက်သွားတာကို တားဆီးရန်

    const loginPhoneInput = document.getElementById('loginPhone');
    if (!loginPhoneInput) return;

    const phone = loginPhoneInput.value.trim();

    // ဖုန်းနံပါတ် Validation စစ်ဆေးခြင်း
    const phoneRegex = /^09\d{7,9}$/;
    if (!phoneRegex.test(phone)) {
        alert("ကျေးဇူးပြု၍ မှန်ကန်သော ဖုန်းနံပါတ် (၀၉ အစရှိပြီး ဂဏန်း ၉ လုံးမှ ၁၁ လုံး) ရိုက်ထည့်ပါ။");
        return;
    }

    try {
        // Backend /api/login သို့ ဖုန်းနံပါတ် ပို့ပေးခြင်း
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ phone: phone })
        });

        const data = await response.json();

        if (data.success) {
            // 🌟 ပြင်ဆင်ချက် - home-script.js နှင့် စနစ်တကျ အံကိုက်ဖြစ်စေရန် 'user' object ကို JSON String စနစ်ဖြင့် တိုက်ရိုက်သိမ်းဆည်းခြင်း
            const userObj = {
                id: data.user.id,
                userid: data.user.id,
                username: data.user.name,
                userph: data.user.userph,
                useroccup: data.user.useroccup
            };
            localStorage.setItem('user', JSON.stringify(userObj));

            // မူလ Key တစ်ခုချင်းစီ သိမ်းဆည်းမှုကိုလည်း အခြားကုဒ်များ မပျက်စီးစေရန် ဆက်လက်ထိန်းသိမ်းပေးထားပါသည်
            localStorage.setItem('userid', data.user.id);
            localStorage.setItem('username', data.user.name);
            localStorage.setItem('userph', data.user.userph);
            localStorage.setItem('useroccup', data.user.useroccup);

            // 🚀 Login အောင်မြင်သွားပြီဖြစ်၍ Bingo ကစားမည့် home.html သို့ တိုက်ရိုက် ခေါ်ဆောင်သွားခြင်း
            window.location.href = 'home.html';
        } else {
            // ဖုန်းနံပါတ် မှားယွင်းနေပါက အကြောင်းကြားစာပြခြင်း
            alert(data.message || "ဖုန်းနံပါတ် မှားယွင်းနေပါသည် သို့မဟုတ် အကောင့်မရှိပါ။");
        }
    } catch (error) {
        console.error("Login Error:", error);
        alert("Server နှင့် ချိတ်ဆက်မှု မအောင်မြင်ပါ (Server Error)");
    }
}
async function validateLoginForm(event) {
    event.preventDefault(); // Form refresh ဖြစ်ပြီး page ပျက်သွားတာကို တားဆီးရန်

    const loginPhoneInput = document.getElementById('loginPhone');
    if (!loginPhoneInput) return;

    const phone = loginPhoneInput.value.trim();

    // ဖုန်းနံပါတ် Validation စစ်ဆေးခြင်း
    const phoneRegex = /^09\d{7,9}$/;
    if (!phoneRegex.test(phone)) {
        alert("ကျေးဇူးပြု၍ မှန်ကန်သော ဖုန်းနံပါတ် (၀၉ အစရှိပြီး ဂဏန်း ၉ လုံးမှ ၁၁ လုံး) ရိုက်ထည့်ပါ။");
        return;
    }

    try {
        // Backend /api/login သို့ ဖုန်းနံပါတ် ပို့ပေးခြင်း
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ phone: phone })
        });

        const data = await response.json();

        if (data.success) {

            // 🌟 Corrected Logic: ranktbl ထဲက rankid အရေအတွက်သည် 100 ထက်နည်းမှ (Less than 100) home.html ကို ပေးသွားမည်။
            if (data.rankCount < 50) {

                // 🌟 ပြင်ဆင်ချက် - home-script.js နှင့် စနစ်တကျ အံကိုက်ဖြစ်စေရန် 'user' object ကို JSON String စနစ်ဖြင့် တိုက်ရိုက်သိမ်းဆည်းခြင်း
                const userObj = {
                    id: data.user.id,
                    userid: data.user.id,
                    username: data.user.name,
                    userph: data.user.userph,
                    useroccup: data.user.useroccup
                };
                localStorage.setItem('user', JSON.stringify(userObj));

                // မူလ Key တစ်ခုချင်းစီ သိမ်းဆည်းမှုကိုလည်း အခြားကုဒ်များ မပျက်စီးစေရန် ဆက်လက်ထိန်းသိမ်းပေးထားပါသည်
                localStorage.setItem('userid', data.user.id);
                localStorage.setItem('username', data.user.name);
                localStorage.setItem('userph', data.user.userph);
                localStorage.setItem('useroccup', data.user.useroccup);

                // 🚀 Login အောင်မြင်သွားပြီဖြစ်၍ Bingo ကစားမည့် home.html သို့ တိုက်ရိုက် ခေါ်ဆောင်သွားခြင်း
                window.location.href = 'home.html';

            } else {
                // 🛑 အရေအတွက် ၁၀၀ နှင့် ၁၀၀ အထက် ဖြစ်နေပါက ဤနေရာသို့ ရောက်ရှိပြီး Alert Box ပြသမည်
                alert("You are invalid user for this session!");
            }

        } else {
            // ဖုန်းနံပါတ် မှားယွင်းနေပါက အကြောင်းကြားစာပြခြင်း
            alert(data.message || "ဖုန်းနံပါတ် မှားယွင်းနေပါသည် သို့မဟုတ် အကောင့်မရှိပါ။");
        }
    } catch (error) {
        console.error("Login Error:", error);
        alert("Server နှင့် ချက်ဆက်မှု မအောင်မြင်ပါ (Server Error)");
    }
}
*/
// 🎯 ၁။ Server ဆီက Session Name Broadcast ကို ဖမ်းဖို့ Variable တစ်ခု ကြေညာထားမယ်
// (HTML ထဲမှာ <script src="/socket.io/socket.io.js"></script> သို့မဟုတ် CDN ချိတ်ပေးထားဖို့ လိုပါတယ်)
// 🎯 [အရေးကြီး] ဖိုင်ရဲ့ အပေါ်ဆုံး ထိပ်ဆုံးမှာပဲ အရင်ဆုံး ကြေညာပါ!
const socket = io("http://192.168.21.168:3000");
let currentSessionName = ""; // Variable အရင်တည်ဆောက်တာ (Initialization)

// ဆာဗာက ပို့တာကို ဖမ်းယူမယ်
socket.on("sessionNameBroadcast", (data) => {
    if (data && data.sessionName) {
        currentSessionName = data.sessionName.toUpperCase().trim();
    }
});

// 🎯 ပြီးမှ အောက်မှာ ဖန်ရှင်တွေကို ရေးပါ
async function validateLoginForm(event) {
    event.preventDefault();

    const loginPhoneInput = document.getElementById('loginPhone');
    if (!loginPhoneInput) return;

    const phone = loginPhoneInput.value.trim();

    // ဖုန်းနံပါတ် Validation
    const phoneRegex = /^09\d{7,9}$/;
    if (!phoneRegex.test(phone)) {
        alert("ကျေးဇူးပြု၍ မှန်ကန်သော ဖုန်းနံပါတ် (၀၉ အစရှိပြီး ဂဏန်း ၉ လုံးမှ ၁၁ လုံး) ရိုက်ထည့်ပါ။");
        return;
    }

    try {
        // Backend သို့ ပို့ခြင်း
        const response = await fetch('http://192.168.21.168:3000/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                phone: phone,
                sessionName: currentSessionName // 🌟 အပေါ်မှာ ကြေညာပြီးသားမို့ Error မတက်တော့ပါ
            })
        });

        const data = await response.json();

        if (data.success) {

            if (data.rankCount < 50) {

                // 🎯 home-script.js က userData.username ကို ဖတ်တာဖြစ်တဲ့အတွက် 
                // Object ရဲ့ key ကို 'username' လို့ပဲ တိုက်ရိုက်ပေးရမယ် သားကြီး။
                // Backend က လာတဲ့ data.user.name (results[0].username) ကို သယ်ထည့်ပေးလိုက်မယ်။
                const userObj = {
                    id: data.user.id,
                    userid: data.user.id,
                    username: data.user.name,  // 🌟 အဓိက သော့ချက်က ဒီကောင်ပဲ! (home-script ဖတ်နိုင်အောင်)
                    userph: data.user.userph,
                    useroccup: data.user.useroccup
                };

                // LocalStorage ထဲကို JSON string စနစ်နဲ့ သိမ်းဆည်းမယ်
                localStorage.setItem('user', JSON.stringify(userObj));

                // မူရင်း Key တစ်ခုချင်းစီ သီးသန့်သိမ်းတဲ့ နေရာတွေလည်း မပျက်အောင် ထားခဲ့မယ်
                localStorage.setItem('userid', data.user.id);
                localStorage.setItem('username', data.user.name); // 🌟 ဒါကလည်း အပေါ်က finalUsername အတွက် အလုပ်လုပ်မယ်
                localStorage.setItem('userph', data.user.userph);
                localStorage.setItem('useroccup', data.user.useroccup);

                // 🚀 အကုန်အဆင်ပြေပြီဆိုမှ home.html ကို လွှတ်မယ်
                window.location.href = 'home.html';

            } else {
                alert("You are invalid user for this session!");
            }

        } else {
            alert(data.message || "ဖုန်းနံပါတ် မှားယွင်းနေပါသည် သို့မဟုတ် အကောင့်မရှိပါ။");
        }
    } catch (error) {
        console.error("Login Error:", error);
        alert("Server နှင့် ချိတ်ဆက်မှု မအောင်မြင်ပါ (Server Error)");
    }
}
// ================= TERMS & CONDITIONS NAVIGATION =================

let currentPage = 1;
const totalPages = 3;

function changePage(direction) {
    document.getElementById(`page${currentPage}`).classList.remove('active');
    currentPage += direction;
    document.getElementById(`page${currentPage}`).classList.add('active');

    const progressPercent = (currentPage / totalPages) * 100;
    const progressBar = document.getElementById('progressBar');
    if (progressBar) progressBar.style.width = `${progressPercent}%`;

    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const acceptBtn = document.getElementById('acceptBtn');

    if (prevBtn) prevBtn.style.display = (currentPage === 1) ? 'none' : 'block';

    if (currentPage === totalPages) {
        if (nextBtn) nextBtn.style.display = 'none';
        if (acceptBtn) acceptBtn.style.display = 'block';
    } else {
        if (nextBtn) nextBtn.style.display = 'block';
        if (acceptBtn) acceptBtn.style.display = 'none';
    }
}

// ================= TERMS SUBMIT (REDIRECT TO REG.HTML) =================

/*function handleTermsSubmit(event) {
    event.preventDefault();
    const agreeCheckbox = document.getElementById('agreeCheckbox');

    if (agreeCheckbox && agreeCheckbox.checked) {
        window.location.href = "reg.html";
    }
}*/
function setupFormRedirect(formId, redirectUrl) {
    const form = document.getElementById(formId);

    if (!form) {
        console.error(`Form with ID '${formId}' not found.`);
        return;
    }

    form.addEventListener('submit', function (event) {
        // Prevent default form submission reload
        event.preventDefault();

        // Optional: Add logic here to grab and save form data
        // const formData = new FormData(form);

        // Redirect to the specified URL
        window.location.href = redirectUrl;
    });
}

// Usage: Call this function once the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    setupFormRedirect('registrationForm', 'login.html');
});