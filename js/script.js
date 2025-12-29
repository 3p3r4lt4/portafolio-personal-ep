// ✅ URL FINAL Y DEFINITIVA para producción
const API_URL = 'https://api-portfolio.odoo-experto.info/api/send-contact';

// Código completo mejorado
document.querySelector('#formulario-contacto')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Obtener valores
    const form = this;
    const nombre = form.querySelector('input[type="text"]').value.trim();
    const email = form.querySelector('input[type="email"]').value.trim();
    const mensaje = form.querySelector('textarea').value.trim();
    const submitBtn = form.querySelector('button[type="submit"]');
    
    // Validación
    if (!nombre || !email || !mensaje) {
        mostrarError('Por favor completa todos los campos');
        return;
    }
    
    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        mostrarError('Por favor ingresa un email válido');
        return;
    }
    
    // Estado de carga
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Enviando...';
    submitBtn.disabled = true;
    
    try {
        console.log('📤 Enviando formulario a:', API_URL);
        
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                name: nombre,
                email: email,
                message: mensaje
            })
        });
        
        console.log('📡 Estado:', response.status);
        
        const data = await response.json();
        
        if (data.success) {
            mostrarExito(data.message || '✅ ¡Mensaje enviado correctamente!');
            form.reset(); // Limpiar formulario
            
            // Opcional: Enviar evento a Google Analytics
            if (typeof gtag !== 'undefined') {
                gtag('event', 'form_submit', {
                    'event_category': 'contacto',
                    'event_label': 'formulario_portafolio'
                });
            }
            
        } else {
            mostrarError(data.error || 'Error al enviar el mensaje');
        }
        
    } catch (error) {
        console.error('❌ Error de conexión:', error);
        mostrarError('Error de conexión. Por favor, inténtalo de nuevo.');
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
});

// Funciones auxiliares
function mostrarExito(mensaje) {
    // Eliminar mensajes anteriores
    document.querySelectorAll('.alert-message').forEach(el => el.remove());
    
    const alerta = document.createElement('div');
    alerta.className = 'alert-message success';
    alerta.innerHTML = `
        <div style="
            background: linear-gradient(135deg, #10b981, #059669);
            color: white;
            padding: 20px;
            border-radius: 10px;
            margin: 20px 0;
            text-align: center;
            box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
            animation: fadeInUp 0.5s ease-out;
        ">
            <div style="font-size: 24px; margin-bottom: 10px;">🎉</div>
            <strong style="font-size: 16px;">${mensaje}</strong>
            <div style="font-size: 14px; opacity: 0.9; margin-top: 8px;">
                Te responderé pronto a tu email
            </div>
        </div>
    `;
    
    const form = document.querySelector('#formulario-contacto');
    form.parentNode.insertBefore(alerta, form.nextSibling);
    
    setTimeout(() => {
        alerta.style.opacity = '0';
        alerta.style.transform = 'translateY(-10px)';
        alerta.style.transition = 'all 0.5s ease';
        setTimeout(() => alerta.remove(), 500);
    }, 6000);
}

function mostrarError(mensaje) {
    const alerta = document.createElement('div');
    alerta.className = 'alert-message error';
    alerta.innerHTML = `
        <div style="
            background: #ef4444;
            color: white;
            padding: 15px;
            border-radius: 8px;
            margin: 15px 0;
            text-align: center;
            animation: fadeIn 0.3s ease;
        ">
            ❌ ${mensaje}
        </div>
    `;
    
    const form = document.querySelector('#formulario-contacto');
    form.parentNode.insertBefore(alerta, form.nextSibling);
    
    setTimeout(() => alerta.remove(), 5000);
}

// Añadir estilos CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    
    .alert-message {
        animation: fadeInUp 0.5s ease-out;
    }
`;
document.head.appendChild(style);