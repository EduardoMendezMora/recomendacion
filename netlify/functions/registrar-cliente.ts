/**
 * Netlify Function: Registrar Cliente
 * POST /api/registrar-cliente
 * Registra un nuevo cliente en el sistema
 */

import { Handler, HandlerEvent } from '@netlify/functions';
import { ClienteService } from '../../src/services/ClienteService';
import { ResponseBuilder } from '../../src/utils/Response';

const handler: Handler = async (event: HandlerEvent) => {
  // Manejar CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return ResponseBuilder.httpResponse(200, ResponseBuilder.exito('OK'));
  }

  // Solo aceptar método POST
  if (event.httpMethod !== 'POST') {
    return ResponseBuilder.httpResponse(
      405,
      ResponseBuilder.error('Método no permitido')
    );
  }

  try {
    // Parsear el body
    if (!event.body) {
      return ResponseBuilder.httpResponse(
        400,
        ResponseBuilder.error('Cuerpo de la petición requerido')
      );
    }

    const body = JSON.parse(event.body);
    const { nombre, telefono, codigoRecomendador } = body;

    // Validar campos requeridos
    if (!nombre || !telefono) {
      return ResponseBuilder.httpResponse(
        400,
        ResponseBuilder.error('Nombre y teléfono son requeridos', [
          'Campos obligatorios faltantes'
        ])
      );
    }

    // Crear el servicio
    const clienteService = new ClienteService();

    // Registrar el cliente
    const resultado = await clienteService.registrarCliente({
      nombre,
      telefono,
      codigoRecomendador
    });

    if (!resultado.exito) {
      return ResponseBuilder.httpResponse(
        400,
        ResponseBuilder.error(resultado.mensaje, resultado.errores)
      );
    }

    return ResponseBuilder.httpResponse(
      201,
      ResponseBuilder.exito(resultado.mensaje, resultado.cliente)
    );
  } catch (error: any) {
    console.error('Error en registrar-cliente:', error);
    return ResponseBuilder.httpResponse(
      500,
      ResponseBuilder.error('Error interno del servidor', [error.message])
    );
  }
};

export { handler };
