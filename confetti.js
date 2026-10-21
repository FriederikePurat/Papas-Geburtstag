function createConfetti() {
    const confetti = document.createElement("div");
    confetti.classList.add("confetti");

    confetti.style.left = Math.random() * 100 + "vw";
    confetti.style.backgroundColor = getRandomColor();
    confetti.style.animationDuration = Math.random() * 3 + 2 + "s";
    confetti.style.width = Math.random() * 8 + 6 + "px";
    confetti.style.height = Math.random() * 12 + 8 + "px";

    document.body.appendChild(confetti);

    setTimeout(() => {
        confetti.remove();
    }, 5000);
}

function getRandomColor() {
    const colors = ["#315f6f", "#7ba0ae", "#c9b458", "#6aaa64", "#f7b267", "#f79dcb"];
    return colors[Math.floor(Math.random() * colors.length)];
}

setInterval(createConfetti, 80);