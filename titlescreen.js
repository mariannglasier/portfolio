const titleLink = document.querySelector(".title-screen-link");
const titleAudio = document.querySelector(".title-audio");
const clickAudio = document.querySelector(".click-audio");
const soundButton = document.querySelector(".sound-button");
const soundButtonImage = soundButton.querySelector("img");
const soundButtonImages = {
    mute: {
        idle: "images/homescreen/sound_button/mute_idle.png",
        click: "images/homescreen/sound_button/mute_click.png",
    },
    sound: {
        idle: "images/homescreen/sound_button/sound_idle.png",
        click: "images/homescreen/sound_button/sound_click.png",
    },
};
let navigationPending = false;
let soundEnabled = false;
let soundButtonClickTimeout;

function updateSoundButton(isEnabled, wasClicked = false) {
    soundEnabled = isEnabled;
    const state = soundEnabled ? "sound" : "mute";

    soundButton.setAttribute("aria-label", soundEnabled ? "Mute sound" : "Turn sound on");
    soundButton.setAttribute("aria-pressed", String(soundEnabled));
    soundButtonImage.src = soundButtonImages[state][wasClicked ? "click" : "idle"];

    window.clearTimeout(soundButtonClickTimeout);
    if (wasClicked) {
        soundButtonClickTimeout = window.setTimeout(() => {
            soundButtonImage.src = soundButtonImages[soundEnabled ? "sound" : "mute"].idle;
        }, 180);
    }
}

titleAudio.play().then(() => {
    updateSoundButton(true);
}).catch(() => {
    updateSoundButton(false);
});

soundButton.addEventListener("click", () => {
    if (soundEnabled) {
        titleAudio.pause();
        updateSoundButton(false, true);
        return;
    }

    titleAudio.play().then(() => {
        updateSoundButton(true, true);
    }).catch((error) => {
        console.error("Unable to play the title-screen music.", error);
        updateSoundButton(false);
    });
});

titleLink.addEventListener("click", (event) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
    }

    event.preventDefault();

    if (navigationPending) {
        return;
    }

    navigationPending = true;
    titleLink.classList.add("is-exiting");
    titleAudio.pause();

    const navigate = () => {
        window.location.assign(titleLink.href);
    };

    const letters = [...document.querySelectorAll(".click-letters img")];
    const animationFinished = window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? Promise.resolve()
        : Promise.all(letters.map((letter) => new Promise((resolve) => {
            letter.addEventListener("animationend", resolve, { once: true });
        })));
    clickAudio.currentTime = 0;
    const clickSoundFinished = new Promise((resolve) => {
        const finish = () => {
            clickAudio.removeEventListener("ended", finish);
            clickAudio.removeEventListener("error", finish);
            resolve();
        };

        clickAudio.addEventListener("ended", finish, { once: true });
        clickAudio.addEventListener("error", finish, { once: true });
        clickAudio.play().catch((error) => {
            console.error("Unable to play the title-screen click sound.", error);
            finish();
        });
    });

    Promise.all([animationFinished, clickSoundFinished]).then(navigate);
});
