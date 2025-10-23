/**
 * Servicio: SMSService
 * Maneja el envío de mensajes SMS usando Twilio
 */

import { Config } from '../config/config';

export interface SMSResult {
  exito: boolean;
  mensaje: string;
  sid?: string;
}

export class SMSService {
  private config: Config;
  private twilioClient: any;

  constructor() {
    this.config = Config.getInstance();
    this.inicializarTwilio();
  }

  /**
   * Inicializa el cliente de Twilio
   */
  private inicializarTwilio(): void {
    try {
      const twilioConfig = this.config.getTwilioConfig();

      // Solo inicializar Twilio si las credenciales están configuradas
      if (twilioConfig.accountSid && twilioConfig.authToken) {
        const twilio = require('twilio');
        this.twilioClient = twilio(twilioConfig.accountSid, twilioConfig.authToken);
      }
    } catch (error) {
      console.error('Error al inicializar Twilio:', error);
    }
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
   * Envía un SMS genérico
   */
  private async enviarSMS(telefono: string, mensaje: string): Promise<SMSResult> {
    // Si Twilio no está configurado, simular envío
    if (!this.twilioClient) {
      console.log('MODO DESARROLLO - SMS simulado:');
      console.log(`Para: ${telefono}`);
      console.log(`Mensaje: ${mensaje}`);
      return {
        exito: true,
        mensaje: 'SMS simulado (Twilio no configurado)',
        sid: 'SIM' + Date.now()
      };
    }

    try {
      const twilioConfig = this.config.getTwilioConfig();
      const result = await this.twilioClient.messages.create({
        body: mensaje,
        from: twilioConfig.phoneNumber,
        to: telefono
      });

      return {
        exito: true,
        mensaje: 'SMS enviado exitosamente',
        sid: result.sid
      };
    } catch (error: any) {
      console.error('Error al enviar SMS:', error);
      return {
        exito: false,
        mensaje: `Error al enviar SMS: ${error.message}`
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
