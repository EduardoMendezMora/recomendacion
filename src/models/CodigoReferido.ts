/**
 * Modelo de dominio: Código de Referido
 * Representa un código único de 4 dígitos para cada cliente
 */

export interface ICodigoReferido {
  codigo: string;
  clienteId: string;
  activo: boolean;
  fechaCreacion: Date;
}

export class CodigoReferido implements ICodigoReferido {
  public codigo: string;
  public clienteId: string;
  public activo: boolean;
  public fechaCreacion: Date;

  constructor(data: Partial<ICodigoReferido>) {
    this.codigo = data.codigo || '';
    this.clienteId = data.clienteId || '';
    this.activo = data.activo !== undefined ? data.activo : true;
    this.fechaCreacion = data.fechaCreacion || new Date();
  }

  /**
   * Valida que el código sea válido
   */
  public validar(): { valido: boolean; errores: string[] } {
    const errores: string[] = [];

    if (!this.codigo || this.codigo.length !== 4) {
      errores.push('El código debe tener exactamente 4 dígitos');
    }

    if (!/^\d{4}$/.test(this.codigo)) {
      errores.push('El código debe contener solo dígitos');
    }

    if (!this.clienteId) {
      errores.push('Se requiere el ID del cliente');
    }

    return {
      valido: errores.length === 0,
      errores
    };
  }

  /**
   * Desactiva el código
   */
  public desactivar(): void {
    this.activo = false;
  }

  /**
   * Activa el código
   */
  public activar(): void {
    this.activo = true;
  }

  /**
   * Convierte el código a un objeto plano para persistencia
   */
  public toJSON(): ICodigoReferido {
    return {
      codigo: this.codigo,
      clienteId: this.clienteId,
      activo: this.activo,
      fechaCreacion: this.fechaCreacion
    };
  }

  /**
   * Crea una instancia de CodigoReferido desde un objeto plano
   */
  public static fromJSON(data: any): CodigoReferido {
    return new CodigoReferido({
      ...data,
      fechaCreacion: new Date(data.fechaCreacion)
    });
  }

  /**
   * Genera un código aleatorio de 4 dígitos
   */
  public static generarCodigo(): string {
    return Math.floor(1000 + Math.random() * 9000).toString();
  }
}
