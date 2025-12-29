// ============================================
// SCRIPT DE DIAGNÓSTICO AVANZADO
// ============================================

const API_URL = 'https://api-portfolio.odoo-experto.info/api/send-contact';

// Formulario con diagnóstico completo
document.getElementById('formulario-contacto')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    console.log('\n' + '='.repeat(60));
    console.log('🔍 DIAGNÓSTICO DE ENVÍO');
    console.log('='.repeat(60));
    
    const form = this;
    const nombre = form.querySelector('input[type="text"]').value.trim();
    const email = form.querySelector('input[type="email"]').value.trim();
    const mensaje = form.querySelector('textarea').value.trim();
    const submitBtn = form.querySelector('button[type="submit"]');
    
    // Validaciones
    if (!nombre || !email || !mensaje) {
        mostrarNotificacion('error', '❌ Completa todos los campos');
        return;
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        mostrarNotificacion('error', '❌ Email inválido');
        return;
    }
    
    // Loading
    const textoOriginal = submitBtn.textContent;
    submitBtn.textContent = '⏳ Enviando...';
    submitBtn.disabled = true;
    
    console.log('📝 Datos a enviar:', { nombre, email, mensaje: mensaje.substring(0, 30) + '...' });
    console.log('🌐 URL destino:', API_URL);
    console.log('⏰ Timestamp:', new Date().toISOString());
    
    try {
        console.log('\n📤 PASO 1: Iniciando fetch...');
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos
        
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
            }),
            mode: 'cors',
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        console.log('✅ PASO 2: Respuesta recibida');
        console.log('   Status:', response.status, response.statusText);
        console.log('   Type:', response.type);
        console.log('   OK:', response.ok);
        console.log('   Headers:');
        for (const [key, value] of response.headers.entries()) {
            console.log(`      ${key}: ${value}`);
        }
        
        console.log('\n📄 PASO 3: Parseando respuesta...');
        const contentType = response.headers.get('content-type');
        console.log('   Content-Type:', contentType);
        
        let data;
        const responseText = await response.text();
        console.log('   Body (raw):', responseText.substring(0, 200));
        
        try {
            data = JSON.parse(responseText);
            console.log('   Body (parsed):', data);
        } catch (parseError) {
            console.error('   ❌ Error parseando JSON:', parseError.message);
            throw new Error('Respuesta no es JSON válido');
        }
        
        console.log('\n🎯 PASO 4: Evaluando resultado...');
        if (response.ok && data.success) {
            console.log('   ✅ ÉXITO TOTAL');
            mostrarNotificacion('success', '✅ ' + (data.message || '¡Mensaje enviado!'));
            form.reset();
        } else {
            console.log('   ❌ ERROR DEL SERVIDOR');
            console.log('   Detalle:', data.error || data);
            mostrarNotificacion('error', '❌ ' + (data.error || 'Error al enviar'));
        }
        
    } catch (error) {
        console.error('\n' + '❌'.repeat(30));
        console.error('ERROR CAPTURADO:');
        console.error('❌'.repeat(30));
        console.error('Tipo:', error.constructor.name);
        console.error('Nombre:', error.name);
        console.error('Mensaje:', error.message);
        console.error('Stack:', error.stack);
        console.error('❌'.repeat(30) + '\n');
        
        // Diagnóstico específico
        let diagnostico = '';
        let solucion = '';
        
        if (error.name === 'AbortError') {
            diagnostico = 'Timeout - El servidor tardó más de 10 segundos en responder';
            solucion = 'Verifica que el servicio portfolio-api esté corriendo en el VPS';
        } else if (error.message.includes('Failed to fetch') || error.name === 'TypeError') {
            diagnostico = 'No se pudo conectar al servidor';
            solucion = 'Posibles causas:\n' +
                      '1. El servicio portfolio-api no está corriendo\n' +
                      '2. El túnel cloudflared no está activo\n' +
                      '3. El firewall está bloqueando el puerto\n' +
                      '4. Problema de DNS con api-portfolio.odoo-experto.info';
        } else if (error.message.includes('CORS')) {
            diagnostico = 'Problema de CORS';
            solucion = 'Los headers CORS no están configurados correctamente en el backend';
        } else if (error.message.includes('JSON')) {
            diagnostico = 'Respuesta no es JSON válido';
            solucion = 'El servidor está respondiendo pero con formato incorrecto';
        } else {
            diagnostico = error.message;
            solucion = 'Error desconocido - revisa los logs del servidor';
        }
        
        console.log('\n🔍 DIAGNÓSTICO:');
        console.log('   Problema:', diagnostico);
        console.log('   Solución:', solucion);
        
        mostrarNotificacion('error', `❌ ${diagnostico}`);
        
    } finally {
        submitBtn.textContent = textoOriginal;
        submitBtn.disabled = false;
        console.log('\n' + '='.repeat(60));
        console.log('FIN DEL DIAGNÓSTICO');
        console.log('='.repeat(60) + '\n');
    }
});

// Test de conectividad al cargar
window.addEventListener('DOMContentLoaded', async () => {
    console.log('\n🧪 TEST AUTOMÁTICO DE CONECTIVIDAD\n');
    
    // Test 1: Health check
    try {
        console.log('Test 1: Health endpoint...');
        const healthUrl = API_URL.replace('/send-contact', '/health');
        const response = await fetch(healthUrl, { method: 'GET', mode: 'cors' });
        console.log('✅ Health check:', response.status);
        const data = await response.json();
        console.log('   Respuesta:', data);
    } catch (error) {
        console.error('❌ Health check falló:', error.message);
    }
    
    // Test 2: OPTIONS (CORS preflight)
    try {
        console.log('\nTest 2: CORS preflight...');
        const response = await fetch(API_URL, { method: 'OPTIONS', mode: 'cors' });
        console.log('✅ OPTIONS:', response.status);
        console.log('   CORS headers:');
        console.log('      Allow-Origin:', response.headers.get('access-control-allow-origin'));
        console.log('      Allow-Methods:', response.headers.get('access-control-allow-methods'));
        console.log('      Allow-Headers:', response.headers.get('access-control-allow-headers'));
    } catch (error) {
        console.error('❌ CORS preflight falló:', error.message);
    }
    
    // Test 3: DNS resolution
    try {
        console.log('\nTest 3: Resolución DNS...');
        const hostname = new URL(API_URL).hostname;
        console.log('   Hostname:', hostname);
        // En navegador no podemos hacer DNS lookup directo, pero fetch lo intentará
    } catch (error) {
        console.error('❌ DNS test error:', error.message);
    }
    
    console.log('\n✅ Tests completados. Ahora prueba el formulario.\n');
});

// Función de notificaciones
function mostrarNotificacion(tipo, mensaje) {
    document.querySelectorAll('.notificacion-flotante').forEach(el => el.remove());
    
    const notif = document.createElement('div');
    notif.className = 'notificacion-flotante';
    const color = tipo === 'success' ? '#10b981' : '#ef4444';
    const icono = tipo === 'success' ? '✅' : '❌';
    
    notif.innerHTML = `
        <div style="
            background: ${color};
            color: white;
            padding: 18px 24px;
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            display: flex;
            align-items: center;
            gap: 14px;
            position: fixed;
            top: 30px;
            right: 30px;
            z-index: 10000;
            max-width: 420px;
            animation: slideIn 0.4s ease-out;
        ">
            <div style="font-size: 22px;">${icono}</div>
            <div style="flex: 1; white-space: pre-line;">${mensaje}</div>
            <button onclick="this.closest('.notificacion-flotante').remove()" 
                    style="background:none;border:none;color:white;font-size:20px;cursor:pointer;">×</button>
        </div>
    `;
    
    document.body.appendChild(notif);
    setTimeout(() => notif.remove(), 8000);
}

// CSS
const styles = document.createElement('style');
styles.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    .contact-form input:focus,
    .contact-form textarea:focus {
        border-color: #3b82f6;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }
`;
document.head.appendChild(styles);

console.log('✅ Script de diagnóstico cargado');
console.log('📍 API URL:', API_URL);