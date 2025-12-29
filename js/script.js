// Smooth scrolling para navegación
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Efecto de header al hacer scroll
window.addEventListener('scroll', function() {
    const header = document.querySelector('.header');
    if (window.scrollY > 100) {
        header.style.background = 'rgba(255, 255, 255, 0.95)';
        header.style.backdropFilter = 'blur(10px)';
    } else {
        header.style.background = 'var(--white)';
        header.style.backdropFilter = 'none';
    }
});

// FORMULARIO DE CONTACTO - CONEXIÓN A TU API VPS
document.querySelector('.contact-form')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    console.log('📝 Formulario enviado');
    
    // Obtener elementos del formulario
    const nameInput = this.querySelector('input[type="text"]');
    const emailInput = this.querySelector('input[type="email"]');
    const messageInput = this.querySelector('textarea');
    const submitBtn = this.querySelector('button[type="submit"]');
    
    if (!nameInput || !emailInput || !messageInput || !submitBtn) {
        alert('❌ Error en el formulario');
        return;
    }
    
    // Validar campos
    const nombre = nameInput.value.trim();
    const email = emailInput.value.trim();
    const mensaje = messageInput.value.trim();
    
    if (!nombre) {
        alert('❌ Por favor, ingresa tu nombre');
        nameInput.focus();
        return;
    }
    
    if (!email || !email.includes('@')) {
        alert('❌ Por favor, ingresa un email válido');
        emailInput.focus();
        return;
    }
    
    if (!mensaje) {
        alert('❌ Por favor, escribe un mensaje');
        messageInput.focus();
        return;
    }
    
    // Mostrar estado de carga
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Enviando...';
    submitBtn.disabled = true;
    
    // Datos a enviar
    const formData = {
        name: nombre,
        email: email,
        message: mensaje
    };
    
    console.log('📤 Datos a enviar:', formData);
    
    try {
        // URL de tu API en el VPS - ¡IMPORTANTE! Esta es tu IP
        const API_URL = 'http://23.239.19.82:5001/api/send-contact';
        
        console.log('🌐 Conectando a:', API_URL);
        
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });
        
        console.log('📡 Estado de respuesta:', response.status);
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('📥 Respuesta:', result);
        
        if (result.success) {
            alert(result.message || '✅ ¡Mensaje enviado correctamente!');
            this.reset(); // Limpiar formulario
            
            // También puedes mostrar un mensaje en la página
            const successMessage = document.createElement('div');
            successMessage.style.cssText = `
                background: #10b981;
                color: white;
                padding: 15px;
                border-radius: 5px;
                margin-top: 20px;
                text-align: center;
            `;
            successMessage.textContent = '✅ Mensaje enviado exitosamente';
            
            // Insertar después del formulario
            this.parentNode.insertBefore(successMessage, this.nextSibling);
            
            // Eliminar mensaje después de 5 segundos
            setTimeout(() => {
                successMessage.remove();
            }, 5000);
            
        } else {
            alert(`❌ ${result.error || 'Error al enviar el mensaje'}`);
        }
        
    } catch (error) {
        console.error('❌ Error:', error);
        alert('❌ Error de conexión. Por favor, inténtalo de nuevo más tarde.');
    } finally {
        // Restaurar botón
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
});

// Animación de elementos al hacer scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observar elementos para animación
document.addEventListener('DOMContentLoaded', function() {
    const animatedElements = document.querySelectorAll('.project-card, .skill-category');
    
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});

// Highlight de navegación activa
function highlightActiveNav() {
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav a');
    
    window.addEventListener('scroll', () => {
        let current = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            
            if (scrollY >= (sectionTop - 200)) {
                current = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });
}

// Inicializar funciones
document.addEventListener('DOMContentLoaded', function() {
    highlightActiveNav();
    document.querySelector('.nav a')?.classList.add('active');
});