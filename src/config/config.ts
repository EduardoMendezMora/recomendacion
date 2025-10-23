/**
 * Configuración de la aplicación
 */

export interface AppConfig {
  ultramsg: {
    instanceId: string;
    token: string;
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
      ultramsg: {
        instanceId: process.env.ULTRAMSG_INSTANCE_ID || 'instance112077',
        token: process.env.ULTRAMSG_TOKEN || 'wp98xs1qrfhqg9ya'
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
   * Obtiene la configuración de UltraMsg
   */
  public getUltraMsgConfig() {
    return this.config.ultramsg;
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
  public validar(): { valido: boolean; errores: string[] } {
    const errores: string[] = [];

    if (!this.config.ultramsg.instanceId) {
      errores.push('ULTRAMSG_INSTANCE_ID no está configurado');
    }

    if (!this.config.ultramsg.token) {
      errores.push('ULTRAMSG_TOKEN no está configurado');
    }

    return {
      valido: errores.length === 0,
      errores
    };
  }
}
