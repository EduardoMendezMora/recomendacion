/**
 * Netlify Function: Crear Recomendación
 * POST /api/crear-recomendacion
 * Crea una nueva recomendación de cliente
 */

import { Handler, HandlerEvent } from '@netlify/functions';
import { RecomendacionService } from '../../src/services/RecomendacionService';
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
    const { codigoRecomendador, nombreRecomendado, telefonoRecomendado } = body;

    // Validar campos requeridos
    if (!codigoRecomendador || !nombreRecomendado || !telefonoRecomendado) {
      return ResponseBuilder.httpResponse(
        400,
        ResponseBuilder.error('Todos los campos son requeridos', [
          'codigoRecomendador, nombreRecomendado y telefonoRecomendado son obligatorios'
        ])
      );
    }

    // Crear el servicio
    const recomendacionService = new RecomendacionService();

    // Crear la recomendación
    const resultado = await recomendacionService.crearRecomendacion({
      codigoRecomendador,
      nombreRecomendado,
      telefonoRecomendado
    });

    if (!resultado.exito) {
      return ResponseBuilder.httpResponse(
        400,
        ResponseBuilder.error(resultado.mensaje, resultado.errores)
      );
    }

    return ResponseBuilder.httpResponse(
      201,
      ResponseBuilder.exito(resultado.mensaje, resultado.recomendacion)
    );
  } catch (error: any) {
    console.error('Error en crear-recomendacion:', error);
    return ResponseBuilder.httpResponse(
      500,
      ResponseBuilder.error('Error interno del servidor', [error.message])
    );
  }
};

export { handler };
