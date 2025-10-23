/**
 * Configuración de la aplicación
 */

export interface AppConfig {
  twilio: {
    accountSid: string;
    authToken: string;
    phoneNumber: string;
  };
  app: {
    name: string;
    baseUrl: string;
  };
  storage: {
    dataPath: string;
  };
}

export class Config {
  private static instance: Config;
  private config: AppConfig;

  private constructor() {
    this.config = {
      twilio: {
        accountSid: process.env.TWILIO_ACCOUNT_SID || '',
        authToken: process.env.TWILIO_AUTH_TOKEN || '',
        phoneNumber: process.env.TWILIO_PHONE_NUMBER || ''
      },
      app: {
        name: process.env.APP_NAME || 'Sistema de Recomendación',
        baseUrl: process.env.BASE_URL || 'http://localhost:8888'
      },
      storage: {
        dataPath: process.env.DATA_PATH || './data'
      }
    };
  }

  /**
   * Obtiene la instancia única de configuración (Singleton)
   */
  public static getInstance(): Config {
    if (!Config.instance) {
      Config.instance = new Config();
    }
    return Config.instance;
  }

  /**
   * Obtiene la configuración completa
   */
  public getConfig(): AppConfig {
    return this.config;
  }

  /**
   * Obtiene la configuración de Twilio
   */
  public getTwilioConfig() {
    return this.config.twilio;
  }

  /**
   * Obtiene la configuración de la aplicación
   */
  public getAppConfig() {
    return this.config.app;
  }

  /**
   * Obtiene la configuración de almacenamiento
   */
  public getStorageConfig() {
    return this.config.storage;
  }

  /**
   * Valida que la configuración esté completa
   */
  public validar(): { valida: boolean; errores: string[] } {
    const errores: string[] = [];

    if (!this.config.twilio.accountSid) {
      errores.push('TWILIO_ACCOUNT_SID no está configurado');
    }

    if (!this.config.twilio.authToken) {
      errores.push('TWILIO_AUTH_TOKEN no está configurado');
    }

    if (!this.config.twilio.phoneNumber) {
      errores.push('TWILIO_PHONE_NUMBER no está configurado');
    }

    return {
      valida: errores.length === 0,
      errores
    };
  }
}
