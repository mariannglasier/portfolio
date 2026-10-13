const titleLink = document.querySelector(".title-screen-link");
const titleAudio = document.querySelector(".title-audio");
const clickAudio = document.querySelector(".click-audio");
const soundButton = document.querySelector(".sound-button");
let navigationPending = false;

titleAudio.addEventListener("playing", () => {
    soundButton.hidden = true;
});

titleAudio.play().catch(() => {
    soundButton.hidden = false;
});

soundButton.addEventListener("click", () => {
    titleAudio.play().catch((error) => {
        console.error("Unable to play the title-screen music.", error);
        soundButton.textContent = "Sound unavailable";
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
