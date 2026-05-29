const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
    cors: { origin: "*" }
});

let currentNumber = null;
let numberInterval = null;
let activePlayers = new Set(); // ကစားသမားများ စာရင်းကို ID ဖြင့် မှတ်ထားရန်
let isGamePaused = false;

// ၁ မှ ၉၉ အထိ နံပါတ်များ ထုတ်ရန် Pool
let numberPool = Array.from({ length: 50 }, (_, i) => i + 1);
let drawnNumbers = [];

function shuffleNumbers() {
    numberPool.sort(() => Math.random() - 0.5);
}

// နံပါတ်အလိုအလျောက် ထုတ်ပေးသည့် လုပ်ဆောင်ချက်
function startNumberGeneration() {
    if (numberInterval) clearInterval(numberInterval);

    numberInterval = setInterval(() => {
        if (isGamePaused) return; // Winner စစ်ဆေးနေစဉ် သို့မဟုတ် Alert တက်နေစဉ် ရပ်ထားရန်

        if (numberPool.length > 0) {
            currentNumber = numberPool.pop();
            drawnNumbers.push(currentNumber);

            // ဂိမ်းအခြေအနေကို အားလုံးထံသို့ ပို့ပေးခြင်း (နံပါတ်အသစ်နှင့် ထွက်ပြီးသားနံပါတ်များ)
            io.emit('gameUpdate', {
                currentNumber: currentNumber,
                drawnNumbers: drawnNumbers
            });
        } else {
            clearInterval(numberInterval);
            console.log("Numbers exhausted.");
        }
    }, 5000); // ၅ စက္ကန့်လျှင် တစ်လုံးထွက်ရန် စီစဉ်ထားသည်
}

io.on('connection', (socket) => {
    console.log(`A user connected: ${socket.id}`);

    // Player တစ်ယောက် ဝင်လာလျှင် စာရင်းထဲထည့်ပြီး အရေအတွက်ကို အားလုံးထံ ချက်ချင်းပို့ပေးခြင်း
    activePlayers.add(socket.id);
    io.emit('playerCountUpdate', { count: activePlayers.size });

    // ဂိမ်းစတင်ချိန်တွင် လက်ရှိထွက်ထားသော နံပါတ်ကို ပို့ပေးခြင်း
    if (currentNumber) {
        socket.emit('gameUpdate', { currentNumber, drawnNumbers });
    }

    // ကစားသမားဘက်မှ Bingo ဖြစ်ကြောင်း လှမ်းပို့လိုက်သည့်အခါ
    socket.on('playerBingoClaim', (data) => {
        isGamePaused = true; // နံပါတ်ထုတ်ခြင်းကို ချက်ချင်း ရပ်ဆိုင်းလိုက်သည်

        // Server နှင့် Clients အားလုံးထံသို့ Winner အချက်အလက်ကို ပို့ပေးခြင်း
        io.emit('bingoWinnerDetected', {
            winnerName: data.winnerName,
            winnerId: socket.id
        });
    });

    // Server က Alert Box တွင် OK နှိပ်လိုက်ပြီး ဂိမ်းပြန်လည်ပတ်စေလိုသည့်အခါ
    socket.on('resumeGameFromHost', () => {
        isGamePaused = false;
        io.emit('gameResumed');
    });

    // ဒိုင်က ဂိမ်းအသစ် လုံးဝ Reset လုပ်လိုက်သည့်အခါ
    socket.on('resetGameFromHost', () => {
        clearInterval(numberInterval);
        numberPool = Array.from({ length: 50 }, (_, i) => i + 1);
        shuffleNumbers();
        drawnNumbers = [];
        currentNumber = null;
        isGamePaused = false;
        io.emit('resetGame');
        startNumberGeneration();
    });

    // ကစားသမား ထွက်သွားသည့်အခါ (စာရင်းမှ နှုတ်ပြီး အရေအတွက်ပြန်ညှိရန်)
    socket.on('disconnect', () => {
        activePlayers.delete(socket.id);
        io.emit('playerCountUpdate', { count: activePlayers.size });
        console.log(`User disconnected: ${socket.id}`);
    });
});

// ဂိမ်းစတင်လည်ပတ်ရန် နံပါတ်များကို ကနဦး Shuffled လုပ်ပြီး Start လုပ်ခြင်း
shuffleNumbers();
startNumberGeneration();

const PORT = 3000;
http.listen(PORT, '0.0.0.0', () => {
    console.log(`Bingo Server listening on port ${PORT}`);
});