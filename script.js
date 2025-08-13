// Configuración de Google Apps Script (Nueva versión con script propio)
const GAS_CONFIG = {
    SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbz21ggFPEfI7ShmgOnUO3KkTBQEjoD6qNjtol4fChmJLD_Zg0kNOiOIETRaPMAe3rPx/exec'
};

// Datos locales (cache)
let ventasData = [];
let contadorOrden = 1;

// Estado de la aplicación
let isLoading = false;

// Inicializar la aplicación
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🚀 Iniciando NTS Sales Tracker con Google Apps Script...');
    
    // Mostrar indicador de carga
    mostrarCarga(true);
    
    try {
        // Cargar datos desde Google Apps Script
        await cargarDatosDesdeScript();
        
        // Configurar interfaz
        configurarInterfaz();
        
        // Actualizar vista
        actualizarDashboard();
        renderizarTabla();
        
        console.log('✅ Aplicación iniciada correctamente');
        
    } catch (error) {
        console.error('❌ Error iniciando aplicación:', error);
        alert('Error conectando con Google Apps Script. Usando datos locales por ahora.');
        
        // Fallback a datos locales
        await inicializarDatosEjemplo();
        configurarInterfaz();
        actualizarDashboard();
        renderizarTabla();
    }
    
    // Ocultar indicador de carga
    mostrarCarga(false);
});

// Configurar interfaz y event listeners
function configurarInterfaz() {
    // Establecer fecha actual
    const fechaHoy = new Date().toISOString().split('T')[0];
    document.getElementById('fechaVenta').value = fechaHoy;
    
    // Generar número de orden
    generarNumeroOrden();
    
    // Event listeners
    const form = document.getElementById('ventaForm');
    if (form) {
        form.addEventListener('submit', registrarVenta);
    }
    
    const montoPagado = document.getElementById('montoPagado');
    if (montoPagado) {
        montoPagado.addEventListener('input', actualizarEstadoPago);
    }
}

// Mostrar/ocultar indicador de carga
function mostrarCarga(mostrar) {
    const existingLoader = document.getElementById('loader');
    
    if (mostrar && !existingLoader) {
        const loader = document.createElement('div');
        loader.id = 'loader';
        loader.innerHTML = `
            <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
                        background: rgba(0,0,0,0.5); display: flex; justify-content: center; 
                        align-items: center; z-index: 9999;">
                <div style="background: white; padding: 20px; border-radius: 10px; text-align: center;">
                    <div style="font-size: 20px; margin-bottom: 10px;">⏳</div>
                    <div>Sincronizando con Google Sheets...</div>
                </div>
            </div>
        `;
        document.body.appendChild(loader);
    } else if (!mostrar && existingLoader) {
        existingLoader.remove();
    }
}

// Cargar datos desde Google Apps Script (usando script tag para evitar CORS)
async function cargarDatosDesdeScript() {
    try {
        console.log('📥 Cargando datos desde Google Apps Script...');
        console.log('🔗 URL del script:', GAS_CONFIG.SCRIPT_URL);
        
        const result = await makeScriptRequest('getSales');
        console.log('📦 Resultado del script:', result);
        
        if (result.success && result.data && result.data.length > 0) {
            ventasData = result.data.map(venta => ({
                numeroOrden: venta.numeroOrden || '',
                nombreCliente: venta.nombreCliente || '',
                emailCliente: venta.emailCliente || '',
                fechaVenta: venta.fechaVenta || '',
                tipoVenta: venta.tipoVenta || '',
                destino: venta.destino || '',
                fechaViaje: venta.fechaViaje || '',
                montoTotal: parseFloat(venta.montoTotal) || 0,
                costoViaje: parseFloat(venta.costoViaje) || 0,
                montoPagado: parseFloat(venta.montoPagado) || 0,
                estadoPago: venta.estadoPago || 'Reservado',
                notas: venta.notas || ''
            }));
            
            // Actualizar contador de órdenes
            const ultimaOrden = ventasData.reduce((max, venta) => {
                const numero = parseInt(venta.numeroOrden.split('-')[2]);
                return numero > max ? numero : max;
            }, 0);
            contadorOrden = ultimaOrden + 1;
            
            console.log(`✅ Cargadas ${ventasData.length} ventas desde Google Apps Script`);
        } else {
            console.log('📝 Hoja vacía o sin datos, iniciando con datos de ejemplo');
            await inicializarDatosEjemplo();
        }
        
    } catch (error) {
        console.error('❌ Error completo:', error);
        console.error('❌ Error message:', error.message);
        
        alert(`Error conectando con Google Apps Script: ${error.message}\n\nUsando datos locales por ahora.`);
        // Cargar datos de ejemplo en caso de error
        inicializarDatosEjemplo();
    }
}

// Función universal para hacer requests al script (evita CORS)
function makeScriptRequest(action, params = {}) {
    return new Promise((resolve, reject) => {
        // Crear nombre único para callback
        const callbackName = 'script_callback_' + Math.round(100000 * Math.random());
        
        // Crear URL con parámetros
        let url = `${GAS_CONFIG.SCRIPT_URL}?action=${action}&callback=${callbackName}`;
        
        // Agregar parámetros adicionales
        Object.keys(params).forEach(key => {
            url += `&${key}=${encodeURIComponent(JSON.stringify(params[key]))}`;
        });
        
        console.log('🌐 Llamando script con URL:', url);
        
        // Crear elemento script
        const script = document.createElement('script');
        
        // Definir callback global
        window[callbackName] = function(data) {
            console.log('📥 Respuesta recibida:', data);
            delete window[callbackName];
            if (document.body.contains(script)) {
                document.body.removeChild(script);
            }
            resolve(data);
        };
        
        // Manejar errores
        script.onerror = function() {
            delete window[callbackName];
            if (document.body.contains(script)) {
                document.body.removeChild(script);
            }
            reject(new Error('Error cargando script - verifique que esté publicado correctamente'));
        };
        
        // Configurar y agregar script
        script.src = url;
        document.body.appendChild(script);
        
        // Timeout de 15 segundos
        setTimeout(() => {
            if (window[callbackName]) {
                delete window[callbackName];
                if (document.body.contains(script)) {
                    document.body.removeChild(script);
                }
                reject(new Error('Timeout - Google Apps Script no respondió en 15 segundos'));
            }
        }, 15000);
    });
}

// Guardar datos en Google Sheets
async function guardarEnSheets(nuevaVenta) {
    try {
        mostrarCarga(true);
        
        const values = [[
            nuevaVenta.numeroOrden,
            nuevaVenta.nombreCliente,
            nuevaVenta.emailCliente,
            nuevaVenta.fechaVenta,
            nuevaVenta.tipoVenta,
            nuevaVenta.destino,
            nuevaVenta.fechaViaje,
            nuevaVenta.montoTotal,
            nuevaVenta.costoViaje,
            nuevaVenta.montoPagado,
            nuevaVenta.estadoPago,
            nuevaVenta.notas
        ]];
        
        const response = await fetch(WRITE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                values: values
            })
        });
        
        if (response.ok) {
            console.log('✅ Venta guardada en Google Sheets');
            return true;
        } else {
            const errorData = await response.json();
            console.error('Error details:', errorData);
            throw new Error(`Error ${response.status}: ${errorData.error?.message || 'Error desconocido'}`);
        }
        
    } catch (error) {
        console.error('❌ Error guardando en Sheets:', error);
        alert(`❌ Error guardando en Google Sheets: ${error.message}\n\nLa venta se mantiene localmente. Verifique su configuración.`);
        return false;
    } finally {
        mostrarCarga(false);
    }
}

// Inicializar con datos de ejemplo
async function inicializarDatosEjemplo() {
    const datosEjemplo = [
        {
            numeroOrden: 'NTS-2025-001',
            nombreCliente: 'John Smith',
            emailCliente: 'john@email.com',
            fechaVenta: '2025-08-12',
            tipoVenta: 'Paquete Completo',
            destino: 'París, Roma, Barcelona',
            fechaViaje: '2025-09-15',
            montoTotal: 15000,
            costoViaje: 12000,
            montoPagado: 7500,
            estadoPago: 'Parcialmente Pagado',
            notas: 'Cliente VIP, pago inicial del 50%'
        },
        {
            numeroOrden: 'NTS-2025-002',
            nombreCliente: 'María González',
            emailCliente: 'maria@email.com',
            fechaVenta: '2025-08-11',
            tipoVenta: 'Excursion',
            destino: 'Machu Picchu, Cusco',
            fechaViaje: '2025-10-20',
            montoTotal: 4500,
            costoViaje: 3200,
            montoPagado: 0,
            estadoPago: 'Reservado',
            notas: 'Esperando confirmación de fechas'
        },
        {
            numeroOrden: 'NTS-2025-003',
            nombreCliente: 'Hans Mueller',
            emailCliente: 'hans@email.com',
            fechaVenta: '2025-08-10',
            tipoVenta: 'Cruceros',
            destino: 'Safari Kenia',
            fechaViaje: '2025-11-05',
            montoTotal: 8200,
            costoViaje: 6500,
            montoPagado: 8200,
            estadoPago: 'Pagado',
            notas: 'Pago completo realizado'
        }
    ];
    
    ventasData = [...datosEjemplo];
    contadorOrden = 4;
    
    console.log('📝 Datos de ejemplo inicializados');
}

// Generar número de orden
function generarNumeroOrden() {
    const año = new Date().getFullYear();
    const numero = String(contadorOrden).padStart(3, '0');
    const numeroOrden = `NTS-${año}-${numero}`;
    document.getElementById('numeroOrden').value = numeroOrden;
}

// Registrar nueva venta
async function registrarVenta(e) {
    e.preventDefault();
    
    if (isLoading) return;
    
    console.log('📝 Registrando nueva venta...');
    
    // Validar campos requeridos
    const nombreCliente = document.getElementById('nombreCliente').value.trim();
    const emailCliente = document.getElementById('emailCliente').value.trim();
    const tipoVenta = document.getElementById('tipoVenta').value;
    const destino = document.getElementById('destino').value.trim();
    
    if (!nombreCliente || !emailCliente || !tipoVenta || !destino) {
        alert('❌ Por favor complete todos los campos requeridos');
        return;
    }
    
    const nuevaVenta = {
        numeroOrden: document.getElementById('numeroOrden').value,
        nombreCliente: nombreCliente,
        emailCliente: emailCliente,
        fechaVenta: document.getElementById('fechaVenta').value,
        tipoVenta: tipoVenta,
        destino: destino,
        fechaViaje: document.getElementById('fechaViaje').value,
        montoTotal: parseFloat(document.getElementById('montoTotal').value) || 0,
        costoViaje: parseFloat(document.getElementById('costoViaje').value) || 0,
        montoPagado: parseFloat(document.getElementById('montoPagado').value) || 0,
        estadoPago: document.getElementById('estadoPago').value,
        notas: document.getElementById('notas').value || ''
    };
    
    // Agregar a datos locales primero
    ventasData.push(nuevaVenta);
    contadorOrden++;
    
    // Limpiar formulario
    document.getElementById('ventaForm').reset();
    document.getElementById('fechaVenta').value = new Date().toISOString().split('T')[0];
    generarNumeroOrden();
    
    // Actualizar vista inmediatamente
    actualizarDashboard();
    renderizarTabla();
    
    // Intentar guardar en Google Apps Script (en segundo plano)
    const guardadoExitoso = await guardarEnScript(nuevaVenta);
    
    if (guardadoExitoso) {
        alert('✅ Venta registrada y sincronizada exitosamente!');
    } else {
        alert('⚠️ Venta registrada localmente. Problemas de sincronización con Google Apps Script.');
    }
    
    console.log('✅ Venta registrada:', nuevaVenta.numeroOrden);
}

// Sincronizar datos (botón manual)
async function sincronizarDatos() {
    await cargarDatosDesdeSheets();
    actualizarDashboard();
    renderizarTabla();
    alert('🔄 Datos sincronizados con Google Sheets');
}

// Actualizar estado de pago automáticamente
function actualizarEstadoPago() {
    const montoTotal = parseFloat(document.getElementById('montoTotal').value) || 0;
    const montoPagado = parseFloat(document.getElementById('montoPagado').value) || 0;
    const estadoPago = document.getElementById('estadoPago');
    
    if (montoPagado === 0) {
        estadoPago.value = 'Reservado';
    } else if (montoPagado < montoTotal) {
        estadoPago.value = 'Parcialmente Pagado';
    } else if (montoPagado >= montoTotal) {
        estadoPago.value = 'Pagado';
    }
}

// Resto de funciones (dashboard, tabla, filtros, etc.)
function actualizarDashboard() {
    const ventasActivas = ventasData.filter(venta => venta.estadoPago !== 'Cancelado');
    
    const totalFacturado = ventasActivas.reduce((sum, venta) => sum + venta.montoTotal, 0);
    const totalPagado = ventasActivas.reduce((sum, venta) => sum + venta.montoPagado, 0);
    const pendienteCobro = totalFacturado - totalPagado;
    const utilidadTotal = ventasActivas.reduce((sum, venta) => sum + (venta.montoTotal - venta.costoViaje), 0);
    const ordenesActivas = ventasData.filter(venta => venta.estadoPago !== 'Pagado' && venta.estadoPago !== 'Cancelado').length;
    
    // Actualizar métricas principales
    document.getElementById('totalFacturado').textContent = '$' + totalFacturado.toLocaleString();
    document.getElementById('pendienteCobro').textContent = '$' + pendienteCobro.toLocaleString();
    document.getElementById('utilidadTotal').textContent = '$' + utilidadTotal.toLocaleString();
    document.getElementById('ordenesActivas').textContent = ordenesActivas;
    
    // Actualizar estadísticas por tipo
    const statHoteles = ventasActivas.filter(venta => venta.tipoVenta === 'Hotel').length;
    const statVuelos = ventasActivas.filter(venta => venta.tipoVenta === 'Vuelos').length;
    const statCruceros = ventasActivas.filter(venta => venta.tipoVenta === 'Cruceros').length;
    const statExcursiones = ventasActivas.filter(venta => venta.tipoVenta === 'Excursion').length;
    const statTraslados = ventasActivas.filter(venta => venta.tipoVenta === 'Traslado').length;
    const statPaquetes = ventasActivas.filter(venta => venta.tipoVenta === 'Paquete Completo').length;
    
    const elements = {
        'statHoteles': statHoteles,
        'statVuelos': statVuelos,
        'statCruceros': statCruceros,
        'statExcursiones': statExcursiones,
        'statTraslados': statTraslados,
        'statPaquetes': statPaquetes
    };
    
    Object.keys(elements).forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = elements[id];
        }
    });
}

function renderizarTabla(datos = ventasData) {
    const tbody = document.getElementById('ventasTabla');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    datos.forEach((venta) => {
        const montoRestante = venta.montoTotal - venta.montoPagado;
        const utilidad = venta.montoTotal - venta.costoViaje;
        const ventaIndexReal = ventasData.findIndex(v => v.numeroOrden === venta.numeroOrden);
        const tipoClass = venta.tipoVenta.toLowerCase().replace(' ', '-').replace('ó', 'o');
        
        const row = tbody.insertRow();
        row.innerHTML = `
            <td><span class="order-number">${venta.numeroOrden}</span></td>
            <td>
                <strong>${venta.nombreCliente}</strong><br>
                <small>${venta.emailCliente}</small>
            </td>
            <td><span class="tipo-venta ${tipoClass}">${venta.tipoVenta}</span></td>
            <td>${venta.destino}</td>
            <td>${formatearFecha(venta.fechaVenta)}</td>
            <td>${formatearFecha(venta.fechaViaje)}</td>
            <td class="amount positive">$${venta.montoTotal.toLocaleString()}</td>
            <td class="amount ${venta.montoPagado > 0 ? 'positive' : 'negative'}">$${venta.montoPagado.toLocaleString()}</td>
            <td class="amount ${montoRestante > 0 ? 'pending' : 'positive'}">$${montoRestante.toLocaleString()}</td>
            <td><span class="status ${venta.estadoPago.toLowerCase().replace(' ', '-')}">${venta.estadoPago}</span></td>
            <td class="amount ${utilidad > 0 ? 'positive' : 'negative'}">$${utilidad.toLocaleString()}</td>
            <td>
                <div class="actions-container">
                    <button class="btn btn-small btn-success" onclick="registrarPago(${ventaIndexReal})" title="Registrar Pago">💰</button>
                    <button class="btn btn-small btn-warning" onclick="editarVenta(${ventaIndexReal})" title="Editar">✏️</button>
                    <button class="btn btn-small btn-warning" onclick="cancelarReserva(${ventaIndexReal})" title="Cancelar">❌</button>
                    <button class="btn btn-small btn-danger" onclick="eliminarVenta(${ventaIndexReal})" title="Eliminar">🗑️</button>
                    <button class="btn btn-small" onclick="sincronizarDatos()" title="Sincronizar">🔄</button>
                </div>
            </td>
        `;
    });
}

function formatearFecha(fecha) {
    return new Date(fecha + 'T00:00:00').toLocaleDateString('es-AR');
}

function filtrarTabla() {
    const filtroTipo = document.getElementById('filtroTipo').value;
    const filtroEstado = document.getElementById('filtroEstado').value;
    const filtroFechaDesde = document.getElementById('filtroFechaDesde').value;
    const filtroFechaHasta = document.getElementById('filtroFechaHasta').value;
    const buscarCliente = document.getElementById('buscarCliente').value.toLowerCase();
    
    let datosFiltrados = [...ventasData];
    
    if (filtroTipo) {
        datosFiltrados = datosFiltrados.filter(venta => venta.tipoVenta === filtroTipo);
    }
    
    if (filtroEstado) {
        datosFiltrados = datosFiltrados.filter(venta => venta.estadoPago === filtroEstado);
    }
    
    if (filtroFechaDesde) {
        datosFiltrados = datosFiltrados.filter(venta => venta.fechaVenta >= filtroFechaDesde);
    }
    
    if (filtroFechaHasta) {
        datosFiltrados = datosFiltrados.filter(venta => venta.fechaVenta <= filtroFechaHasta);
    }
    
    if (buscarCliente) {
        datosFiltrados = datosFiltrados.filter(venta => 
            venta.nombreCliente.toLowerCase().includes(buscarCliente) ||
            venta.emailCliente.toLowerCase().includes(buscarCliente) ||
            venta.destino.toLowerCase().includes(buscarCliente)
        );
    }
    
    renderizarTabla(datosFiltrados);
}

function limpiarFiltros() {
    document.getElementById('filtroTipo').value = '';
    document.getElementById('filtroEstado').value = '';
    document.getElementById('filtroFechaDesde').value = '';
    document.getElementById('filtroFechaHasta').value = '';
    document.getElementById('buscarCliente').value = '';
    renderizarTabla();
}

async function registrarPago(index) {
    if (index < 0 || index >= ventasData.length) {
        alert('❌ Error: Venta no encontrada');
        return;
    }
    
    const venta = ventasData[index];
    
    if (venta.estadoPago === 'Cancelado') {
        alert('❌ No se puede registrar pago en una reserva cancelada');
        return;
    }
    
    const montoRestante = venta.montoTotal - venta.montoPagado;
    
    if (montoRestante <= 0) {
        alert('✅ Esta venta ya está completamente pagada');
        return;
    }
    
    const nuevoPago = prompt(`Ingrese el monto del pago para ${venta.nombreCliente}:\nMonto restante: $${montoRestante.toLocaleString()}`);
    
    if (nuevoPago && !isNaN(nuevoPago) && parseFloat(nuevoPago) > 0) {
        const montoNuevo = parseFloat(nuevoPago);
        
        venta.montoPagado += montoNuevo;
        
        // Actualizar estado
        if (venta.montoPagado >= venta.montoTotal) {
            venta.estadoPago = 'Pagado';
        } else if (venta.montoPagado > 0) {
            venta.estadoPago = 'Parcialmente Pagado';
        }
        
        actualizarDashboard();
        renderizarTabla();
        
        alert(`✅ Pago de $${montoNuevo.toLocaleString()} registrado para ${venta.nombreCliente}\n\n⚠️ Use el botón 🔄 para sincronizar con Google Sheets`);
    }
}

async function cancelarReserva(index) {
    if (index < 0 || index >= ventasData.length) {
        alert('❌ Error: Venta no encontrada');
        return;
    }
    
    const venta = ventasData[index];
    
    if (venta.estadoPago === 'Cancelado') {
        alert('❌ Esta reserva ya está cancelada');
        return;
    }
    
    const confirmacion = confirm(`¿Está seguro de cancelar la reserva de ${venta.nombreCliente}?\n\nOrden: ${venta.numeroOrden}\nTipo: ${venta.tipoVenta}\nDestino: ${venta.destino}\nMonto: $${venta.montoTotal.toLocaleString()}`);
    
    if (confirmacion) {
        venta.estadoPago = 'Cancelado';
        venta.notas += ` [CANCELADO el ${new Date().toLocaleDateString('es-AR')}]`;
        
        actualizarDashboard();
        renderizarTabla();
        
        alert(`❌ Reserva de ${venta.nombreCliente} marcada como CANCELADA\n\n⚠️ Use el botón 🔄 para sincronizar con Google Sheets`);
    }
}

async function eliminarVenta(index) {
    if (index < 0 || index >= ventasData.length) {
        alert('❌ Error: Venta no encontrada');
        return;
    }
    
    const venta = ventasData[index];
    
    const confirmacion = confirm(`⚠️ ATENCIÓN: ¿Está seguro de ELIMINAR PERMANENTEMENTE esta venta?

Cliente: ${venta.nombreCliente}
Orden: ${venta.numeroOrden}
Tipo: ${venta.tipoVenta}
Destino: ${venta.destino}
Monto: ${venta.montoTotal.toLocaleString()}

❗ Esta acción NO se puede deshacer. El registro se eliminará completamente.

💡 Recomendación: Use "Cancelar" (❌) en lugar de "Eliminar" (🗑️) para mantener el historial.`);
    
    if (confirmacion) {
        // Segunda confirmación para evitar eliminaciones accidentales
        const textoConfirmacion = prompt(`🚨 CONFIRMACIÓN FINAL

Para eliminar permanentemente la venta de ${venta.nombreCliente}, escriba exactamente: ELIMINAR

(O presione Cancelar para abortar)`);
        
        if (textoConfirmacion === 'ELIMINAR') {
            const nombreCliente = venta.nombreCliente;
            
            // Eliminar del array local
            ventasData.splice(index, 1);
            
            // Actualizar vista
            actualizarDashboard();
            renderizarTabla();
            
            alert(`🗑️ Venta de ${nombreCliente} eliminada permanentemente

⚠️ IMPORTANTE: Use el botón 🔄 Sincronizar para actualizar Google Sheets y eliminar el registro también allí.`);
            
            console.log(`✅ Venta eliminada: ${nombreCliente}`);
        } else {
            alert('❌ Eliminación cancelada - debe escribir exactamente "ELIMINAR"');
        }
    }
}

async function editarVenta(index) {
    if (index < 0 || index >= ventasData.length) {
        alert('❌ Error: Venta no encontrada');
        return;
    }
    
    const venta = ventasData[index];
    
    // Llenar el formulario con los datos de la venta
    document.getElementById('numeroOrden').value = venta.numeroOrden;
    document.getElementById('nombreCliente').value = venta.nombreCliente;
    document.getElementById('emailCliente').value = venta.emailCliente;
    document.getElementById('fechaVenta').value = venta.fechaVenta;
    document.getElementById('tipoVenta').value = venta.tipoVenta;
    document.getElementById('destino').value = venta.destino;
    document.getElementById('fechaViaje').value = venta.fechaViaje;
    document.getElementById('montoTotal').value = venta.montoTotal;
    document.getElementById('costoViaje').value = venta.costoViaje;
    document.getElementById('montoPagado').value = venta.montoPagado;
    document.getElementById('estadoPago').value = venta.estadoPago;
    document.getElementById('notas').value = venta.notas;
    
    // Eliminar la venta original del array (se volverá a agregar cuando se envíe el formulario)
    ventasData.splice(index, 1);
    contadorOrden--;
    
    // Actualizar vista
    actualizarDashboard();
    renderizarTabla();
    
    // Scroll al formulario para que el usuario vea que está en modo edición
    document.querySelector('.form-section').scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
    });
    
    // Cambiar el color del formulario para indicar modo edición
    const formSection = document.querySelector('.form-section');
    const originalBg = formSection.style.background;
    formSection.style.background = '#fff3cd';
    formSection.style.border = '2px solid #ffc107';
    
    // Agregar mensaje de edición
    let editMessage = document.getElementById('editMessage');
    if (!editMessage) {
        editMessage = document.createElement('div');
        editMessage.id = 'editMessage';
        editMessage.innerHTML = `
            <div style="background: #d4edda; color: #155724; padding: 10px; border-radius: 5px; margin-bottom: 15px; border: 1px solid #c3e6cb;">
                <strong>📝 MODO EDICIÓN:</strong> Editando venta de ${venta.nombreCliente}. 
                Modifique los campos necesarios y presione "Registrar Venta" para guardar los cambios.
            </div>
        `;
        formSection.insertBefore(editMessage, formSection.firstChild.nextSibling);
    }
    
    // Restaurar estilo original después de que se envíe el formulario
    const form = document.getElementById('ventaForm');
    const handleSubmit = () => {
        formSection.style.background = originalBg;
        formSection.style.border = '';
        if (editMessage) editMessage.remove();
        form.removeEventListener('submit', handleSubmit);
    };
    form.addEventListener('submit', handleSubmit);
    
    alert(`📝 Modo edición activado para ${venta.nombreCliente}

El formulario se ha llenado con los datos actuales. 
Modifique lo que necesite y presione "💾 Registrar Venta" para guardar los cambios.`);
}

function exportarCSV() {
    const headers = ['N° Orden', 'Cliente', 'Email', 'Tipo Venta', 'Destino', 'Fecha Venta', 'Fecha Viaje', 'Monto Total', 'Monto Pagado', 'Monto Restante', 'Estado Pago', 'Utilidad', 'Notas'];
    
    let csvContent = headers.join(',') + '\n';
    
    ventasData.forEach(venta => {
        const montoRestante = venta.montoTotal - venta.montoPagado;
        const utilidad = venta.montoTotal - venta.costoViaje;
        
        const row = [
            venta.numeroOrden,
            `"${venta.nombreCliente}"`,
            venta.emailCliente,
            `"${venta.tipoVenta}"`,
            `"${venta.destino}"`,
            venta.fechaVenta,
            venta.fechaViaje,
            venta.montoTotal,
            venta.montoPagado,
            montoRestante,
            `"${venta.estadoPago}"`,
            utilidad,
            `"${venta.notas}"`
        ];
        csvContent += row.join(',') + '\n';
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `NTS_Ventas_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
}
