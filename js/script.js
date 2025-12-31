// js/script.js - Portfolio Contact Form Handler
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ Portfolio script loaded');
    
    // ========================================
    // FORMULARIO DE CONTACTO
    // ========================================
    const contactForm = document.getElementById('contactForm');
    
    if (contactForm) {
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Obtener valores del formulario
            const name = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            const service = document.getElementById('service').value;
            const message = document.getElementById('message').value.trim();
            
            // Validación básica
            if (!name || !email || !service || !message) {
                showAlert('⚠️ Por favor completa todos los campos', 'warning');
                return;
            }
            
            // Validar email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                showAlert('⚠️ Por favor ingresa un email válido', 'warning');
                return;
            }
            
            // Deshabilitar botón y mostrar loading
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
            
            try {
                // URL de tu API Backend
                const API_URL = 'https://api.store-odoo.com/api/send-contact';
                
                console.log('📤 Enviando mensaje a:', API_URL);
                
                // Preparar datos
                const formData = {
                    name: name,
                    email: email,
                    service: service,
                    message: `[Servicio: ${getServiceName(service)}]\n\n${message}`
                };
                
                console.log('📋 Datos:', formData);
                
                // Enviar solicitud
                const response = await fetch(API_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });
                
                console.log('📥 Respuesta recibida:', response.status);
                
                const data = await response.json();
                console.log('📊 Datos respuesta:', data);
                
                if (response.ok && data.success) {
                    // ✅ Éxito
                    showAlert('✅ ¡Mensaje enviado exitosamente! Te contactaré pronto por Telegram.', 'success');
                    contactForm.reset();
                    
                    // Google Analytics (opcional)
                    if (typeof gtag !== 'undefined') {
                        gtag('event', 'form_submit', {
                            'event_category': 'Contact',
                            'event_label': service
                        });
                    }
                } else {
                    throw new Error(data.error || 'Error al enviar el mensaje');
                }
                
            } catch (error) {
                console.error('❌ Error:', error);
                showAlert(
                    '❌ Error al enviar el mensaje. Por favor, intenta de nuevo o escríbeme directamente a: lowcodeperu24@gmail.com',
                    'error'
                );
            } finally {
                // Rehabilitar botón
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
            }
        });
    }
    
    // ========================================
    // MENÚ MÓVIL
    // ========================================
    const menuToggle = document.getElementById('menuToggle');
    const headerNav = document.getElementById('headerNav');
    
    if (menuToggle && headerNav) {
        menuToggle.addEventListener('click', function() {
            headerNav.classList.toggle('header__nav--open');
            
            // Cambiar icono
            const icon = menuToggle.querySelector('i');
            if (headerNav.classList.contains('header__nav--open')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
        
        // Cerrar menú al hacer click en un link
        const navLinks = headerNav.querySelectorAll('.header__link');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                headerNav.classList.remove('header__nav--open');
                const icon = menuToggle.querySelector('i');
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            });
        });
    }
    
    // ========================================
    // SMOOTH SCROLL
    // ========================================
    const links = document.querySelectorAll('a[href^="#"]');
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href !== '#') {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    const headerHeight = document.querySelector('.header').offsetHeight;
                    const targetPosition = target.offsetTop - headerHeight;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
    
    // ========================================
    // ANIMACIÓN AL SCROLL (opcional)
    // ========================================
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observar elementos que queremos animar
    const animatedElements = document.querySelectorAll('.skill-card, .ai-project-card, .work-card');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
    
    // ========================================
    // FUNCIONES AUXILIARES
    // ========================================
    
    /**
     * Mostrar alerta personalizada
     */
    function showAlert(message, type = 'info') {
        // Eliminar alertas anteriores
        const existingAlert = document.querySelector('.custom-alert');
        if (existingAlert) {
            existingAlert.remove();
        }
        
        // Crear alerta
        const alert = document.createElement('div');
        alert.className = `custom-alert custom-alert--${type}`;
        alert.innerHTML = `
            <div class="custom-alert__content">
                <span class="custom-alert__message">${message}</span>
                <button class="custom-alert__close">&times;</button>
            </div>
        `;
        
        // Agregar al body
        document.body.appendChild(alert);
        
        // Mostrar con animación
        setTimeout(() => {
            alert.classList.add('custom-alert--show');
        }, 10);
        
        // Cerrar al hacer click en X
        const closeBtn = alert.querySelector('.custom-alert__close');
        closeBtn.addEventListener('click', () => {
            closeAlert(alert);
        });
        
        // Auto-cerrar después de 5 segundos
        setTimeout(() => {
            closeAlert(alert);
        }, 5000);
    }
    
    /**
     * Cerrar alerta con animación
     */
    function closeAlert(alert) {
        alert.classList.remove('custom-alert--show');
        setTimeout(() => {
            alert.remove();
        }, 300);
    }
    
    /**
     * Obtener nombre del servicio
     */
    function getServiceName(serviceValue) {
        const services = {
            'odoo': 'Desarrollo Odoo',
            'ai': 'Agentes AI',
            'automation': 'Automatización',
            'vps': 'Implementación VPS',
            'other': 'Otro'
        };
        return services[serviceValue] || serviceValue;
    }
    
    // ========================================
    // HEADER STICKY CON SHADOW
    // ========================================
    const header = document.querySelector('.header');
    if (header) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 50) {
                header.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
            } else {
                header.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.05)';
            }
        });
    }
    
    console.log('🎯 Script inicializado completamente');
});