/**
 * Utilidad: Response
 * Estandariza las respuestas de la API
 */

export interface ApiResponse<T = any> {
  exito: boolean;
  mensaje: string;
  datos?: T;
  errores?: string[];
}

export class ResponseBuilder {
  /**
   * Construye una respuesta exitosa
   */
  public static exito<T>(mensaje: string, datos?: T): ApiResponse<T> {
    return {
      exito: true,
      mensaje,
      datos
    };
  }

  /**
   * Construye una respuesta de error
   */
  public static error(mensaje: string, errores?: string[]): ApiResponse {
    return {
      exito: false,
      mensaje,
      errores
    };
  }

  /**
   * Construye una respuesta HTTP para Netlify Functions
   */
  public static httpResponse(
    statusCode: number,
    body: ApiResponse
  ): {
    statusCode: number;
    headers: { [key: string]: string };
    body: string;
  } {
    return {
      statusCode,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
      },
      body: JSON.stringify(body)
    };
  }
}
