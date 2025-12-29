// ✅ URL DEFINITIVA Y FINAL con HTTPS
const API_URL = 'https://api-portfolio.odoo-experto.info/api/send-contact';

// Código optimizado para producción
document.querySelector('#formulario-contacto')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const form = this;
    const formData = new FormData(form);
    const nombre = form.querySelector('input[type="text"]').value.trim();
    const email = form.querySelector('input[type="email"]').value.trim();
    const mensaje = form.querySelector('textarea').value.trim();
    const submitBtn = form.querySelector('button[type="submit"]');
    
    // Validación
    if (!nombre || !email || !mensaje) {
        alert('Por favor completa todos los campos');
        return;
    }
    
    // Estado de carga
    submitBtn.textContent = 'Enviando...';
    submitBtn.disabled = true;
    
    try {
        console.log('🚀 Enviando a:', API_URL);
        
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: nombre,
                email: email,
                message: mensaje
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // ✅ ÉXITO
            mostrarNotificacion('success', '🎉 ' + (data.message || '¡Mensaje enviado!'));
            form.reset();
            
            // Track event si tienes analytics
            if (typeof gtag !== 'undefined') {
                gtag('event', 'contact_form_submit', {
                    'event_category': 'engagement',
                    'event_label': 'portfolio_contact'
                });
            }
            
        } else {
            // ❌ ERROR
            mostrarNotificacion('error', '❌ ' + (data.error || 'Error al enviar'));
        }
        
    } catch (error) {
        console.error('Error:', error);
        mostrarNotificacion('error', '❌ Error de conexión. Intenta de nuevo.');
    } finally {
        submitBtn.textContent = 'Enviar Mensaje';
        submitBtn.disabled = false;
    }
});

// Función para mostrar notificaciones elegantes
function mostrarNotificacion(tipo, mensaje) {
    // Remover notificaciones anteriores
    document.querySelectorAll('.notificacion-flotante').forEach(el => el.remove());
    
    const notificacion = document.createElement('div');
    notificacion.className = `notificacion-flotante ${tipo}`;
    notificacion.innerHTML = `
        <div style="
            background: ${tipo === 'success' ? '#10b981' : '#ef4444'};
            color: white;
            padding: 16px 24px;
            border-radius: 12px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.1);
            display: flex;
            align-items: center;
            gap: 12px;
            font-size: 15px;
            font-weight: 500;
            animation: slideIn 0.3s ease-out;
            position: fixed;
            top: 30px;
            right: 30px;
            z-index: 9999;
            max-width: 400px;
        ">
            <div style="font-size: 20px;">
                ${tipo === 'success' ? '✅' : '❌'}
            </div>
            <div>${mensaje}</div>
        </div>
    `;
    
    document.body.appendChild(notificacion);
    
    // Auto-remover después de 5 segundos
    setTimeout(() => {
        notificacion.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => notificacion.remove(), 300);
    }, 5000);
}

// Añadir estilos de animación
const estilos = document.createElement('style');
estilos.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(estilos);