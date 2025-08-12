// Datos de ejemplo y almacenamiento
let ventasData = [
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

let contadorOrden = 4;

// Inicializar la aplicación
document.addEventListener('DOMContentLoaded', function() {
    // Establecer fecha actual
    document.getElementById('fechaVenta').value = new Date().toISOString().split('T')[0];
    
    // Generar número de orden
    generarNumeroOrden();
    
    // Cargar datos iniciales
    actualizarDashboard();
    renderizarTabla();
    
    // Event listeners
    document.getElementById('ventaForm').addEventListener('submit', registrarVenta);
    document.getElementById('montoPagado').addEventListener('input', actualizarEstadoPago);
    document.getElementById('montoTotal').addEventListener('input', calcularUtilidad);
    document.getElementById('costoViaje').addEventListener('input', calcularUtilidad);
});

function generarNumeroOrden() {
    const año = new Date().getFullYear();
    const numero = String(contadorOrden).padStart(3, '0');
    document.getElementById('numeroOrden').value = `NTS-${año}-${numero}`;
}

function registrarVenta(e) {
    e.preventDefault();
    
    const nuevaVenta = {
        numeroOrden: document.getElementById('numeroOrden').value,
        nombreCliente: document.getElementById('nombreCliente').value,
        emailCliente: document.getElementById('emailCliente').value,
        fechaVenta: document.getElementById('fechaVenta').value,
        tipoVenta: document.getElementById('tipoVenta').value,
        destino: document.getElementById('destino').value,
        fechaViaje: document.getElementById('fechaViaje').value,
        montoTotal: parseFloat(document.getElementById('montoTotal').value),
        costoViaje: parseFloat(document.getElementById('costoViaje').value),
        montoPagado: parseFloat(document.getElementById('montoPagado').value || 0),
        estadoPago: document.getElementById('estadoPago').value,
        notas: document.getElementById('notas').value
    };
    
    ventasData.push(nuevaVenta);
    contadorOrden++;
    
    // Limpiar formulario
    document.getElementById('ventaForm').reset();
    document.getElementById('fechaVenta').value = new Date().toISOString().split('T')[0];
    generarNumeroOrden();
    
    // Actualizar vista
    actualizarDashboard();
    renderizarTabla();
    
    alert('✅ Venta registrada exitosamente!');
}

function actualizarEstadoPago() {
    const montoTotal = parseFloat(document.getElementById('montoTotal').value || 0);
    const montoPagado = parseFloat(document.getElementById('montoPagado').value || 0);
    const estadoPago = document.getElementById('estadoPago');
    
    if (montoPagado === 0) {
        estadoPago.value = 'Reservado';
    } else if (montoPagado < montoTotal) {
        estadoPago.value = 'Parcialmente Pagado';
    } else if (montoPagado >= montoTotal) {
        estadoPago.value = 'Pagado';
    }
}

function calcularUtilidad() {
    const montoTotal = parseFloat(document.getElementById('montoTotal').value || 0);
    const costoViaje = parseFloat(document.getElementById('costoViaje').value || 0);
    // Aquí podrías mostrar la utilidad en tiempo real si quisieras
}

function actualizarDashboard() {
    const totalFacturado = ventasData.filter(venta => venta.estadoPago !== 'Cancelado').reduce((sum, venta) => sum + venta.montoTotal, 0);
    const totalPagado = ventasData.filter(venta => venta.estadoPago !== 'Cancelado').reduce((sum, venta) => sum + venta.montoPagado, 0);
    const pendienteCobro = totalFacturado - totalPagado;
    const utilidadTotal = ventasData.filter(venta => venta.estadoPago !== 'Cancelado').reduce((sum, venta) => sum + (venta.montoTotal - venta.costoViaje), 0);
    const ordenesActivas = ventasData.filter(venta => venta.estadoPago !== 'Pagado' && venta.estadoPago !== 'Cancelado').length;
    
    document.getElementById('totalFacturado').textContent = '

function renderizarTabla(datos = ventasData) {
    const tbody = document.getElementById('ventasTabla');
    tbody.innerHTML = '';
    
    datos.forEach((venta) => {
        const montoRestante = venta.montoTotal - venta.montoPagado;
        const utilidad = venta.montoTotal - venta.costoViaje;
        
        // Encontrar el índice real en ventasData
        const ventaIndexReal = ventasData.findIndex(v => v.numeroOrden === venta.numeroOrden);
        
        const row = tbody.insertRow();
        row.innerHTML = `
            <td><span class="order-number">${venta.numeroOrden}</span></td>
            <td>
                <strong>${venta.nombreCliente}</strong><br>
                <small>${venta.emailCliente}</small>
            </td>
            <td>${formatearFecha(venta.fechaVenta)}</td>
            <td>${venta.destino}</td>
            <td>${formatearFecha(venta.fechaViaje)}</td>
            <td class="amount positive">$${venta.montoTotal.toLocaleString()}</td>
            <td class="amount ${venta.montoPagado > 0 ? 'positive' : 'negative'}">$${venta.montoPagado.toLocaleString()}</td>
            <td class="amount ${montoRestante > 0 ? 'pending' : 'positive'}">$${montoRestante.toLocaleString()}</td>
            <td><span class="status ${venta.estadoPago.toLowerCase().replace(' ', '-')}">${venta.estadoPago}</span></td>
            <td class="amount ${utilidad > 0 ? 'positive' : 'negative'}">$${utilidad.toLocaleString()}</td>
            <td>
                <button class="btn btn-small btn-warning" onclick="editarVenta(${ventaIndexReal})" title="Editar">✏️</button>
                <button class="btn btn-small btn-success" onclick="registrarPago(${ventaIndexReal})" title="Registrar Pago">💰</button>
                <button class="btn btn-small btn-warning" onclick="cancelarReserva(${ventaIndexReal})" title="Cancelar">❌</button>
                <button class="btn btn-small btn-danger" onclick="eliminarVenta(${ventaIndexReal})" title="Eliminar">🗑️</button>
            </td>
        `;
    });
}

function formatearFecha(fecha) {
    return new Date(fecha + 'T00:00:00').toLocaleDateString('es-AR');
}

function filtrarTabla() {
    const filtroEstado = document.getElementById('filtroEstado').value;
    const filtroFechaDesde = document.getElementById('filtroFechaDesde').value;
    const filtroFechaHasta = document.getElementById('filtroFechaHasta').value;
    const buscarCliente = document.getElementById('buscarCliente').value.toLowerCase();
    
    let datosFiltrados = ventasData;
    
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
            venta.emailCliente.toLowerCase().includes(buscarCliente)
        );
    }
    
    renderizarTabla(datosFiltrados);
}

function limpiarFiltros() {
    document.getElementById('filtroEstado').value = '';
    document.getElementById('filtroFechaDesde').value = '';
    document.getElementById('filtroFechaHasta').value = '';
    document.getElementById('buscarCliente').value = '';
    renderizarTabla();
}

function editarVenta(index) {
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
    document.getElementById('destino').value = venta.destino;
    document.getElementById('fechaViaje').value = venta.fechaViaje;
    document.getElementById('montoTotal').value = venta.montoTotal;
    document.getElementById('costoViaje').value = venta.costoViaje;
    document.getElementById('montoPagado').value = venta.montoPagado;
    document.getElementById('estadoPago').value = venta.estadoPago;
    document.getElementById('notas').value = venta.notas;
    
    // Eliminar la venta original para permitir la edición
    ventasData.splice(index, 1);
    contadorOrden--;
    
    // Scroll al formulario
    document.querySelector('.form-section').scrollIntoView({ behavior: 'smooth' });
    
    actualizarDashboard();
    renderizarTabla();
}

function registrarPago(index) {
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
        
        if (montoNuevo > montoRestante) {
            const confirmar = confirm(`⚠️ El monto ingresado ($${montoNuevo.toLocaleString()}) es mayor al restante ($${montoRestante.toLocaleString()}).\n\n¿Desea continuar?`);
            if (!confirmar) return;
        }
        
        venta.montoPagado += montoNuevo;
        
        // Actualizar estado
        if (venta.montoPagado >= venta.montoTotal) {
            venta.estadoPago = 'Pagado';
        } else if (venta.montoPagado > 0) {
            venta.estadoPago = 'Parcialmente Pagado';
        }
        
        actualizarDashboard();
        renderizarTabla();
        
        alert(`✅ Pago de ${montoNuevo.toLocaleString()} registrado para ${venta.nombreCliente}`);
    } else if (nuevoPago !== null) {
        alert('❌ Por favor ingrese un monto válido mayor a 0');
    }
}

function cancelarReserva(index) {
    if (index < 0 || index >= ventasData.length) {
        alert('❌ Error: Venta no encontrada');
        return;
    }
    
    const venta = ventasData[index];
    
    if (venta.estadoPago === 'Cancelado') {
        alert('❌ Esta reserva ya está cancelada');
        return;
    }
    
    const confirmacion = confirm(`¿Está seguro de cancelar la reserva de ${venta.nombreCliente}?\n\nOrden: ${venta.numeroOrden}\nDestino: ${venta.destino}\nMonto: ${venta.montoTotal.toLocaleString()}\n\nEsta acción cambiará el estado a "CANCELADO" pero mantendrá el registro.`);
    
    if (confirmacion) {
        venta.estadoPago = 'Cancelado';
        venta.notas += ` [CANCELADO el ${new Date().toLocaleDateString('es-AR')}]`;
        
        actualizarDashboard();
        renderizarTabla();
        
        alert(`❌ Reserva de ${venta.nombreCliente} marcada como CANCELADA`);
    }
}

function eliminarVenta(index) {
    if (index < 0 || index >= ventasData.length) {
        alert('❌ Error: Venta no encontrada');
        return;
    }
    
    const venta = ventasData[index];
    
    const confirmacion = confirm(`⚠️ ATENCIÓN: ¿Está seguro de ELIMINAR PERMANENTEMENTE esta venta?\n\nCliente: ${venta.nombreCliente}\nOrden: ${venta.numeroOrden}\nMonto: ${venta.montoTotal.toLocaleString()}\n\n❗ Esta acción NO se puede deshacer. El registro se eliminará completamente.\n\n💡 Recomendación: Use "Cancelar" en lugar de "Eliminar" para mantener el historial.`);
    
    if (confirmacion) {
        const textoConfirmacion = prompt('Para confirmar la eliminación permanente, escriba exactamente: ELIMINAR');
        
        if (textoConfirmacion === 'ELIMINAR') {
            const nombreCliente = venta.nombreCliente;
            ventasData.splice(index, 1);
            
            actualizarDashboard();
            renderizarTabla();
            
            alert(`🗑️ Venta de ${nombreCliente} eliminada permanentemente`);
        } else {
            alert('❌ Eliminación cancelada - debe escribir exactamente "ELIMINAR"');
        }
    }
}

function exportarCSV() {
    const headers = ['N° Orden', 'Cliente', 'Email', 'Fecha Venta', 'Destino', 'Fecha Viaje', 'Monto Total', 'Monto Pagado', 'Monto Restante', 'Estado Pago', 'Utilidad', 'Notas'];
    
    let csvContent = headers.join(',') + '\n';
    
    ventasData.forEach(venta => {
        const montoRestante = venta.montoTotal - venta.montoPagado;
        const utilidad = venta.montoTotal - venta.costoViaje;
        
        const row = [
            venta.numeroOrden,
            `"${venta.nombreCliente}"`,
            venta.emailCliente,
            venta.fechaVenta,
            `"${venta.destino}"`,
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

function exportarExcel() {
    alert('📈 Función de exportar a Excel en desarrollo. Por ahora use la exportación CSV.');
}

function imprimirReporte() {
    window.print();
} + totalFacturado.toLocaleString();
    document.getElementById('pendienteCobro').textContent = '

function renderizarTabla(datos = ventasData) {
    const tbody = document.getElementById('ventasTabla');
    tbody.innerHTML = '';
    
    datos.forEach((venta) => {
        const montoRestante = venta.montoTotal - venta.montoPagado;
        const utilidad = venta.montoTotal - venta.costoViaje;
        
        // Encontrar el índice real en ventasData
        const ventaIndexReal = ventasData.findIndex(v => v.numeroOrden === venta.numeroOrden);
        
        const row = tbody.insertRow();
        row.innerHTML = `
            <td><span class="order-number">${venta.numeroOrden}</span></td>
            <td>
                <strong>${venta.nombreCliente}</strong><br>
                <small>${venta.emailCliente}</small>
            </td>
            <td>${formatearFecha(venta.fechaVenta)}</td>
            <td>${venta.destino}</td>
            <td>${formatearFecha(venta.fechaViaje)}</td>
            <td class="amount positive">$${venta.montoTotal.toLocaleString()}</td>
            <td class="amount ${venta.montoPagado > 0 ? 'positive' : 'negative'}">$${venta.montoPagado.toLocaleString()}</td>
            <td class="amount ${montoRestante > 0 ? 'pending' : 'positive'}">$${montoRestante.toLocaleString()}</td>
            <td><span class="status ${venta.estadoPago.toLowerCase().replace(' ', '-')}">${venta.estadoPago}</span></td>
            <td class="amount ${utilidad > 0 ? 'positive' : 'negative'}">$${utilidad.toLocaleString()}</td>
            <td>
                <button class="btn btn-small btn-warning" onclick="editarVenta(${ventaIndexReal})" title="Editar">✏️</button>
                <button class="btn btn-small btn-success" onclick="registrarPago(${ventaIndexReal})" title="Registrar Pago">💰</button>
                <button class="btn btn-small btn-warning" onclick="cancelarReserva(${ventaIndexReal})" title="Cancelar">❌</button>
                <button class="btn btn-small btn-danger" onclick="eliminarVenta(${ventaIndexReal})" title="Eliminar">🗑️</button>
            </td>
        `;
    });
}

function formatearFecha(fecha) {
    return new Date(fecha + 'T00:00:00').toLocaleDateString('es-AR');
}

function filtrarTabla() {
    const filtroEstado = document.getElementById('filtroEstado').value;
    const filtroFechaDesde = document.getElementById('filtroFechaDesde').value;
    const filtroFechaHasta = document.getElementById('filtroFechaHasta').value;
    const buscarCliente = document.getElementById('buscarCliente').value.toLowerCase();
    
    let datosFiltrados = ventasData;
    
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
            venta.emailCliente.toLowerCase().includes(buscarCliente)
        );
    }
    
    renderizarTabla(datosFiltrados);
}

function limpiarFiltros() {
    document.getElementById('filtroEstado').value = '';
    document.getElementById('filtroFechaDesde').value = '';
    document.getElementById('filtroFechaHasta').value = '';
    document.getElementById('buscarCliente').value = '';
    renderizarTabla();
}

function editarVenta(index) {
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
    document.getElementById('destino').value = venta.destino;
    document.getElementById('fechaViaje').value = venta.fechaViaje;
    document.getElementById('montoTotal').value = venta.montoTotal;
    document.getElementById('costoViaje').value = venta.costoViaje;
    document.getElementById('montoPagado').value = venta.montoPagado;
    document.getElementById('estadoPago').value = venta.estadoPago;
    document.getElementById('notas').value = venta.notas;
    
    // Eliminar la venta original para permitir la edición
    ventasData.splice(index, 1);
    contadorOrden--;
    
    // Scroll al formulario
    document.querySelector('.form-section').scrollIntoView({ behavior: 'smooth' });
    
    actualizarDashboard();
    renderizarTabla();
}

function registrarPago(index) {
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
        
        if (montoNuevo > montoRestante) {
            const confirmar = confirm(`⚠️ El monto ingresado ($${montoNuevo.toLocaleString()}) es mayor al restante ($${montoRestante.toLocaleString()}).\n\n¿Desea continuar?`);
            if (!confirmar) return;
        }
        
        venta.montoPagado += montoNuevo;
        
        // Actualizar estado
        if (venta.montoPagado >= venta.montoTotal) {
            venta.estadoPago = 'Pagado';
        } else if (venta.montoPagado > 0) {
            venta.estadoPago = 'Parcialmente Pagado';
        }
        
        actualizarDashboard();
        renderizarTabla();
        
        alert(`✅ Pago de ${montoNuevo.toLocaleString()} registrado para ${venta.nombreCliente}`);
    } else if (nuevoPago !== null) {
        alert('❌ Por favor ingrese un monto válido mayor a 0');
    }
}

function cancelarReserva(index) {
    if (index < 0 || index >= ventasData.length) {
        alert('❌ Error: Venta no encontrada');
        return;
    }
    
    const venta = ventasData[index];
    
    if (venta.estadoPago === 'Cancelado') {
        alert('❌ Esta reserva ya está cancelada');
        return;
    }
    
    const confirmacion = confirm(`¿Está seguro de cancelar la reserva de ${venta.nombreCliente}?\n\nOrden: ${venta.numeroOrden}\nDestino: ${venta.destino}\nMonto: ${venta.montoTotal.toLocaleString()}\n\nEsta acción cambiará el estado a "CANCELADO" pero mantendrá el registro.`);
    
    if (confirmacion) {
        venta.estadoPago = 'Cancelado';
        venta.notas += ` [CANCELADO el ${new Date().toLocaleDateString('es-AR')}]`;
        
        actualizarDashboard();
        renderizarTabla();
        
        alert(`❌ Reserva de ${venta.nombreCliente} marcada como CANCELADA`);
    }
}

function eliminarVenta(index) {
    if (index < 0 || index >= ventasData.length) {
        alert('❌ Error: Venta no encontrada');
        return;
    }
    
    const venta = ventasData[index];
    
    const confirmacion = confirm(`⚠️ ATENCIÓN: ¿Está seguro de ELIMINAR PERMANENTEMENTE esta venta?\n\nCliente: ${venta.nombreCliente}\nOrden: ${venta.numeroOrden}\nMonto: ${venta.montoTotal.toLocaleString()}\n\n❗ Esta acción NO se puede deshacer. El registro se eliminará completamente.\n\n💡 Recomendación: Use "Cancelar" en lugar de "Eliminar" para mantener el historial.`);
    
    if (confirmacion) {
        const textoConfirmacion = prompt('Para confirmar la eliminación permanente, escriba exactamente: ELIMINAR');
        
        if (textoConfirmacion === 'ELIMINAR') {
            const nombreCliente = venta.nombreCliente;
            ventasData.splice(index, 1);
            
            actualizarDashboard();
            renderizarTabla();
            
            alert(`🗑️ Venta de ${nombreCliente} eliminada permanentemente`);
        } else {
            alert('❌ Eliminación cancelada - debe escribir exactamente "ELIMINAR"');
        }
    }
}

function exportarCSV() {
    const headers = ['N° Orden', 'Cliente', 'Email', 'Fecha Venta', 'Destino', 'Fecha Viaje', 'Monto Total', 'Monto Pagado', 'Monto Restante', 'Estado Pago', 'Utilidad', 'Notas'];
    
    let csvContent = headers.join(',') + '\n';
    
    ventasData.forEach(venta => {
        const montoRestante = venta.montoTotal - venta.montoPagado;
        const utilidad = venta.montoTotal - venta.costoViaje;
        
        const row = [
            venta.numeroOrden,
            `"${venta.nombreCliente}"`,
            venta.emailCliente,
            venta.fechaVenta,
            `"${venta.destino}"`,
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

function exportarExcel() {
    alert('📈 Función de exportar a Excel en desarrollo. Por ahora use la exportación CSV.');
}

function imprimirReporte() {
    window.print();
} + pendienteCobro.toLocaleString();
    document.getElementById('utilidadTotal').textContent = '

function renderizarTabla(datos = ventasData) {
    const tbody = document.getElementById('ventasTabla');
    tbody.innerHTML = '';
    
    datos.forEach((venta) => {
        const montoRestante = venta.montoTotal - venta.montoPagado;
        const utilidad = venta.montoTotal - venta.costoViaje;
        
        // Encontrar el índice real en ventasData
        const ventaIndexReal = ventasData.findIndex(v => v.numeroOrden === venta.numeroOrden);
        
        const row = tbody.insertRow();
        row.innerHTML = `
            <td><span class="order-number">${venta.numeroOrden}</span></td>
            <td>
                <strong>${venta.nombreCliente}</strong><br>
                <small>${venta.emailCliente}</small>
            </td>
            <td>${formatearFecha(venta.fechaVenta)}</td>
            <td>${venta.destino}</td>
            <td>${formatearFecha(venta.fechaViaje)}</td>
            <td class="amount positive">$${venta.montoTotal.toLocaleString()}</td>
            <td class="amount ${venta.montoPagado > 0 ? 'positive' : 'negative'}">$${venta.montoPagado.toLocaleString()}</td>
            <td class="amount ${montoRestante > 0 ? 'pending' : 'positive'}">$${montoRestante.toLocaleString()}</td>
            <td><span class="status ${venta.estadoPago.toLowerCase().replace(' ', '-')}">${venta.estadoPago}</span></td>
            <td class="amount ${utilidad > 0 ? 'positive' : 'negative'}">$${utilidad.toLocaleString()}</td>
            <td>
                <button class="btn btn-small btn-warning" onclick="editarVenta(${ventaIndexReal})" title="Editar">✏️</button>
                <button class="btn btn-small btn-success" onclick="registrarPago(${ventaIndexReal})" title="Registrar Pago">💰</button>
                <button class="btn btn-small btn-warning" onclick="cancelarReserva(${ventaIndexReal})" title="Cancelar">❌</button>
                <button class="btn btn-small btn-danger" onclick="eliminarVenta(${ventaIndexReal})" title="Eliminar">🗑️</button>
            </td>
        `;
    });
}

function formatearFecha(fecha) {
    return new Date(fecha + 'T00:00:00').toLocaleDateString('es-AR');
}

function filtrarTabla() {
    const filtroEstado = document.getElementById('filtroEstado').value;
    const filtroFechaDesde = document.getElementById('filtroFechaDesde').value;
    const filtroFechaHasta = document.getElementById('filtroFechaHasta').value;
    const buscarCliente = document.getElementById('buscarCliente').value.toLowerCase();
    
    let datosFiltrados = ventasData;
    
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
            venta.emailCliente.toLowerCase().includes(buscarCliente)
        );
    }
    
    renderizarTabla(datosFiltrados);
}

function limpiarFiltros() {
    document.getElementById('filtroEstado').value = '';
    document.getElementById('filtroFechaDesde').value = '';
    document.getElementById('filtroFechaHasta').value = '';
    document.getElementById('buscarCliente').value = '';
    renderizarTabla();
}

function editarVenta(index) {
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
    document.getElementById('destino').value = venta.destino;
    document.getElementById('fechaViaje').value = venta.fechaViaje;
    document.getElementById('montoTotal').value = venta.montoTotal;
    document.getElementById('costoViaje').value = venta.costoViaje;
    document.getElementById('montoPagado').value = venta.montoPagado;
    document.getElementById('estadoPago').value = venta.estadoPago;
    document.getElementById('notas').value = venta.notas;
    
    // Eliminar la venta original para permitir la edición
    ventasData.splice(index, 1);
    contadorOrden--;
    
    // Scroll al formulario
    document.querySelector('.form-section').scrollIntoView({ behavior: 'smooth' });
    
    actualizarDashboard();
    renderizarTabla();
}

function registrarPago(index) {
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
        
        if (montoNuevo > montoRestante) {
            const confirmar = confirm(`⚠️ El monto ingresado ($${montoNuevo.toLocaleString()}) es mayor al restante ($${montoRestante.toLocaleString()}).\n\n¿Desea continuar?`);
            if (!confirmar) return;
        }
        
        venta.montoPagado += montoNuevo;
        
        // Actualizar estado
        if (venta.montoPagado >= venta.montoTotal) {
            venta.estadoPago = 'Pagado';
        } else if (venta.montoPagado > 0) {
            venta.estadoPago = 'Parcialmente Pagado';
        }
        
        actualizarDashboard();
        renderizarTabla();
        
        alert(`✅ Pago de ${montoNuevo.toLocaleString()} registrado para ${venta.nombreCliente}`);
    } else if (nuevoPago !== null) {
        alert('❌ Por favor ingrese un monto válido mayor a 0');
    }
}

function cancelarReserva(index) {
    if (index < 0 || index >= ventasData.length) {
        alert('❌ Error: Venta no encontrada');
        return;
    }
    
    const venta = ventasData[index];
    
    if (venta.estadoPago === 'Cancelado') {
        alert('❌ Esta reserva ya está cancelada');
        return;
    }
    
    const confirmacion = confirm(`¿Está seguro de cancelar la reserva de ${venta.nombreCliente}?\n\nOrden: ${venta.numeroOrden}\nDestino: ${venta.destino}\nMonto: ${venta.montoTotal.toLocaleString()}\n\nEsta acción cambiará el estado a "CANCELADO" pero mantendrá el registro.`);
    
    if (confirmacion) {
        venta.estadoPago = 'Cancelado';
        venta.notas += ` [CANCELADO el ${new Date().toLocaleDateString('es-AR')}]`;
        
        actualizarDashboard();
        renderizarTabla();
        
        alert(`❌ Reserva de ${venta.nombreCliente} marcada como CANCELADA`);
    }
}

function eliminarVenta(index) {
    if (index < 0 || index >= ventasData.length) {
        alert('❌ Error: Venta no encontrada');
        return;
    }
    
    const venta = ventasData[index];
    
    const confirmacion = confirm(`⚠️ ATENCIÓN: ¿Está seguro de ELIMINAR PERMANENTEMENTE esta venta?\n\nCliente: ${venta.nombreCliente}\nOrden: ${venta.numeroOrden}\nMonto: ${venta.montoTotal.toLocaleString()}\n\n❗ Esta acción NO se puede deshacer. El registro se eliminará completamente.\n\n💡 Recomendación: Use "Cancelar" en lugar de "Eliminar" para mantener el historial.`);
    
    if (confirmacion) {
        const textoConfirmacion = prompt('Para confirmar la eliminación permanente, escriba exactamente: ELIMINAR');
        
        if (textoConfirmacion === 'ELIMINAR') {
            const nombreCliente = venta.nombreCliente;
            ventasData.splice(index, 1);
            
            actualizarDashboard();
            renderizarTabla();
            
            alert(`🗑️ Venta de ${nombreCliente} eliminada permanentemente`);
        } else {
            alert('❌ Eliminación cancelada - debe escribir exactamente "ELIMINAR"');
        }
    }
}

function exportarCSV() {
    const headers = ['N° Orden', 'Cliente', 'Email', 'Fecha Venta', 'Destino', 'Fecha Viaje', 'Monto Total', 'Monto Pagado', 'Monto Restante', 'Estado Pago', 'Utilidad', 'Notas'];
    
    let csvContent = headers.join(',') + '\n';
    
    ventasData.forEach(venta => {
        const montoRestante = venta.montoTotal - venta.montoPagado;
        const utilidad = venta.montoTotal - venta.costoViaje;
        
        const row = [
            venta.numeroOrden,
            `"${venta.nombreCliente}"`,
            venta.emailCliente,
            venta.fechaVenta,
            `"${venta.destino}"`,
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

function exportarExcel() {
    alert('📈 Función de exportar a Excel en desarrollo. Por ahora use la exportación CSV.');
}

function imprimirReporte() {
    window.print();
} + utilidadTotal.toLocaleString();
    document.getElementById('ordenesActivas').textContent = ordenesActivas;
    
    // Actualizar estadísticas por tipo
    const tipos = ['Hotel', 'Vuelos', 'Cruceros', 'Excursion', 'Traslado', 'Paquete Completo'];
    tipos.forEach(tipo => {
        const count = ventasData.filter(venta => venta.tipoVenta === tipo && venta.estadoPago !== 'Cancelado').length;
        const elementId = 'stat' + tipo.replace(' ', '').replace('ó', 'o');
        const element = document.getElementById(elementId);
        if (element) element.textContent = count;
    });
}

function renderizarTabla(datos = ventasData) {
    const tbody = document.getElementById('ventasTabla');
    tbody.innerHTML = '';
    
    datos.forEach((venta) => {
        const montoRestante = venta.montoTotal - venta.montoPagado;
        const utilidad = venta.montoTotal - venta.costoViaje;
        
        // Encontrar el índice real en ventasData
        const ventaIndexReal = ventasData.findIndex(v => v.numeroOrden === venta.numeroOrden);
        
        const row = tbody.insertRow();
        row.innerHTML = `
            <td><span class="order-number">${venta.numeroOrden}</span></td>
            <td>
                <strong>${venta.nombreCliente}</strong><br>
                <small>${venta.emailCliente}</small>
            </td>
            <td>${formatearFecha(venta.fechaVenta)}</td>
            <td>${venta.destino}</td>
            <td>${formatearFecha(venta.fechaViaje)}</td>
            <td class="amount positive">$${venta.montoTotal.toLocaleString()}</td>
            <td class="amount ${venta.montoPagado > 0 ? 'positive' : 'negative'}">$${venta.montoPagado.toLocaleString()}</td>
            <td class="amount ${montoRestante > 0 ? 'pending' : 'positive'}">$${montoRestante.toLocaleString()}</td>
            <td><span class="status ${venta.estadoPago.toLowerCase().replace(' ', '-')}">${venta.estadoPago}</span></td>
            <td class="amount ${utilidad > 0 ? 'positive' : 'negative'}">$${utilidad.toLocaleString()}</td>
            <td>
                <button class="btn btn-small btn-warning" onclick="editarVenta(${ventaIndexReal})" title="Editar">✏️</button>
                <button class="btn btn-small btn-success" onclick="registrarPago(${ventaIndexReal})" title="Registrar Pago">💰</button>
                <button class="btn btn-small btn-warning" onclick="cancelarReserva(${ventaIndexReal})" title="Cancelar">❌</button>
                <button class="btn btn-small btn-danger" onclick="eliminarVenta(${ventaIndexReal})" title="Eliminar">🗑️</button>
            </td>
        `;
    });
}

function formatearFecha(fecha) {
    return new Date(fecha + 'T00:00:00').toLocaleDateString('es-AR');
}

function filtrarTabla() {
    const filtroEstado = document.getElementById('filtroEstado').value;
    const filtroFechaDesde = document.getElementById('filtroFechaDesde').value;
    const filtroFechaHasta = document.getElementById('filtroFechaHasta').value;
    const buscarCliente = document.getElementById('buscarCliente').value.toLowerCase();
    
    let datosFiltrados = ventasData;
    
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
            venta.emailCliente.toLowerCase().includes(buscarCliente)
        );
    }
    
    renderizarTabla(datosFiltrados);
}

function limpiarFiltros() {
    document.getElementById('filtroEstado').value = '';
    document.getElementById('filtroFechaDesde').value = '';
    document.getElementById('filtroFechaHasta').value = '';
    document.getElementById('buscarCliente').value = '';
    renderizarTabla();
}

function editarVenta(index) {
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
    document.getElementById('destino').value = venta.destino;
    document.getElementById('fechaViaje').value = venta.fechaViaje;
    document.getElementById('montoTotal').value = venta.montoTotal;
    document.getElementById('costoViaje').value = venta.costoViaje;
    document.getElementById('montoPagado').value = venta.montoPagado;
    document.getElementById('estadoPago').value = venta.estadoPago;
    document.getElementById('notas').value = venta.notas;
    
    // Eliminar la venta original para permitir la edición
    ventasData.splice(index, 1);
    contadorOrden--;
    
    // Scroll al formulario
    document.querySelector('.form-section').scrollIntoView({ behavior: 'smooth' });
    
    actualizarDashboard();
    renderizarTabla();
}

function registrarPago(index) {
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
        
        if (montoNuevo > montoRestante) {
            const confirmar = confirm(`⚠️ El monto ingresado ($${montoNuevo.toLocaleString()}) es mayor al restante ($${montoRestante.toLocaleString()}).\n\n¿Desea continuar?`);
            if (!confirmar) return;
        }
        
        venta.montoPagado += montoNuevo;
        
        // Actualizar estado
        if (venta.montoPagado >= venta.montoTotal) {
            venta.estadoPago = 'Pagado';
        } else if (venta.montoPagado > 0) {
            venta.estadoPago = 'Parcialmente Pagado';
        }
        
        actualizarDashboard();
        renderizarTabla();
        
        alert(`✅ Pago de ${montoNuevo.toLocaleString()} registrado para ${venta.nombreCliente}`);
    } else if (nuevoPago !== null) {
        alert('❌ Por favor ingrese un monto válido mayor a 0');
    }
}

function cancelarReserva(index) {
    if (index < 0 || index >= ventasData.length) {
        alert('❌ Error: Venta no encontrada');
        return;
    }
    
    const venta = ventasData[index];
    
    if (venta.estadoPago === 'Cancelado') {
        alert('❌ Esta reserva ya está cancelada');
        return;
    }
    
    const confirmacion = confirm(`¿Está seguro de cancelar la reserva de ${venta.nombreCliente}?\n\nOrden: ${venta.numeroOrden}\nDestino: ${venta.destino}\nMonto: ${venta.montoTotal.toLocaleString()}\n\nEsta acción cambiará el estado a "CANCELADO" pero mantendrá el registro.`);
    
    if (confirmacion) {
        venta.estadoPago = 'Cancelado';
        venta.notas += ` [CANCELADO el ${new Date().toLocaleDateString('es-AR')}]`;
        
        actualizarDashboard();
        renderizarTabla();
        
        alert(`❌ Reserva de ${venta.nombreCliente} marcada como CANCELADA`);
    }
}

function eliminarVenta(index) {
    if (index < 0 || index >= ventasData.length) {
        alert('❌ Error: Venta no encontrada');
        return;
    }
    
    const venta = ventasData[index];
    
    const confirmacion = confirm(`⚠️ ATENCIÓN: ¿Está seguro de ELIMINAR PERMANENTEMENTE esta venta?\n\nCliente: ${venta.nombreCliente}\nOrden: ${venta.numeroOrden}\nMonto: ${venta.montoTotal.toLocaleString()}\n\n❗ Esta acción NO se puede deshacer. El registro se eliminará completamente.\n\n💡 Recomendación: Use "Cancelar" en lugar de "Eliminar" para mantener el historial.`);
    
    if (confirmacion) {
        const textoConfirmacion = prompt('Para confirmar la eliminación permanente, escriba exactamente: ELIMINAR');
        
        if (textoConfirmacion === 'ELIMINAR') {
            const nombreCliente = venta.nombreCliente;
            ventasData.splice(index, 1);
            
            actualizarDashboard();
            renderizarTabla();
            
            alert(`🗑️ Venta de ${nombreCliente} eliminada permanentemente`);
        } else {
            alert('❌ Eliminación cancelada - debe escribir exactamente "ELIMINAR"');
        }
    }
}

function exportarCSV() {
    const headers = ['N° Orden', 'Cliente', 'Email', 'Fecha Venta', 'Destino', 'Fecha Viaje', 'Monto Total', 'Monto Pagado', 'Monto Restante', 'Estado Pago', 'Utilidad', 'Notas'];
    
    let csvContent = headers.join(',') + '\n';
    
    ventasData.forEach(venta => {
        const montoRestante = venta.montoTotal - venta.montoPagado;
        const utilidad = venta.montoTotal - venta.costoViaje;
        
        const row = [
            venta.numeroOrden,
            `"${venta.nombreCliente}"`,
            venta.emailCliente,
            venta.fechaVenta,
            `"${venta.destino}"`,
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

function exportarExcel() {
    alert('📈 Función de exportar a Excel en desarrollo. Por ahora use la exportación CSV.');
}

function imprimirReporte() {
    window.print();
}
