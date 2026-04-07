/* ============================================
   SONRISAS Ã‰LITE - JAVASCRIPT
   ClÃ­nica OdontolÃ³gica de Alta Gama
   ============================================ */

// ============================================
// CONFIGURACIÃ“N
// ============================================
const CONFIG = {
    // Fecha del evento (formato: aÃ±o, mes-1, dÃ­a, hora, minutos)
    eventDate: new Date(2026, 3, 3, 11, 0, 0), // 3 de Abril 2026, 11:00 AM

    // NÃºmero de WhatsApp (con cÃ³digo de paÃ­s, sin + ni espacios)
    whatsappNumber: '59173223075',

    // URL de la pÃ¡gina (para el QR)
    pageUrl: window.location.href,

    // Nombre de la clÃ­nica
    clinicName: 'CMG Dental Clinic',

    // Premios de la ruleta
    prizes: [
        { id: 'p1', text: 'Fluorización gratis', color: '#F8F8F8', textColor: '#2C2C2C', limit: 100 },
        { id: 'p2', text: 'Limpieza 50% desc.', color: '#B76E79', textColor: '#FFFFFF', limit: 3 },
        { id: 'p3', text: 'Limpieza 1 gratis', color: '#C9A96E', textColor: '#FFFFFF', limit: 1 },
        { id: 'p4', text: 'Ortopedia 5% desc. contado', color: '#F8F8F8', textColor: '#2C2C2C', limit: 2 },
        { id: 'p5', text: 'Ortodoncia 5% desc. contado', color: '#C9A96E', textColor: '#FFFFFF', limit: 2 }
    ],

    // localStorage key
    storageKey: 'cmg_clinic_prize'
};

// ============================================
// ESTADO DE LA APLICACIÃ“N
// ============================================
let isSpinning = false;
let currentRotation = 0;
let wheelUnlocked = false;

// ============================================
// INICIALIZACIÃ“N
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    initLoader();
    initNavigation();
    initCountdown();
    initRuleta();
    initScrollAnimations();
    initQRCode();
    checkPreviousPlay();
    initSecretUnlock();
});

// ============================================
// LOADER
// ============================================
function initLoader() {
    const loader = document.getElementById('loader');

    window.addEventListener('load', () => {
        setTimeout(() => {
            loader.classList.add('hidden');
            document.body.classList.remove('no-scroll');
        }, 1500);
    });

    // Fallback si la pÃ¡gina tarda mucho
    setTimeout(() => {
        loader.classList.add('hidden');
        document.body.classList.remove('no-scroll');
    }, 3000);
}

// ============================================
// NAVEGACIÃ“N
// ============================================
function initNavigation() {
    const navbar = document.querySelector('.navbar');
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    // Toggle menÃº mÃ³vil
    navToggle.addEventListener('click', () => {
        navToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
        document.body.classList.toggle('no-scroll');
    });

    // Cerrar menÃº al hacer click en un enlace
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navToggle.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.classList.remove('no-scroll');
        });
    });

    // Cambiar estilo del navbar al hacer scroll
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Smooth scroll para enlaces internos
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href.startsWith('#')) {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    const offsetTop = target.offsetTop - 80;
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
}

// ============================================
// CUENTA REGRESIVA
// ============================================
function initCountdown() {
    const daysEl = document.getElementById('days');
    const hoursEl = document.getElementById('hours');
    const minutesEl = document.getElementById('minutes');
    const secondsEl = document.getElementById('seconds');

    function updateCountdown() {
        const now = new Date();
        const diff = CONFIG.eventDate - now;

        if (diff <= 0) {
            daysEl.textContent = '00';
            hoursEl.textContent = '00';
            minutesEl.textContent = '00';
            secondsEl.textContent = '00';
            return;
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        daysEl.textContent = String(days).padStart(2, '0');
        hoursEl.textContent = String(hours).padStart(2, '0');
        minutesEl.textContent = String(minutes).padStart(2, '0');
        secondsEl.textContent = String(seconds).padStart(2, '0');
    }

    updateCountdown();
    setInterval(updateCountdown, 1000);
}

// ============================================
// RULETA
// ============================================
function initRuleta() {
    const canvas = document.getElementById('wheelCanvas');
    const ctx = canvas.getContext('2d');
    const spinBtn = document.getElementById('spinBtn');
    const shareBtn = document.getElementById('shareBtn');

    // Configurar canvas para alta resoluciÃ³n
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';

    // Dibujar la ruleta
    drawWheel(ctx, rect.width, rect.height);

    if(wheelUnlocked) {
        if(overlay) overlay.style.display = 'none';
        if(spinBtn) {
            spinBtn.disabled = false;
            spinBtn.style.opacity = '1';
            spinBtn.style.cursor = 'pointer';
            spinBtn.classList.remove('disabled');
        }
    }

    // Evento de girar
    spinBtn.addEventListener('click', () => {
        if (!isSpinning) {
            spinWheel();
        }
    });

    // Evento de compartir
    shareBtn.addEventListener('click', shareOnWhatsApp);

    // Evento Exportar excel
    const exportCsvBtn = document.getElementById('exportCsvBtn');
    if (exportCsvBtn) {
        exportCsvBtn.addEventListener('click', exportWinnersCSV);
    }
}

function getWheelSlices() {
    let savedData = localStorage.getItem(CONFIG.storageKey);
    let winnersList = [];
    try {
        winnersList = savedData ? JSON.parse(savedData) : [];
    } catch(e) {
        winnersList = [];
    }
    if (!Array.isArray(winnersList)) { winnersList = winnersList ? [winnersList] : []; }
    let counts = {};
    for (let w of winnersList) { counts[w.prize] = (counts[w.prize] || 0) + 1; }
    
    // Obtener solo premios que aún tienen stock
    let available = CONFIG.prizes.filter(p => (counts[p.text] || 0) < p.limit);
    
    // Si se agotaron todos, devolvemos casillas de relleno
    if (available.length === 0) {
        let arr = [];
        for(let i=0; i<10; i++) arr.push({ text: '¡Gracias por venir!', color: '#C9A96E', textColor: '#FFFFFF', limit: 999 });
        return arr;
    }

    // Para evitar que la ruleta se "deforme", la construiremos SIEMPRE con exactamente 10 porciones.
    // Esto también logra que la probabilidad NO esté amañada: si un premio ocupa 1 casilla de 10, tiene 10% de probabilidad real.
    
    const comun = available.find(p => p.id === 'p1'); // Fluorización (el premio de relleno)
    const raros = available.filter(p => p.id !== 'p1'); // Premios gordos

    let slices = [];
    let rareIndex = 0;
    
    // Vamos a crear 10 porciones intercalando
    for(let i = 0; i < 10; i++) {
        if (i % 2 === 0 && rareIndex < raros.length) {
            slices.push({...raros[rareIndex]});
            rareIndex++;
        } else {
            if (comun) {
                slices.push({...comun});
            } else {
                slices.push({...raros[i % raros.length]});
            }
        }
    }
    
    // Asegurar que colores consecutivos no se fusionen visualmente (causa el efecto "desproporcionado")
    for (let i = 0; i < slices.length; i++) {
        let prev = (i === 0) ? slices.length - 1 : i - 1;
        if (slices[i].color === slices[prev].color) {
            if (slices[i].color === '#F8F8F8') slices[i].color = '#EAEAEA';
            else if (slices[i].color === '#C9A96E') slices[i].color = '#B89A61';
            else if (slices[i].color === '#B76E79') slices[i].color = '#A6636D';
        }
    }
    
    return slices;
}

function drawWheel(ctx, width, height) {
    ctx.clearRect(0, 0, width, height);
    
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - 5;
    
    const prizes = getWheelSlices();
    const arc = (2 * Math.PI) / prizes.length;

    prizes.forEach((prize, i) => {
        const angle = i * arc;

        // Dibujar segmento
        ctx.beginPath();
        ctx.fillStyle = prize.color;
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, angle, angle + arc);
        ctx.closePath();
        ctx.fill();

        // Borde del segmento
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Texto
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(angle + arc / 2);
        ctx.textAlign = 'right';
        ctx.fillStyle = prize.textColor;
        ctx.font = 'bold 11px Montserrat, sans-serif';

        // Texto envolvente si es muy largo
        const text = prize.text;
        const maxWidth = radius - 40;
        ctx.fillText(text, radius - 15, 4, maxWidth);

        ctx.restore();
    });

    // CÃ­rculo central
    ctx.beginPath();
    ctx.arc(centerX, centerY, 25, 0, 2 * Math.PI);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
    ctx.strokeStyle = '#C9A96E';
    ctx.lineWidth = 3;
    ctx.stroke();
}

function checkPlayReady() {
    const nombreInput = document.getElementById('nombrePaciente');
    const telefonoInput = document.getElementById('telefonoPaciente');
    const spinBtn = document.getElementById('spinBtn');
    
    if (!wheelUnlocked || !spinBtn || spinBtn.disabled) {
        spinBtn.classList.remove('ready-to-spin');
        return;
    }

    const isValidName = nombreInput && nombreInput.value.trim().length >= 3;
    const isValidPhone = telefonoInput && telefonoInput.value.trim().length >= 8;

    if (isValidName && isValidPhone) {
        spinBtn.classList.add('ready-to-spin');
    } else {
        spinBtn.classList.remove('ready-to-spin');
    }
}

function formatName(input) {
    // Capitalizar la primera letra de cada palabra
    let words = input.value.split(' ');
    for (let i = 0; i < words.length; i++) {
        if(words[i].length > 0) {
            words[i] = words[i][0].toUpperCase() + words[i].substr(1).toLowerCase();
        }
    }
    input.value = words.join(' ');
}

function initSecretUnlock() {
    const unlockBtn = document.getElementById('secretUnlock');
    const overlay = document.getElementById('ruletaOverlay');
    const spinBtn = document.getElementById('spinBtn');
    const nombreInput = document.getElementById('nombrePaciente');
    const telefonoInput = document.getElementById('telefonoPaciente');
    let clickCount = 0;
    let clickTimer;

    // Escuchar inputs para dar retroalimentación visual al botón y limpiar errores
    if(nombreInput) {
        nombreInput.addEventListener('input', () => {
            checkPlayReady();
        });
        nombreInput.addEventListener('blur', function() {
            formatName(this);
        });
    }
    if(telefonoInput) {
        telefonoInput.addEventListener('input', function(e) {
            // Forzar solo números y máximo 8 dígitos
            this.value = this.value.replace(/[^0-9]/g, '').slice(0, 8);
            checkPlayReady();
        });
    }

    if(unlockBtn) {
        unlockBtn.addEventListener('click', () => {
            clickCount++;
            clearTimeout(clickTimer);
            clickTimer = setTimeout(() => { clickCount = 0; }, 1000);
            
            if(clickCount >= 3) {
                const pass = prompt('Acceso Restringido: Ingrese la contraseña de la Dra. Carla Estrella:');
                if(pass === 'CMG2026') {
                    wheelUnlocked = true;
                    overlay.style.display = 'none';
                    spinBtn.disabled = false;
                    spinBtn.style.opacity = '1';
                    spinBtn.style.cursor = 'pointer';
                    spinBtn.classList.remove('disabled');
                    alert('Ruleta desbloqueada exitosamente.');
                    checkPlayReady(); // Verificar si ya hay datos
                }
                clickCount = 0;
            }
        });
    }
}

function spinWheel() {
    if (!wheelUnlocked) return;
    if (isSpinning) return;

    const wheel = document.querySelector('.ruleta-wheel');
    const spinBtn = document.getElementById('spinBtn');
    const nombreInput = document.getElementById('nombrePaciente');
    const telefonoInput = document.getElementById('telefonoPaciente');

    if (nombreInput && nombreInput.value.trim().length < 3) {
        alert('Por favor ingrese el nombre completo del paciente.');
        return;
    }
    
    if (telefonoInput && telefonoInput.value.trim().length !== 8) {
        alert('El celular debe tener exactamente 8 números (Ej. 71234567).');
        return;
    }

    isSpinning = true;
    spinBtn.disabled = true;
    spinBtn.querySelector('.spin-text').textContent = 'Girando...';
    spinBtn.classList.remove('ready-to-spin'); // Quitar latido

    // Reproducir sonido de casino (tics que desaceleran)
    playSound('spin');

    // Calcular rotaciÃ³n aleatoria y exacta
    const prizes = getWheelSlices();
    
    // Random selection among current wheel slices uniformly
    let randomPrize = Math.floor(Math.random() * prizes.length);
    
    const arc = 360 / prizes.length;

    // PosiciÃ³n del centro del premio
    const prizeAngle = randomPrize * arc + arc / 2;
    // Para que el centro del premio termine arriba (270 grados en un canvas estÃ¡ndar)
    const targetAngle = (270 - prizeAngle + 360) % 360;
    
    // Calcular cuÃ¡nto falta desde la rotaciÃ³n actual para llegar al Ã¡ngulo exacto
    const currentMod = currentRotation % 360;
    let diff = targetAngle - currentMod;
    if (diff < 0) diff += 360;

    const extraSpins = 5 + Math.floor(Math.random() * 3); // 5-7 vueltas completas
    const totalRotation = (extraSpins * 360) + diff;

    currentRotation += totalRotation;

    // AÃ±adir efecto visual de tensiÃ³n (zoom mientras gira)
    const ruletaWrapper = document.querySelector('.ruleta-wrapper');
    const ruletaRight = document.querySelector('.ruleta-right');
    if(ruletaWrapper) ruletaWrapper.classList.add('is-spinning');
    if(ruletaRight) ruletaRight.classList.add('focus-mode-fade');

    // Aplicar rotaciÃ³n
    wheel.style.transition = 'transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)';
    wheel.style.transform = `rotate(${currentRotation}deg)`;

    // Mostrar resultado despuÃ©s de la animaciÃ³n
    setTimeout(() => {
        if(ruletaWrapper) {
            ruletaWrapper.classList.remove('is-spinning');
            ruletaWrapper.classList.add('winner-flash');
            setTimeout(() => ruletaWrapper.classList.remove('winner-flash'), 2000);
        }
        if(ruletaRight) ruletaRight.classList.remove('focus-mode-fade');
        
        showResult(prizes[randomPrize]);
        isSpinning = false;
    }, 4000);
}

function showResult(prize) {
    const resultContainer = document.getElementById('resultContainer');
    const resultPrize = document.getElementById('resultPrize');
    const resultName = document.getElementById('resultName');
    const spinBtn = document.getElementById('spinBtn');
    const pacienteForm = document.getElementById('pacienteForm');
    const nombreInput = document.getElementById('nombrePaciente');
    const telefonoInput = document.getElementById('telefonoPaciente');

    const pacienteNombre = nombreInput ? nombreInput.value.trim() : 'Paciente';
    const pacientePhone = telefonoInput ? telefonoInput.value.replace(/\D/g, '') : ''; // Solo números

    // Guardar en localStorage como un array
    let savedData = localStorage.getItem(CONFIG.storageKey);
    let winnersList = [];
    try {
        winnersList = savedData ? JSON.parse(savedData) : [];
    } catch(e) {
        console.error(e);
        winnersList = [];
    }

    if (!Array.isArray(winnersList)) {
        winnersList = [winnersList];
    }
    
    const prizeData = {
        name: pacienteNombre,
        phone: pacientePhone,
        prize: prize.text,
        date: new Date().toISOString()
    };
    winnersList.push(prizeData);
    localStorage.setItem(CONFIG.storageKey, JSON.stringify(winnersList));

    // Mostrar resultado
    if (resultName) resultName.textContent = pacienteNombre;
    if (resultPrize) resultPrize.textContent = prize.text;
    
    // Configurar visualización
    if (pacienteForm) pacienteForm.style.display = 'none';
    if (resultContainer) {
        resultContainer.style.display = 'block';
        resultContainer.style.visibility = 'visible';
        resultContainer.style.opacity = '1';
        resultContainer.classList.add('show');
    }

    if (spinBtn) spinBtn.style.display = 'none';

    // Reproducir sonido de victoria espectacular
    playSound('win');
    
    // Confeti explota en pantalla:
    if(typeof confetti === 'function') {
        var duration = 3000;
        var end = Date.now() + duration;

        (function frame() {
            confetti({
                particleCount: 5,
                angle: 60,
                spread: 55,
                origin: { x: 0 },
                colors: ['#C9A96E', '#B76E79', '#FFFFFF']
            });
            confetti({
                particleCount: 5,
                angle: 120,
                spread: 55,
                origin: { x: 1 },
                colors: ['#C9A96E', '#B76E79', '#FFFFFF']
            });

            if (Date.now() < end) {
                requestAnimationFrame(frame);
            }
        }());
    }

    // Actualizar historial
    renderWinners();
}

function checkPreviousPlay() {
    renderWinners();
    
    const siguienteBtn = document.getElementById('siguienteBtn');
    if (siguienteBtn) {
        siguienteBtn.addEventListener('click', () => {
            const resultContainer = document.getElementById('resultContainer');
            const pacienteForm = document.getElementById('pacienteForm');
            const nombreInput = document.getElementById('nombrePaciente');
            const telefonoInput = document.getElementById('telefonoPaciente');
            const spinBtn = document.getElementById('spinBtn');
            
            // Ocultar resultado
            if (resultContainer) {
                resultContainer.style.display = 'none';
                resultContainer.classList.remove('show');
            }
            
            // Mostrar formulario y limpiar input
            if (pacienteForm) pacienteForm.style.display = 'block';
            if (nombreInput) nombreInput.value = '';
            if (telefonoInput) telefonoInput.value = '';
            
            // Restaurar botón de girar
            if (spinBtn) {
                spinBtn.style.display = 'block';
                spinBtn.disabled = false;
                spinBtn.querySelector('.spin-text').textContent = '¡Girar Ruleta!';
            }
            
            // Volver a dibujar la ruleta por si algún premio se agotó
            const canvas = document.getElementById('wheelCanvas');
            if (canvas) {
                const ctx = canvas.getContext('2d');
                const rect = canvas.getBoundingClientRect();
                drawWheel(ctx, rect.width, rect.height);
            }
        });
    }
}

function renderWinners() {
    const listContainer = document.getElementById('winnersList');
    const noMsg = document.getElementById('noWinnersMsg');
    const exportBtn = document.getElementById('exportCsvBtn');
    if (!listContainer) return;

    try {
        let savedData = localStorage.getItem(CONFIG.storageKey);
        let w = savedData ? JSON.parse(savedData) : [];
        if (!Array.isArray(w)) w = w ? [w] : [];

        if (w.length === 0) {
            if (noMsg) noMsg.style.display = 'block';
            if (exportBtn) exportBtn.style.display = 'none';
            listContainer.innerHTML = '';
            return;
        }

        if (noMsg) noMsg.style.display = 'none';
        if (exportBtn) exportBtn.style.display = 'block';
        listContainer.innerHTML = '';

        w.slice().reverse().forEach((winner, reversedIndex) => {
            const originalIndex = w.length - 1 - reversedIndex;
            const li = document.createElement('li');
            li.style.padding = '8px 12px';
            li.style.marginBottom = '5px';
            li.style.background = '#FFFFFF';
            li.style.borderRadius = '4px';
            li.style.borderLeft = '3px solid var(--color-gold)';
            li.style.display = 'flex';
            li.style.justifyContent = 'space-between';
            li.style.alignItems = 'center';
            
            const infoDiv = document.createElement('div');
            infoDiv.innerHTML = '<strong style="color:var(--color-dark);">' + (winner.name || 'Paciente') + '</strong><br><span style="color:var(--color-gold-dark);">' + winner.prize + '</span>';
            
            const actionDiv = document.createElement('div');
            actionDiv.style.display = 'flex';
            actionDiv.style.gap = '15px';
            actionDiv.style.alignItems = 'center';
            
            const editBtn = document.createElement('span');
            editBtn.innerHTML = '✏️';
            editBtn.style.cursor = 'pointer';
            editBtn.title = 'Editar celular';
            editBtn.style.fontSize = '1.1rem';
            editBtn.onclick = () => window.editWinnerPhone(originalIndex);
            
            const delBtn = document.createElement('span');
            delBtn.innerHTML = '🗑️';
            delBtn.style.cursor = 'pointer';
            delBtn.title = 'Eliminar';
            delBtn.style.fontSize = '1.1rem';
            delBtn.onclick = () => window.deleteWinner(originalIndex);
            
            actionDiv.appendChild(editBtn);
            actionDiv.appendChild(delBtn);
            li.appendChild(infoDiv);
            li.appendChild(actionDiv);
            
            listContainer.appendChild(li);
        });
    } catch (e) {
        console.error(e);
        localStorage.removeItem(CONFIG.storageKey);
    }
}

window.editWinnerPhone = function(index) {
    let savedData = localStorage.getItem(CONFIG.storageKey);
    if (!savedData) return;
    let w = JSON.parse(savedData);
    let phone = prompt('Editar celular (WhatsApp) de ' + w[index].name + ':', w[index].phone);
    if (phone !== null) {
        phone = phone.replace(/[^0-9]/g, '');
        if(phone.length === 8) {
            w[index].phone = phone;
            localStorage.setItem(CONFIG.storageKey, JSON.stringify(w));
            renderWinners();
        } else {
            alert('El celular debe tener exactamente 8 números.');
        }
    }
};

window.deleteWinner = function(index) {
    if(confirm('¿Estás seguro de eliminar este ganador? Esto borrará su victoria y le permitirá girar de nuevo.')) {
        let savedData = localStorage.getItem(CONFIG.storageKey);
        if (!savedData) return;
        let w = JSON.parse(savedData);
        w.splice(index, 1);
        localStorage.setItem(CONFIG.storageKey, JSON.stringify(w));
        renderWinners();
        
        // Volver a dibujar la ruleta
        const canvas = document.getElementById('wheelCanvas');
        if (canvas) {
            const ctx = canvas.getContext('2d');
            const rect = canvas.getBoundingClientRect();
            drawWheel(ctx, rect.width, rect.height);
        }
    }
};

function exportWinnersCSV() {
    const savedData = localStorage.getItem(CONFIG.storageKey);
    let data = savedData ? JSON.parse(savedData) : [];
    if (!Array.isArray(data)) data = [data];
    if (data.length === 0) return;

    let html = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="utf-8"></head><body>';
    html += '<table border="1"><tr><th style="background-color:#C9A96E;color:white;">Nombre</th><th style="background-color:#C9A96E;color:white;">Celular (WhatsApp)</th><th style="background-color:#C9A96E;color:white;">Premio</th><th style="background-color:#C9A96E;color:white;">Fecha y Hora</th></tr>';
    
    data.forEach(function(row) {
        const dateObj = new Date(row.date);
        const fechaFormat = dateObj.toLocaleDateString() + " " + dateObj.toLocaleTimeString();
        html += `<tr><td>${row.name}</td><td>${row.phone}</td><td>${row.prize}</td><td>${fechaFormat}</td></tr>`;
    });
    
    html += '</table></body></html>';

    const blob = new Blob(['\ufeff' + html], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const downloadLink = document.createElement("a");
    downloadLink.href = url;
    downloadLink.download = "Ganadores_CMG_Clinic.xls";
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
}

function shareOnWhatsApp() {
    let savedData = localStorage.getItem(CONFIG.storageKey);
    if (!savedData) return;

    let winnersList = JSON.parse(savedData);
    if (!Array.isArray(winnersList)) { winnersList = [winnersList]; }
    if (winnersList.length === 0) return;
    
    // Obtener el ganador más reciente
    const data = winnersList[winnersList.length - 1];
    
    const nombre = data.name || "El paciente";
    const telefonoRaw = data.phone || "";
    // Si escribió su número, usamos wa.me/591XXXXX directamente. Caso contrario abrimos WhatsApp genérico
    const telQuery = telefonoRaw ? `phone=591${telefonoRaw}&` : "";
    
    const message = `¡Hola ${nombre}! Gracias por acompañarnos en la Gran Inauguración de *CMG Dental Clinic*.\n\nTe enviamos tu pase ganador oficial de nuestra ruleta:\nPremio: *${data.prize}*\n\nGuarda la imagen que te adjuntaremos y muéstrala en tu próxima cita con la Dra. Carla Estrella para canjear tu premio.\n\n¡Nos vemos pronto y a seguir sonriendo!`;

    // Capturar la imagen del Vale de premio
    const premioTicket = document.getElementById('premioTicket');
    if (typeof html2canvas !== 'undefined' && premioTicket) {
        html2canvas(premioTicket, {backgroundColor: '#1A1A1A', scale: 3, useCORS: true}).then(canvas => {
            // 1. Descargar la imagen del vale a la computadora/celular
            const link = document.createElement('a');
            link.download = `Vale-Premio-CMG-${nombre.replace(/\s+/g, '-')}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
            
            // 2. Redirigir a WhatsApp medio segundo después
            setTimeout(() => {
                const encodedMessage = encodeURIComponent(message);
                window.open(`https://api.whatsapp.com/send?${telQuery}text=${encodedMessage}`, '_blank');
            }, 800);
        }).catch(err => {
            console.error("Error al generar imagen", err);
            const encodedMessage = encodeURIComponent(message);
            window.open(`https://api.whatsapp.com/send?${telQuery}text=${encodedMessage}`, '_blank');
        });
    } else {
        // Fallback si la librería no cargó
        const encodedMessage = encodeURIComponent(message);
        window.open(`https://api.whatsapp.com/send?${telQuery}text=${encodedMessage}`, '_blank');
    }
}

function playSound(type) {
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        
        const audioContext = new AudioContext();
        
        if (type === 'spin') {
            // Sonido de giro tipo rueda de fortuna (clics rítmicos)
            const tickCount = 20; 
            const duration = 4.0; // tiempo de la animación
            for(let i=0; i<tickCount; i++) {
                // Hacer que los clics se vayan espaciando (desacelerando)
                const normalized = i / (tickCount - 1);
                // curva cuadrática para que se ralentice
                const time = audioContext.currentTime + (duration * (normalized * normalized));
                
                const tickOsc = audioContext.createOscillator();
                const tickGain = audioContext.createGain();
                
                tickOsc.connect(tickGain);
                tickGain.connect(audioContext.destination);
                
                tickOsc.type = 'triangle';
                tickOsc.frequency.setValueAtTime(600, time);
                tickOsc.frequency.exponentialRampToValueAtTime(100, time + 0.05);
                
                tickGain.gain.setValueAtTime(0.5, time);
                tickGain.gain.exponentialRampToValueAtTime(0.01, time + 0.05);
                
                tickOsc.start(time);
                tickOsc.stop(time + 0.05);
            }
        } else if (type === 'win') {
            // Arpegio de victoria estilo casino
            const time = audioContext.currentTime;
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.type = 'sine';
            
            // Re-Mi-Sol-Do agudo (arpegio mayor)
            oscillator.frequency.setValueAtTime(392.00, time); // G4
            oscillator.frequency.setValueAtTime(523.25, time + 0.15); // C5
            oscillator.frequency.setValueAtTime(659.25, time + 0.3); // E5
            oscillator.frequency.setValueAtTime(1046.50, time + 0.45); // C6
            
            gainNode.gain.setValueAtTime(0, time);
            gainNode.gain.linearRampToValueAtTime(0.5, time + 0.05);
            gainNode.gain.setValueAtTime(0.5, time + 0.45);
            gainNode.gain.exponentialRampToValueAtTime(0.01, time + 1.2);
            
            oscillator.start(time);
            oscillator.stop(time + 1.5);
        }
    } catch (e) {
        // Silenciar errores de audio
        console.log('Audio de victoria silenciado o falló:', e);
    }
}

// ============================================
// ANIMACIONES AL SCROLL
// ============================================
function initScrollAnimations() {
    const elements = document.querySelectorAll('.animate-on-scroll');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    elements.forEach(el => observer.observe(el));
}

// ============================================
// CÃ“DIGO QR
// ============================================
function initQRCode() {
    const qrCanvas = document.getElementById('qrCode');


    // Generar QR con la librerÃ­a externa
    if (typeof QRCode !== 'undefined') {
        QRCode.toCanvas(qrCanvas, CONFIG.pageUrl, {
            width: 180,
            margin: 2,
            color: {
                dark: '#2C2C2C',
                light: '#FFFFFF'
            }
        }, (error) => {
            if (error) {
                console.error('Error generando QR:', error);
                // Fallback: usar API externa
                generateQRFallback();
            }
        });
    } else {
        generateQRFallback();
    }
}

function generateQRFallback() {
    // Fallback usando servicio externo si la librerÃ­a falla
    const qrCanvas = document.getElementById('qrCode');
    const ctx = qrCanvas.getContext('2d');
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = function() {
        qrCanvas.width = 180;
        qrCanvas.height = 180;
        ctx.drawImage(img, 0, 0, 180, 180);
    };
    img.src = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(CONFIG.pageUrl)}`;
}

// ============================================
// UTILIDADES
// ============================================

// FunciÃ³n para resetear la ruleta (Ãºtil para testing)
function resetRuleta() {
    localStorage.removeItem(CONFIG.storageKey);
    location.reload();
}

// Exponer funciÃ³n de reset para debugging
window.resetRuleta = resetRuleta;

// Detectar si es mÃ³vil
function isMobile() {
    return window.innerWidth <= 768;
}

// Throttle para optimizar eventos de scroll
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Aplicar throttle al scroll
window.addEventListener('scroll', throttle(() => {
    // Actualizar navbar ya estÃ¡ manejado en initNavigation
}, 100));

// ============================================
// PERFORMANCE
// ============================================

// Lazy load del mapa de Google
document.addEventListener('DOMContentLoaded', () => {
    const mapIframe = document.querySelector('.map-container iframe');
    if (mapIframe) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // El iframe ya tiene src, pero esto optimiza la carga
                    observer.unobserve(entry.target);
                }
            });
        }, { rootMargin: '200px' });

        observer.observe(mapIframe);
    }
});

// Service Worker para cache (opcional, para PWA)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Descomentar si quieres agregar soporte offline
        // navigator.serviceWorker.register('/sw.js');
    });
}

console.log('ðŸ¦· CMG Dental Clinic - AplicaciÃ³n cargada correctamente');
console.log('ðŸ’¡ Tip: Usa resetRuleta() en la consola para resetear la ruleta');
