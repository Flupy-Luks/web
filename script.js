/* ============================================
   FernBlog — script.js
   ============================================ */

const music     = document.getElementById("bg-music");
const etiqueta  = document.getElementById("etiqueta");
const video     = document.getElementById("bg-video");
const flash     = document.getElementById("persona-flash");

const principal = document.getElementById("tela-principal");
const menuItems = Array.from(document.querySelectorAll(".menu-item"));
const indicador = document.getElementById("menu-indicador");

let menuIndex    = 0;
let telaAtual    = null;
let audioCtx     = null;
let musicStarted = false;

music.volume = 0.4;

/* ============================================
   Web Audio API — sons sintéticos estilo Persona
   ============================================ */

function getCtx() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    return audioCtx;
}

function iniciarMusica() {
    if (musicStarted) return;
    musicStarted = true;
    getCtx().resume();
    music.play().catch(() => {});
    etiqueta.classList.add("show");
}

function sfxCursor() {
    try {
        const ctx  = getCtx();
        const osc  = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = "sine";
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(660, ctx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.22, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.1);
    } catch(e) {}
}

function sfxConfirm() {
    try {
        const ctx = getCtx();
        [0, 0.09].forEach((delay, i) => {
            const osc  = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.type = "square";
            osc.frequency.setValueAtTime(i === 0 ? 440 : 660, ctx.currentTime + delay);
            gain.gain.setValueAtTime(0.13, ctx.currentTime + delay);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.11);
            osc.start(ctx.currentTime + delay);
            osc.stop(ctx.currentTime + delay + 0.13);
        });
    } catch(e) {}
}

function sfxCancel() {
    try {
        const ctx  = getCtx();
        const osc  = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = "sine";
        osc.frequency.setValueAtTime(550, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.16);
        gain.gain.setValueAtTime(0.18, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.19);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.2);
    } catch(e) {}
}

/* ============================================
   Iniciar música — mouse OU teclado (só uma vez)
   ============================================ */
window.addEventListener("pointerdown", iniciarMusica, { once: true });
window.addEventListener("keydown",     iniciarMusica, { once: true });

/* ============================================
   Flash Persona
   ============================================ */
function triggerFlash() {
    flash.classList.remove("flash-ativo");
    void flash.offsetWidth;
    flash.classList.add("flash-ativo");
}

/* ============================================
   Troca de vídeo de fundo
   ============================================ */
function trocarVideo(src) {
    video.src = src;
    video.load();
    video.play().catch(() => {});
}

/* ============================================
   Atualiza foco visual da seta
   ============================================ */
function atualizarFoco(novoIndex) {
    menuItems.forEach((item, i) => item.classList.toggle("focado", i === novoIndex));
    menuIndex = novoIndex;

    const item = menuItems[novoIndex];
    if (item) {
        const topPos = item.offsetTop + (item.offsetHeight / 2) - ((indicador.offsetHeight || 24) / 2);
        indicador.style.top = topPos + "px";
    }
}

requestAnimationFrame(() => requestAnimationFrame(() => atualizarFoco(0)));

/* ============================================
   Abrir tela secundária
   ============================================ */
function abrirTela(telaId, videoSrc) {
    const tela = document.getElementById(telaId);
    if (!tela || telaAtual === telaId) return;

    sfxConfirm();
    triggerFlash();

    setTimeout(() => {
        principal.classList.add("saindo-esquerda");
        tela.classList.remove("saindo");
        tela.classList.add("ativa");
        trocarVideo(videoSrc);

        principal.addEventListener("animationend", () => {
            principal.style.visibility = "hidden";
        }, { once: true });

        telaAtual = telaId;
    }, 80);
}

/* ============================================
   Fechar tela secundária
   ============================================ */
function fecharTela() {
    if (!telaAtual) return;
    const tela = document.getElementById(telaAtual);
    if (!tela) return;

    sfxCancel();
    triggerFlash();

    setTimeout(() => {
        tela.classList.remove("ativa");
        tela.classList.add("saindo");

        principal.style.visibility = "visible";
        principal.classList.remove("saindo-esquerda");
        principal.classList.add("entrando");

        trocarVideo("video.mp4");

        tela.addEventListener("animationend", () => tela.classList.remove("saindo"), { once: true });
        principal.addEventListener("animationend", () => principal.classList.remove("entrando"), { once: true });

        telaAtual = null;
    }, 80);
}

/* ============================================
   Eventos de mouse nos menu items
   ============================================ */
menuItems.forEach((item, i) => {
    item.addEventListener("click", () => {
        atualizarFoco(i);
        abrirTela(item.dataset.tela, item.dataset.video);
    });

    item.addEventListener("mouseenter", () => {
        if (telaAtual) return;
        sfxCursor();
        atualizarFoco(i);
    });
});

/* ============================================
   Botões VOLTAR
   ============================================ */
document.querySelectorAll(".voltar").forEach(btn => {
    btn.addEventListener("click", fecharTela);
});

/* ============================================
   NAVEGAÇÃO POR TECLADO
   ============================================ */
document.addEventListener("keydown", (e) => {

    if (telaAtual) {
        if (e.key === "Escape" || e.key === "Backspace" || e.key === "ArrowLeft") {
            e.preventDefault();
            fecharTela();
        }
        return;
    }

    switch (e.key) {
        case "ArrowUp":
        case "w":
        case "W":
            e.preventDefault();
            sfxCursor();
            atualizarFoco((menuIndex - 1 + menuItems.length) % menuItems.length);
            break;

        case "ArrowDown":
        case "s":
        case "S":
            e.preventDefault();
            sfxCursor();
            atualizarFoco((menuIndex + 1) % menuItems.length);
            break;

        case "Enter":
        case "ArrowRight": {
            e.preventDefault();
            const item = menuItems[menuIndex];
            if (item) abrirTela(item.dataset.tela, item.dataset.video);
            break;
        }
    }
}); 
