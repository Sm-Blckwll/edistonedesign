gsap.registerPlugin(Observer);

// --- CONFIG ---
const cards = Array.from(document.querySelectorAll('.card'));
const totalCards = cards.length;
const cardStack = document.querySelector('.card-stack');
const wordEl = document.querySelector('.dynamic-word');
const counterEl = document.querySelector('.counter');
const progressFill = document.querySelector('.progress-fill');
let activeIndex = 0; // 0 is top card
let isAnimating = false;

// --- INIT ---
// Set initial z-indexes and scales
function init() {
    cards.forEach((card, i) => {
        gsap.set(card, {
            zIndex: totalCards - i,
            scale: 1 - (i * 0.05), // 1, 0.95, 0.90
            y: i * 15, // 0, 15, 30
            transformOrigin: "50% 100%",
            filter: `brightness(${1 - (i * 0.15)})` // Darker as they go back
        });
    });
    
    // Set Clock
    setInterval(() => {
        const now = new Date();
        document.getElementById('clock').innerText = now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    }, 1000);
}

init();

// --- ANIMATION CORE ---
function handleScroll(direction) {
    if (isAnimating) return;

    if (direction > 0 && activeIndex < totalCards - 1) {
        // Scroll DOWN -> Next Card
        animateNext();
    } else if (direction < 0 && activeIndex > 0) {
        // Scroll UP -> Previous Card
        animatePrev();
    }
}

function animateNext() {
    isAnimating = true;
    const currentCard = cards[activeIndex];
    const nextCard = cards[activeIndex + 1];

    // 1. Throw Current Card "Away" (Up and Random Rotate)
    gsap.to(currentCard, {
        y: -window.innerHeight * 1.2,
        rotation: Math.random() * 10 - 5,
        opacity: 0,
        duration: 1.2,
        ease: "power4.in",
    });

    // 2. Move Stack Forward
    if(nextCard) {
        // Active Card becomes big
        gsap.to(nextCard, {
            scale: 1,
            y: 0,
            filter: "brightness(1)",
            duration: 1,
            ease: "power3.out",
            delay: 0.1
        });
        
        // Move others up
        for(let i = activeIndex + 2; i < totalCards; i++) {
            gsap.to(cards[i], {
                scale: 1 - ((i - (activeIndex + 1)) * 0.05),
                y: (i - (activeIndex + 1)) * 15,
                filter: `brightness(${1 - ((i - (activeIndex + 1)) * 0.15)})`,
                duration: 1,
                ease: "power3.out"
            });
        }
    }

    // 3. Text Update
    updateText(activeIndex + 1);
    
    activeIndex++;
    setTimeout(() => isAnimating = false, 1000);
}

function animatePrev() {
    isAnimating = true;
    activeIndex--;
    const prevCard = cards[activeIndex];

    // 1. Reset Position (Above Screen)
    gsap.set(prevCard, { 
        y: -window.innerHeight * 1.2, 
        rotation: 0, 
        opacity: 1 
    });

    // 2. Drop In
    gsap.to(prevCard, {
        y: 0,
        rotation: 0,
        duration: 1.2,
        ease: "power3.out"
    });

    // 3. Push Stack Back
    for(let i = activeIndex + 1; i < totalCards; i++) {
        gsap.to(cards[i], {
            scale: 1 - ((i - activeIndex) * 0.05),
            y: (i - activeIndex) * 15,
            filter: `brightness(${1 - ((i - activeIndex) * 0.15)})`,
            duration: 1,
            ease: "power3.out"
        });
    }

    updateText(activeIndex);
    setTimeout(() => isAnimating = false, 1000);
}

// --- TEXT ANIMATION ---
function updateText(index) {
    const card = cards[index];
    const newTitle = card.getAttribute('data-title');
    
    // Animate Word Down/Up
    const tl = gsap.timeline();

tl.to(wordEl, {
    x: "-110%",      // Slide UP and out
    opacity: 0,
    duration: 0.2,
    ease: "power2.in",
    onComplete: () => {
        wordEl.textContent = newTitle;
        // Immediately move it to the BOTTOM so it can slide back up
        gsap.set(wordEl, { x: "110%", opacity: 0 });
    }
})
// The "+=0.2" adds a 0.2s gap (200ms) after the previous animation finishes
.to(wordEl, {
    x: "0%",
    opacity: 1,
    duration: 0.6,
    ease: "power2.out"
}, "+=0.7");

    // Update Counter
    counterEl.textContent = `0${index + 1} / 0${totalCards}`;
    
    // Update Progress
    gsap.to(progressFill, {
        width: `${((index + 1) / totalCards) * 100}%`,
        duration: 0.5,
        ease: "power2.out"
    });
}

// --- CURSOR FOLLOWER ---
const cursorDot = document.querySelector('.cursor-dot');
const cursorCircle = document.querySelector('.cursor-circle');

window.addEventListener('mousemove', (e) => {
    gsap.to(cursorDot, { x: e.clientX, y: e.clientY, duration: 0.1 });
    gsap.to(cursorCircle, { x: e.clientX, y: e.clientY, duration: 0.3, ease: "power2.out" });
});

// Hover States
const hoverables = document.querySelectorAll('a, button, .menu-trigger');
hoverables.forEach(el => {
    el.addEventListener('mouseenter', () => gsap.to(cursorCircle, { scale: 1.5 }));
    el.addEventListener('mouseleave', () => gsap.to(cursorCircle, { scale: 1 }));
});

// --- OBSERVER ---
Observer.create({
    target: window,
    type: "wheel,touch,pointer",
    onUp: () => handleScroll(-1),
    onDown: () => handleScroll(1),
    tolerance: 10,
    preventDefault: true
});