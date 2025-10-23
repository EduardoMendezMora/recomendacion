/**
 * Servicio: SMSService
 * Maneja el envío de mensajes WhatsApp usando UltraMsg
 */

import { Config } from '../config/config';

export interface SMSResult {
  exito: boolean;
  mensaje: string;
  messageId?: string;
}

export class SMSService {
  private config: Config;
  private ultraMsgConfig: { instanceId: string; token: string };

  constructor() {
    this.config = Config.getInstance();
    this.ultraMsgConfig = this.config.getUltraMsgConfig();
  }

  /**
   * Envía un SMS de bienvenida con el código de referido
   */
  public async enviarMensajeBienvenida(
    telefono: string,
    nombre: string,
    codigoReferido: string
  ): Promise<SMSResult> {
    const mensaje = this.construirMensajeBienvenida(nombre, codigoReferido);
    return await this.enviarSMS(telefono, mensaje);
  }

  /**
   * Envía un SMS de invitación a un cliente recomendado
   */
  public async enviarMensajeInvitacion(
    telefono: string,
    nombreRecomendado: string,
    nombreRecomendador: string,
    codigoRecomendador: string
  ): Promise<SMSResult> {
    const mensaje = this.construirMensajeInvitacion(
      nombreRecomendado,
      nombreRecomendador,
      codigoRecomendador
    );
    return await this.enviarSMS(telefono, mensaje);
  }

  /**
   * Envía un mensaje de WhatsApp usando UltraMsg
   */
  private async enviarSMS(telefono: string, mensaje: string): Promise<SMSResult> {
    // Validar configuración
    if (!this.ultraMsgConfig.instanceId || !this.ultraMsgConfig.token) {
      console.log('MODO DESARROLLO - Mensaje simulado:');
      console.log(`Para: ${telefono}`);
      console.log(`Mensaje: ${mensaje}`);
      return {
        exito: true,
        mensaje: 'Mensaje simulado (UltraMsg no configurado)',
        messageId: 'SIM' + Date.now()
      };
    }

    try {
      // Preparar el número en formato internacional sin el +
      // Si el número ya tiene código de país, lo usamos tal cual
      // Si no, asumimos Costa Rica (+506)
      let numeroFormateado = telefono.replace(/[^0-9]/g, '');
      if (!numeroFormateado.startsWith('506') && numeroFormateado.length === 8) {
        numeroFormateado = '506' + numeroFormateado;
      }

      // Construir la URL de la API
      const url = `https://api.ultramsg.com/${this.ultraMsgConfig.instanceId}/messages/chat`;

      // Preparar el cuerpo de la petición
      const body = {
        token: this.ultraMsgConfig.token,
        to: numeroFormateado,
        body: mensaje
      };

      // Realizar la petición HTTP
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (response.ok && data.sent) {
        return {
          exito: true,
          mensaje: 'Mensaje de WhatsApp enviado exitosamente',
          messageId: data.id || data.message_id
        };
      } else {
        console.error('Error en respuesta de UltraMsg:', data);
        return {
          exito: false,
          mensaje: `Error al enviar mensaje: ${data.error || data.message || 'Error desconocido'}`
        };
      }
    } catch (error: any) {
      console.error('Error al enviar mensaje vía UltraMsg:', error);
      return {
        exito: false,
        mensaje: `Error al enviar mensaje: ${error.message}`
      };
    }
  }

  /**
   * Construye el mensaje de bienvenida
   */
  private construirMensajeBienvenida(nombre: string, codigoReferido: string): string {
    const appConfig = this.config.getAppConfig();
    return `¡Hola ${nombre}! Bienvenido a ${appConfig.name}. Tu código de referido es: ${codigoReferido}. Compártelo con tus amigos para ganar beneficios. ${appConfig.baseUrl}`;
  }

  /**
   * Construye el mensaje de invitación
   */
  private construirMensajeInvitacion(
    nombreRecomendado: string,
    nombreRecomendador: string,
    codigoRecomendador: string
  ): string {
    const appConfig = this.config.getAppConfig();
    return `¡Hola ${nombreRecomendado}! ${nombreRecomendador} te ha recomendado para ${appConfig.name}. Regístrate usando el código ${codigoRecomendador} y obtén beneficios especiales. ${appConfig.baseUrl}`;
  }

  /**
   * Valida que el servicio esté configurado correctamente
   */
  public validarConfiguracion(): { valido: boolean; errores: string[] } {
    return this.config.validar();
  }
}
