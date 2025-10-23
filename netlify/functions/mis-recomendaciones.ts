/**
 * Netlify Function: Mis Recomendaciones
 * GET /api/mis-recomendaciones?codigo=XXXX
 * Obtiene las recomendaciones realizadas por un cliente
 */

import { Handler, HandlerEvent } from '@netlify/functions';
import { RecomendacionService } from '../../src/services/RecomendacionService';
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

    // Crear los servicios
    const recomendacionService = new RecomendacionService();
    const clienteService = new ClienteService();

    // Verificar que el cliente exista
    const cliente = await clienteService.obtenerClientePorCodigo(codigo);
    if (!cliente) {
      return ResponseBuilder.httpResponse(
        404,
        ResponseBuilder.error('Cliente no encontrado', [
          'No existe un cliente con ese código'
        ])
      );
    }

    // Obtener las recomendaciones
    const resultado = await recomendacionService.obtenerRecomendacionesPorCliente(codigo);

    if (!resultado.exito) {
      return ResponseBuilder.httpResponse(
        400,
        ResponseBuilder.error(resultado.mensaje, resultado.errores)
      );
    }

    return ResponseBuilder.httpResponse(
      200,
      ResponseBuilder.exito(resultado.mensaje, {
        cliente,
        recomendaciones: resultado.recomendaciones
      })
    );
  } catch (error: any) {
    console.error('Error en mis-recomendaciones:', error);
    return ResponseBuilder.httpResponse(
      500,
      ResponseBuilder.error('Error interno del servidor', [error.message])
    );
  }
};

export { handler };
