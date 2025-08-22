// Portfolio - José Guizado | Analista de Sistemas
// Script principal para funcionalidades del portfolio

// Configuración de Google Sheets para likes
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzyNvxO6gd_e3LdghgcrFssq-i17kR3CihOKETyC7FkhmolQ1NEY8cuNOO4FuNoOt82/exec';

document.addEventListener('DOMContentLoaded', function () {
    // Suprimir errores específicos de Power BI y Application Insights
    const originalConsoleError = console.error;
    const originalConsoleWarn = console.warn;

    // Lista de errores comunes de Power BI que podemos ignorar
    const ignoredErrors = [
        'Permissions policy violation: unload is not allowed',
        'Access to XMLHttpRequest at \'https://dc.services.visualstudio.com/v2/track\'',
        'CORS policy: Response to preflight request',
        'POST https://dc.services.visualstudio.com/v2/track net::ERR_FAILED'
    ];

    console.error = function (...args) {
        const message = args.join(' ');
        if (!ignoredErrors.some(error => message.includes(error))) {
            originalConsoleError.apply(console, args);
        }
    };

    console.warn = function (...args) {
        const message = args.join(' ');
        if (!ignoredErrors.some(error => message.includes(error))) {
            originalConsoleWarn.apply(console, args);
        }
    };

    // Manejo global de errores no capturados
    window.addEventListener('error', function (event) {
        // Filtrar errores de recursos externos (Power BI, CDNs, etc.)
        if (event.filename && (
            event.filename.includes('powerbi.com') ||
            event.filename.includes('visualstudio.com') ||
            event.filename.includes('reportembed') ||
            event.filename.includes('application-insights')
        )) {
            event.preventDefault();
            return true;
        }

        // Filtrar mensajes específicos de Power BI
        if (event.message && ignoredErrors.some(error => event.message.includes(error))) {
            event.preventDefault();
            return true;
        }
    });

    // Manejo de errores de recursos (CSS, JS, imágenes que fallan)
    window.addEventListener('unhandledrejection', function (event) {
        const reason = event.reason?.message || event.reason || '';
        if (ignoredErrors.some(error => reason.includes(error))) {
            event.preventDefault();
        }
    });

    // Inicializar contador de likes al cargar la página
    loadLikesCount();

    // Inicializar funcionalidades
    initializeNavigation();
    initializeScrollBehavior();
    initializeFullscreenModal();
    initializeFloatingButtons();
    initializeTheme();

    // Año dinámico en el footer
    const currentYearElement = document.getElementById('currentYear');
    if (currentYearElement) {
        currentYearElement.textContent = new Date().getFullYear();
    }
});

// Navegación suave
function initializeNavigation() {
    // Smooth scrolling para enlaces de navegación
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });

                // Actualizar enlace activo
                updateActiveNavLink(this.getAttribute('href'));
            }
        });
    });

    // Actualizar enlace activo en scroll
    window.addEventListener('scroll', updateActiveNavOnScroll, { passive: true });
}

function updateActiveNavLink(targetHref) {
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });

    const activeLink = document.querySelector(`.nav-link[href="${targetHref}"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    }
}

function updateActiveNavOnScroll() {
    const sections = document.querySelectorAll('section[id]');
    const scrollPos = window.scrollY + 100;

    sections.forEach(section => {
        const top = section.offsetTop;
        const bottom = top + section.offsetHeight;
        const id = section.getAttribute('id');

        if (scrollPos >= top && scrollPos <= bottom) {
            updateActiveNavLink(`#${id}`);
        }
    });
}

// Comportamiento de scroll
function initializeScrollBehavior() {
    let lastScrollY = window.scrollY;
    let ticking = false;

    function updateScrollBehavior() {
        const currentScrollY = window.scrollY;
        const navbar = document.querySelector('.navbar');
        const scrollTopBtn = document.getElementById('scrollToTopBtn');
        const likeBtn = document.getElementById('likeBtn');

        // Efecto navbar
        if (navbar) {
            if (currentScrollY > 100) {
                navbar.style.background = 'linear-gradient(135deg, #212529 0%, #495057 100%)';
                navbar.style.backdropFilter = 'blur(10px)';
            } else {
                navbar.style.background = 'linear-gradient(135deg, #212529 0%, #495057 100%)';
                navbar.style.backdropFilter = 'none';
            }
        }

        // Mostrar/ocultar botón de scroll to top y posicionar botón de like
        const shouldShowScrollTop = currentScrollY > 300;

        if (scrollTopBtn) {
            if (shouldShowScrollTop) {
                scrollTopBtn.style.opacity = '1';
                scrollTopBtn.style.visibility = 'visible';
                scrollTopBtn.style.transform = 'translateY(0)';
            } else {
                scrollTopBtn.style.opacity = '0';
                scrollTopBtn.style.visibility = 'hidden';
                scrollTopBtn.style.transform = 'translateY(20px)';
            }
        }

        // Posicionar botón de "Me gusta" según visibilidad del botón de "subir"
        if (likeBtn) {
            if (shouldShowScrollTop) {
                // Botón de subir visible - like button en su posición original (arriba)
                likeBtn.classList.remove('moved-down');
            } else {
                // Botón de subir oculto - like button baja usando la clase CSS
                likeBtn.classList.add('moved-down');
            }
        }

        lastScrollY = currentScrollY;
        ticking = false;
    }

    function requestScrollUpdate() {
        if (!ticking) {
            requestAnimationFrame(updateScrollBehavior);
            ticking = true;
        }
    }

    window.addEventListener('scroll', requestScrollUpdate, { passive: true });
    updateScrollBehavior(); // Inicializar
}

// Modal de pantalla completa para Power BI
function initializeFullscreenModal() {
    const fullscreenBtn = document.getElementById('fullscreenBtn');
    const minimizeBtn = document.getElementById('minimizeBtn');
    const exitFullscreenBtn = document.getElementById('exitFullscreenBtn');
    const fullscreenOverlay = document.getElementById('fullscreenOverlay');
    const fullscreenFrame = document.getElementById('fullscreenFrame');
    const powerBIFrame = document.getElementById('powerBIFrame');
    const modalHeader = document.getElementById('modalHeader');
    const modalBody = document.getElementById('modalBody');

    if (fullscreenBtn && fullscreenOverlay && fullscreenFrame && powerBIFrame) {
        fullscreenBtn.addEventListener('click', function () {
            const originalSrc = powerBIFrame.src;
            fullscreenFrame.src = originalSrc;
            fullscreenOverlay.style.display = 'flex';
            document.body.style.overflow = 'hidden';

            if (modalHeader) modalHeader.style.display = 'none';
            if (modalBody) modalBody.style.display = 'none';
            if (minimizeBtn) minimizeBtn.style.display = 'inline-block';
            fullscreenBtn.style.display = 'none';
        });

        if (exitFullscreenBtn) {
            exitFullscreenBtn.addEventListener('click', exitFullscreen);
        }

        if (minimizeBtn) {
            minimizeBtn.addEventListener('click', exitFullscreen);
        }

        function exitFullscreen() {
            fullscreenOverlay.style.display = 'none';
            document.body.style.overflow = '';
            fullscreenFrame.src = '';

            if (modalHeader) modalHeader.style.display = 'flex';
            if (modalBody) modalBody.style.display = 'block';
            if (minimizeBtn) minimizeBtn.style.display = 'none';
            fullscreenBtn.style.display = 'inline-block';
        }

        // Cerrar con ESC
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && fullscreenOverlay.style.display === 'flex') {
                exitFullscreen();
            }
        });
    }
}

// Botones flotantes
function initializeFloatingButtons() {
    const scrollTopBtn = document.getElementById('scrollToTopBtn');
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    const likeBtn = document.getElementById('likeBtn');

    if (scrollTopBtn) {
        scrollTopBtn.addEventListener('click', scrollToTop);
    }

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', toggleTheme);
    }

    if (likeBtn) {
        // Agregar animación visual y notificación al botón de like
        likeBtn.addEventListener('click', async function () {
            // Animación simple de clic
            likeBtn.classList.add('clicked');
            setTimeout(() => {
                likeBtn.classList.remove('clicked');
            }, 600);

            // Crear corazones que salen del centro
            createFloatingHearts(likeBtn);

            // Mostrar notificación inmediatamente
            showLikeNotification();

            // Actualizar contador optimísticamente (respuesta inmediata)
            const currentCounter = document.querySelector('.like-counter');
            if (currentCounter) {
                // Si hay un loader, obtener 0 como valor base, sino obtener el número actual
                const hasLoader = currentCounter.querySelector('.loader');
                const currentValue = hasLoader ? 0 : (parseInt(currentCounter.textContent) || 0);
                updateLikeCounter(currentValue + 1);
            }

            // Agregar like a Google Sheets en segundo plano
            addLike().catch(() => {
                // Si falla, revertir el contador
                if (currentCounter) {
                    const currentValue = parseInt(currentCounter.textContent) || 1;
                    updateLikeCounter(Math.max(0, currentValue - 1));
                }
            });
        });
    }
}

function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Sistema de temas
function initializeTheme() {
    const savedTheme = localStorage.getItem('portfolioTheme') || 'light';
    const themeIcon = document.querySelector('#themeToggleBtn i');

    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
        if (themeIcon) themeIcon.className = 'fas fa-sun';
    } else {
        if (themeIcon) themeIcon.className = 'fas fa-moon';
    }
}

function toggleTheme() {
    const body = document.body;
    const themeIcon = document.querySelector('#themeToggleBtn i');

    body.classList.toggle('dark-theme');

    const isDark = body.classList.contains('dark-theme');
    localStorage.setItem('portfolioTheme', isDark ? 'dark' : 'light');

    if (themeIcon) {
        themeIcon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
    }
}

// Función para mostrar notificación de "Me gusta"
function showLikeNotification() {
    // Mensajes aleatorios para variedad
    const messages = [
        '¡Gracias por tu me gusta! 💖',
        '¡Me alegra que te guste! ✨',
        '¡Muchas gracias! 🙌',
        '¡Eso me motiva mucho! 🚀',
        '¡Gracias por el apoyo! 🌟'
    ];

    const randomMessage = messages[Math.floor(Math.random() * messages.length)];

    // Calcular posición debajo del navbar
    const navbar = document.querySelector('.navbar');
    const navbarHeight = navbar ? navbar.offsetHeight : 70; // Altura por defecto si no encuentra el navbar
    const topPosition = navbarHeight + 20; // 20px de margen adicional

    // Crear elemento de notificación
    const notification = document.createElement('div');
    notification.className = 'like-notification';
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-heart notification-icon"></i>
            <span class="notification-text">${randomMessage}</span>
        </div>
    `;

    // Estilos inline para la notificación
    Object.assign(notification.style, {
        position: 'fixed',
        top: `${topPosition}px`,
        right: '20px',
        background: 'linear-gradient(135deg, #ff6b6b, #ee5a52)',
        color: 'white',
        padding: '15px 20px',
        borderRadius: '12px',
        boxShadow: '0 8px 32px rgba(255, 107, 107, 0.3)',
        zIndex: '10000',
        fontSize: '14px',
        fontWeight: '500',
        transform: 'translateX(100%) scale(0.8)',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        maxWidth: '280px',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)'
    });

    // Estilos para el contenido
    const content = notification.querySelector('.notification-content');
    Object.assign(content.style, {
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
    });

    const icon = notification.querySelector('.notification-icon');
    Object.assign(icon.style, {
        fontSize: '16px',
        animation: 'pulse 0.6s ease-in-out'
    });

    const text = notification.querySelector('.notification-text');
    Object.assign(text.style, {
        lineHeight: '1.4'
    });

    document.body.appendChild(notification);

    // Animar entrada
    setTimeout(() => {
        notification.style.transform = 'translateX(0) scale(1)';
    }, 100);

    // Animar salida después de 3 segundos
    setTimeout(() => {
        notification.style.transform = 'translateX(100%) scale(0.8)';
        notification.style.opacity = '0';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 400);
    }, 3000);

    // Agregar animación CSS para el pulso del corazón
    if (!document.querySelector('#pulse-animation')) {
        const style = document.createElement('style');
        style.id = 'pulse-animation';
        style.textContent = `
            @keyframes pulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.2); }
            }
        `;
        document.head.appendChild(style);
    }
}

// Función para mostrar notificación de error
function showErrorNotification() {
    const notification = document.createElement('div');
    notification.className = 'like-notification';
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-exclamation-triangle notification-icon"></i>
            <span class="notification-text">Error al registrar el like. Inténtalo de nuevo.</span>
        </div>
    `;

    // Calcular posición debajo del navbar
    const navbar = document.querySelector('.navbar');
    const navbarHeight = navbar ? navbar.offsetHeight : 70;
    const topPosition = navbarHeight + 20;

    Object.assign(notification.style, {
        position: 'fixed',
        top: `${topPosition}px`,
        right: '20px',
        background: 'linear-gradient(135deg, #ff4444, #cc0000)',
        color: 'white',
        padding: '15px 20px',
        borderRadius: '12px',
        boxShadow: '0 8px 32px rgba(255, 68, 68, 0.3)',
        zIndex: '10000',
        fontSize: '14px',
        fontWeight: '500',
        transform: 'translateX(100%) scale(0.8)',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        opacity: '0'
    });

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.transform = 'translateX(0) scale(1)';
        notification.style.opacity = '1';
    }, 100);

    setTimeout(() => {
        notification.style.transform = 'translateX(100%) scale(0.8)';
        notification.style.opacity = '0';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 400);
    }, 3000);
}

// Función para crear corazones flotantes
function createFloatingHearts(button) {
    const numHearts = 10; // Número de corazones
    const buttonRect = button.getBoundingClientRect();
    const centerX = buttonRect.left + buttonRect.width / 2;
    const centerY = buttonRect.top + buttonRect.height / 2;

    for (let i = 0; i < numHearts; i++) {
        const heart = document.createElement('div');
        heart.innerHTML = '♥';
        heart.className = 'floating-heart';

        // Posición inicial en el centro del botón
        heart.style.cssText = `
            position: fixed;
            left: ${centerX}px;
            top: ${centerY}px;
            color: #ff6b6b;
            font-size: 20px;
            pointer-events: none;
            z-index: 10000;
            transform: translate(-50%, -50%) scale(0);
            opacity: 1;
            font-weight: bold;
            text-shadow: 0 0 10px rgba(255, 107, 107, 0.5);
        `;

        document.body.appendChild(heart);

        // Animación con direcciones aleatorias
        const angle = (i * (360 / numHearts)) + Math.random() * 60 - 30; // Distribución circular con variación
        const distance = 80 + Math.random() * 40; // Distancia aleatoria
        const duration = 800 + Math.random() * 400; // Duración aleatoria

        const radians = (angle * Math.PI) / 180;
        const endX = centerX + Math.cos(radians) * distance;
        const endY = centerY + Math.sin(radians) * distance;

        // Animación del corazón
        heart.animate([
            {
                transform: 'translate(-50%, -50%) scale(0)',
                opacity: 1
            },
            {
                transform: 'translate(-50%, -50%) scale(1.2)',
                opacity: 0.8,
                offset: 0.3
            },
            {
                left: `${endX}px`,
                top: `${endY}px`,
                transform: 'translate(-50%, -50%) scale(0.5)',
                opacity: 0
            }
        ], {
            duration: duration,
            easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            fill: 'forwards'
        }).onfinish = () => {
            if (heart.parentNode) {
                heart.parentNode.removeChild(heart);
            }
        };
    }
}

// Funciones para manejar likes con Google Sheets
async function loadLikesCount() {
    try {
        const formData = new FormData();
        formData.append('action', 'getLikes');

        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            body: formData,
            mode: 'cors'
        });

        const text = await response.text();
        const data = JSON.parse(text);

        if (data.success) {
            updateLikeCounter(data.totalLikes);
        } else {
            updateLikeCounter(0);
        }
    } catch (error) {
        // Si hay error, mostrar 0
        updateLikeCounter(0);
    }
}

async function addLike() {
    try {
        const formData = new FormData();
        formData.append('action', 'addLike');

        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            body: formData,
            mode: 'cors'
        });

        const text = await response.text();
        const data = JSON.parse(text);

        if (data.success) {
            // Sincronizar con el valor real de Google Sheets
            updateLikeCounter(data.totalLikes);
            return true;
        } else {
            throw new Error('Error en respuesta del servidor');
        }
    } catch (error) {
        throw error; // Propagar el error para manejo en el click
    }
}

function updateLikeCounter(count) {
    const counter = document.querySelector('.like-counter');
    if (counter) {
        // Remover el loader si existe y mostrar el número
        counter.innerHTML = count;
    }
}
