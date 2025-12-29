// ============ URL DEFINITIVA PARA PRODUCCIÓN ============
const API_URL = 'https://api-portfolio.odoo-experto.info/api/send-contact';
// =======================================================

// FORMULARIO DE CONTACTO - CONEXIÓN A API
document.getElementById('formulario-contacto')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    console.log('🚀 Iniciando envío de formulario...');
    
    // Obtener elementos
    const form = this;
    const nombre = form.querySelector('input[type="text"]').value.trim();
    const email = form.querySelector('input[type="email"]').value.trim();
    const mensaje = form.querySelector('textarea').value.trim();
    const submitBtn = form.querySelector('button[type="submit"]');
    
    // Validación básica
    if (!nombre || !email || !mensaje) {
        mostrarNotificacion('error', '❌ Por favor completa todos los campos');
        return;
    }
    
    // Validar email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        mostrarNotificacion('error', '❌ Por favor ingresa un email válido');
        return;
    }
    
    // Estado de carga
    const originalText = submitBtn.textContent;
    submitBtn.innerHTML = '<span class="loading">⏳ Enviando...</span>';
    submitBtn.disabled = true;
    
    try {
        console.log('📤 Enviando datos a:', API_URL);
        console.log('📝 Datos:', { nombre, email, mensaje });
        
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
        
        console.log('📡 Estado de respuesta:', response.status);
        console.log('📡 Headers:', Object.fromEntries(response.headers.entries()));
        
        // Primero obtenemos el texto de la respuesta
        const responseText = await response.text();
        console.log('📡 Respuesta cruda:', responseText.substring(0, 200) + (responseText.length > 200 ? '...' : ''));
        
        // Intentar parsear como JSON
        let data;
        try {
            data = JSON.parse(responseText);
            console.log('✅ Respuesta parseada como JSON:', data);
        } catch (jsonError) {
            console.error('❌ No se pudo parsear como JSON:', jsonError);
            
            // Si la respuesta es exitosa pero no es JSON
            if (response.ok) {
                mostrarNotificacion('success', '🎉 ¡Mensaje enviado correctamente!');
                form.reset();
                return;
            } else {
                // Si hay error y no es JSON
                throw new Error(`Respuesta no JSON: ${responseText.substring(0, 100)}`);
            }
        }
        
        // Ahora procesamos la respuesta JSON
        if (response.ok) {
            if (data.success) {
                // ÉXITO
                mostrarNotificacion('success', '🎉 ' + (data.message || '¡Mensaje enviado correctamente!'));
                form.reset();
                
                // Log para analytics
                console.log('📊 Formulario enviado exitosamente a:', email);
                
            } else {
                // ERROR DEL SERVIDOR (pero con código 200)
                mostrarNotificacion('error', '❌ ' + (data.error || 'Error al procesar el mensaje'));
            }
        } else {
            // ERROR HTTP (código no 200)
            const errorMsg = data.error || data.details || `Error ${response.status}: ${response.statusText}`;
            mostrarNotificacion('error', '❌ ' + errorMsg);
        }
        
    } catch (error) {
        console.error('❌ Error crítico:', error);
        
        // Mensajes de error más específicos
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
            mostrarNotificacion('error', '❌ Error de conexión. Verifica tu internet e inténtalo de nuevo.');
        } else if (error.message.includes('timeout')) {
            mostrarNotificacion('error', '❌ El servidor tardó demasiado en responder. Inténtalo nuevamente.');
        } else if (error.message.includes('CORS')) {
            mostrarNotificacion('error', '❌ Error de seguridad del navegador. Intenta desde otro navegador.');
        } else {
            mostrarNotificacion('error', '❌ ' + error.message);
        }
    } finally {
        // Restaurar botón
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
});

// FUNCIÓN PARA MOSTRAR NOTIFICACIONES ELEGANTES
function mostrarNotificacion(tipo, mensaje) {
    // Remover notificaciones anteriores
    const notificacionesAnteriores = document.querySelectorAll('.notificacion-flotante');
    notificacionesAnteriores.forEach(el => el.remove());
    
    // Crear nueva notificación
    const notificacion = document.createElement('div');
    notificacion.className = `notificacion-flotante ${tipo}`;
    
    const icono = tipo === 'success' ? '✅' : '❌';
    const colorFondo = tipo === 'success' ? '#10b981' : '#ef4444';
    
    notificacion.innerHTML = `
        <div style="
            background: ${colorFondo};
            color: white;
            padding: 18px 24px;
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.15);
            display: flex;
            align-items: center;
            gap: 14px;
            font-size: 15px;
            font-weight: 500;
            animation: slideIn 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
            position: fixed;
            top: 30px;
            right: 30px;
            z-index: 10000;
            max-width: 420px;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255,255,255,0.1);
        ">
            <div style="font-size: 22px; flex-shrink: 0;">
                ${icono}
            </div>
            <div style="flex-grow: 1;">${mensaje}</div>
            <button onclick="this.parentElement.parentElement.remove()" style="
                background: none;
                border: none;
                color: white;
                font-size: 20px;
                cursor: pointer;
                opacity: 0.7;
                transition: opacity 0.2s;
                padding: 0;
                margin-left: 10px;
                flex-shrink: 0;
            " onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.7'">
                ×
            </button>
        </div>
    `;
    
    document.body.appendChild(notificacion);
    
    // Auto-remover después de 6 segundos
    setTimeout(() => {
        if (notificacion.parentNode) {
            notificacion.style.animation = 'slideOut 0.4s ease-in';
            setTimeout(() => notificacion.remove(), 400);
        }
    }, 6000);
}

// FUNCIÓN PARA PROBAR LA CONEXIÓN MANUALMENTE (para debug)
window.probarConexionAPI = async function() {
    try {
        console.log('🧪 Probando conexión a API...');
        const response = await fetch(API_URL.replace('/send-contact', '/health') || API_URL.replace('/send-contact', ''), {
            method: 'GET'
        });
        
        const text = await response.text();
        console.log('🧪 Estado:', response.status);
        console.log('🧪 Respuesta:', text);
        
        try {
            const data = JSON.parse(text);
            console.log('🧪 JSON parseado:', data);
            mostrarNotificacion('success', `✅ API respondiendo: ${data.status || 'OK'}`);
        } catch {
            mostrarNotificacion(response.ok ? 'success' : 'error', 
                `API: ${response.status} - ${text.substring(0, 50)}`);
        }
    } catch (error) {
        console.error('🧪 Error probando conexión:', error);
        mostrarNotificacion('error', `❌ No se pudo conectar a la API: ${error.message}`);
    }
};

// AÑADIR ESTILOS CSS
const estilosCSS = document.createElement('style');
estilosCSS.textContent = `
    /* Animaciones para notificaciones */
    @keyframes slideIn {
        from {
            transform: translateX(100%) translateY(-20px);
            opacity: 0;
        }
        to {
            transform: translateX(0) translateY(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0) translateY(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%) translateY(-20px);
            opacity: 0;
        }
    }
    
    /* Estilo para estado de carga */
    .loading {
        display: inline-block;
        animation: pulse 1.5s infinite;
    }
    
    @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
    }
    
    /* Mejoras para el formulario */
    .contact-form input:focus,
    .contact-form textarea:focus {
        outline: none;
        border-color: #3b82f6;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }
    
    .contact-form button[disabled] {
        opacity: 0.7;
        cursor: not-allowed;
    }
    
    /* Botón de prueba para debug */
    .debug-button {
        position: fixed;
        bottom: 10px;
        right: 10px;
        background: #6b7280;
        color: white;
        border: none;
        padding: 5px 10px;
        border-radius: 4px;
        font-size: 12px;
        cursor: pointer;
        z-index: 9999;
        opacity: 0.3;
        transition: opacity 0.3s;
    }
    
    .debug-button:hover {
        opacity: 1;
    }
`;
document.head.appendChild(estilosCSS);

// Añadir botón de debug (solo en desarrollo)
if (window.location.hostname !== 'api-portfolio.odoo-experto.info') {
    const debugBtn = document.createElement('button');
    debugBtn.className = 'debug-button';
    debugBtn.textContent = '🧪 Test API';
    debugBtn.onclick = window.probarConexionAPI;
    document.body.appendChild(debugBtn);
}

// MEJORA: Añadir validación en tiempo real
document.querySelectorAll('#formulario-contacto input, #formulario-contacto textarea').forEach(input => {
    input.addEventListener('input', function() {
        if (this.value.trim()) {
            this.style.borderColor = '#10b981';
        } else {
            this.style.borderColor = '';
        }
    });
});

// MEJORA: Añadir timeout para la petición fetch
const originalFetch = window.fetch;
window.fetch = function(url, options = {}) {
    // Solo aplicar timeout a nuestra API
    if (typeof url === 'string' && url.includes('api-portfolio.odoo-experto.info')) {
        const timeout = 10000; // 10 segundos
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);
        
        if (options.signal) {
            // Si ya hay una señal, combinarla
            const signals = [controller.signal, options.signal];
            options.signal = AbortSignal.any(signals);
        } else {
            options.signal = controller.signal;
        }
        
        return originalFetch(url, options).finally(() => clearTimeout(timeoutId));
    }
    
    return originalFetch(url, options);
};

console.log('✅ Script de formulario cargado correctamente');
console.log('🌐 API Endpoint:', API_URL);
console.log('🔧 Modo debug:', window.location.hostname);