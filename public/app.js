/**
 * Frontend JavaScript para el Sistema de Recomendación
 */

// Configuración de la API
const API_URL = window.location.origin + '/api';

// Funciones de navegación entre tabs
function showTab(tabName) {
    // Ocultar todos los tabs
    const tabs = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => tab.classList.remove('active'));

    // Desactivar todos los botones
    const buttons = document.querySelectorAll('.tab-button');
    buttons.forEach(button => button.classList.remove('active'));

    // Activar el tab seleccionado
    const selectedTab = document.getElementById(tabName);
    if (selectedTab) {
        selectedTab.classList.add('active');
    }

    // Activar el botón correspondiente
    const activeButton = Array.from(buttons).find(
        button => button.textContent.toLowerCase().includes(tabName.substring(0, 5))
    );
    if (activeButton) {
        activeButton.classList.add('active');
    }

    // Limpiar resultados anteriores
    ocultarResultados();
}

// Función para mostrar resultados
function mostrarResultado(elementId, tipo, titulo, mensaje, datos = null) {
    const elemento = document.getElementById(elementId);
    elemento.className = `resultado show ${tipo}`;

    let html = `<h3>${titulo}</h3><p>${mensaje}</p>`;

    if (datos) {
        if (datos.errores && Array.isArray(datos.errores)) {
            html += '<ul>';
            datos.errores.forEach(error => {
                html += `<li>${error}</li>`;
            });
            html += '</ul>';
        }

        if (datos.cliente) {
            html += generarCardCliente(datos.cliente);
        }

        if (datos.recomendaciones) {
            html += generarListaRecomendaciones(datos.recomendaciones);
        }
    }

    elemento.innerHTML = html;
}

// Función para ocultar todos los resultados
function ocultarResultados() {
    const resultados = document.querySelectorAll('.resultado');
    resultados.forEach(resultado => {
        resultado.classList.remove('show');
    });
}

// Genera el card de información del cliente
function generarCardCliente(cliente) {
    return `
        <div class="cliente-card">
            <h3>Información del Cliente</h3>
            <div class="cliente-info">
                <div class="info-item">
                    <span class="info-label">Nombre:</span>
                    <span class="info-value">${cliente.nombre}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Teléfono:</span>
                    <span class="info-value">${cliente.telefono}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Recomendaciones:</span>
                    <span class="info-value">${cliente.totalRecomendaciones}</span>
                </div>
            </div>
            <div class="codigo-grande">${cliente.codigoReferido}</div>
            <p style="text-align: center; color: var(--text-secondary); font-size: 14px;">
                Comparte este código con tus amigos
            </p>
        </div>
    `;
}

// Genera la lista de recomendaciones
function generarListaRecomendaciones(recomendaciones) {
    if (!recomendaciones || recomendaciones.length === 0) {
        return '<p style="text-align: center; color: var(--text-secondary); margin-top: 20px;">Aún no has realizado recomendaciones</p>';
    }

    let html = '<div class="recomendaciones-lista"><h4>Tus Recomendaciones:</h4>';

    recomendaciones.forEach(rec => {
        const estadoClass = `estado-${rec.estado.toLowerCase()}`;
        const fecha = new Date(rec.fechaRecomendacion).toLocaleDateString('es-CR');

        html += `
            <div class="recomendacion-item">
                <h4>${rec.nombreRecomendado}</h4>
                <p><strong>Teléfono:</strong> ${rec.telefonoRecomendado}</p>
                <p><strong>Fecha:</strong> ${fecha}</p>
                <p>
                    <span class="estado-badge ${estadoClass}">${rec.estado}</span>
                    ${rec.mensajeEnviado ? '<span style="margin-left: 10px; color: var(--success-color);">✓ Mensaje enviado</span>' : ''}
                </p>
            </div>
        `;
    });

    html += '</div>';
    return html;
}

// Manejo del formulario de registro
document.getElementById('form-registro').addEventListener('submit', async (e) => {
    e.preventDefault();

    const nombre = document.getElementById('nombre-registro').value.trim();
    const telefono = '+506' + document.getElementById('telefono-registro').value.trim();
    const codigoRecomendador = document.getElementById('codigo-recomendador').value.trim();

    try {
        const response = await fetch(`${API_URL}/registrar-cliente`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                nombre,
                telefono,
                codigoRecomendador: codigoRecomendador || undefined
            })
        });

        const data = await response.json();

        if (data.exito) {
            mostrarResultado(
                'resultado-registro',
                'exito',
                '¡Registro Exitoso!',
                data.mensaje,
                { cliente: data.datos }
            );
            e.target.reset();
        } else {
            mostrarResultado(
                'resultado-registro',
                'error',
                'Error en el Registro',
                data.mensaje,
                { errores: data.errores }
            );
        }
    } catch (error) {
        console.error('Error:', error);
        mostrarResultado(
            'resultado-registro',
            'error',
            'Error de Conexión',
            'No se pudo conectar con el servidor. Por favor, intenta nuevamente.',
            null
        );
    }
});

// Manejo del formulario de recomendación
document.getElementById('form-recomendar').addEventListener('submit', async (e) => {
    e.preventDefault();

    const codigoRecomendador = document.getElementById('codigo-mi-codigo').value.trim();
    const nombreRecomendado = document.getElementById('nombre-recomendado').value.trim();
    const telefonoRecomendado = '+506' + document.getElementById('telefono-recomendado').value.trim();

    try {
        const response = await fetch(`${API_URL}/crear-recomendacion`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                codigoRecomendador,
                nombreRecomendado,
                telefonoRecomendado
            })
        });

        const data = await response.json();

        if (data.exito) {
            mostrarResultado(
                'resultado-recomendacion',
                'exito',
                '¡Recomendación Enviada!',
                data.mensaje,
                null
            );
            e.target.reset();
        } else {
            mostrarResultado(
                'resultado-recomendacion',
                'error',
                'Error al Enviar Recomendación',
                data.mensaje,
                { errores: data.errores }
            );
        }
    } catch (error) {
        console.error('Error:', error);
        mostrarResultado(
            'resultado-recomendacion',
            'error',
            'Error de Conexión',
            'No se pudo conectar con el servidor. Por favor, intenta nuevamente.',
            null
        );
    }
});

// Manejo del formulario de consulta
document.getElementById('form-consultar').addEventListener('submit', async (e) => {
    e.preventDefault();

    const codigo = document.getElementById('codigo-consulta').value.trim();

    try {
        const response = await fetch(`${API_URL}/mis-recomendaciones?codigo=${codigo}`);
        const data = await response.json();

        if (data.exito) {
            mostrarResultado(
                'resultado-consulta',
                'exito',
                'Información Encontrada',
                '',
                {
                    cliente: data.datos.cliente,
                    recomendaciones: data.datos.recomendaciones
                }
            );
        } else {
            mostrarResultado(
                'resultado-consulta',
                'error',
                'Error en la Consulta',
                data.mensaje,
                { errores: data.errores }
            );
        }
    } catch (error) {
        console.error('Error:', error);
        mostrarResultado(
            'resultado-consulta',
            'error',
            'Error de Conexión',
            'No se pudo conectar con el servidor. Por favor, intenta nuevamente.',
            null
        );
    }
});

// Validación en tiempo real del teléfono
document.querySelectorAll('input[type="tel"]').forEach(input => {
    input.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/\D/g, '').substring(0, 8);
    });
});

// Validación en tiempo real del código
document.querySelectorAll('input[pattern="[0-9]{4}"]').forEach(input => {
    input.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/\D/g, '').substring(0, 4);
    });
});
