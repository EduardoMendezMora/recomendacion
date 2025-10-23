/**
 * Netlify Function: Consultar Cliente
 * GET /api/consultar-cliente?codigo=XXXX
 * Obtiene información de un cliente por su código de referido
 */

import { Handler, HandlerEvent } from '@netlify/functions';
import { ClienteService } from '../../src/services/ClienteService';
import { ResponseBuilder } from '../../src/utils/Response';

const handler: Handler = async (event: HandlerEvent) => {
  // Manejar CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return ResponseBuilder.httpResponse(200, ResponseBuilder.exito('OK'));
  }

  // Solo aceptar método GET
  if (event.httpMethod !== 'GET') {
    return ResponseBuilder.httpResponse(
      405,
      ResponseBuilder.error('Método no permitido')
    );
  }

  try {
    // Obtener el código de los query parameters
    const codigo = event.queryStringParameters?.codigo;

    if (!codigo) {
      return ResponseBuilder.httpResponse(
        400,
        ResponseBuilder.error('Código de referido requerido', [
          'Debe proporcionar el parámetro "codigo"'
        ])
      );
    }

    // Crear el servicio
    const clienteService = new ClienteService();

    // Buscar el cliente
    const cliente = await clienteService.obtenerClientePorCodigo(codigo);

    if (!cliente) {
      return ResponseBuilder.httpResponse(
        404,
        ResponseBuilder.error('Cliente no encontrado', [
          'No existe un cliente con ese código'
        ])
      );
    }

    return ResponseBuilder.httpResponse(
      200,
      ResponseBuilder.exito('Cliente encontrado', cliente)
    );
  } catch (error: any) {
    console.error('Error en consultar-cliente:', error);
    return ResponseBuilder.httpResponse(
      500,
      ResponseBuilder.error('Error interno del servidor', [error.message])
    );
  }
};

export { handler };
