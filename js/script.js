// URL de la API
const API_URL = 'https://api-portfolio.odoo-experto.info/api/send-contact';

// Formulario de contacto
document.getElementById('formulario-contacto')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    
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
    
    try {
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
            mode: 'cors'
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            mostrarNotificacion('success', '✅ ' + (data.message || '¡Mensaje enviado!'));
            form.reset();
        } else {
            mostrarNotificacion('error', '❌ ' + (data.error || 'Error al enviar'));
        }
        
    } catch (error) {
        console.error('Error:', error);
        mostrarNotificacion('error', '❌ Error de conexión. Verifica que el servidor esté activo.');
    } finally {
        submitBtn.textContent = textoOriginal;
        submitBtn.disabled = false;
    }
});

// Notificaciones
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
            <div style="flex: 1;">${mensaje}</div>
            <button onclick="this.closest('.notificacion-flotante').remove()" 
                    style="background:none;border:none;color:white;font-size:20px;cursor:pointer;">×</button>
        </div>
    `;
    
    document.body.appendChild(notif);
    setTimeout(() => notif.remove(), 5000);
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

console.log('✅ Script cargado:', API_URL);