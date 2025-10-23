/**
 * Modelo de dominio: Recomendación
 * Representa una recomendación entre clientes
 */

export enum EstadoRecomendacion {
  PENDIENTE = 'PENDIENTE',
  ACEPTADA = 'ACEPTADA',
  RECHAZADA = 'RECHAZADA'
}

export interface IRecomendacion {
  id: string;
  clienteRecomendadorId: string;
  clienteRecomendadoId?: string; // Se asigna cuando el recomendado se registra
  nombreRecomendado: string;
  telefonoRecomendado: string;
  estado: EstadoRecomendacion;
  fechaRecomendacion: Date;
  fechaAceptacion?: Date;
  mensajeEnviado: boolean;
}

export class Recomendacion implements IRecomendacion {
  public id: string;
  public clienteRecomendadorId: string;
  public clienteRecomendadoId?: string;
  public nombreRecomendado: string;
  public telefonoRecomendado: string;
  public estado: EstadoRecomendacion;
  public fechaRecomendacion: Date;
  public fechaAceptacion?: Date;
  public mensajeEnviado: boolean;

  constructor(data: Partial<IRecomendacion>) {
    this.id = data.id || '';
    this.clienteRecomendadorId = data.clienteRecomendadorId || '';
    this.clienteRecomendadoId = data.clienteRecomendadoId;
    this.nombreRecomendado = data.nombreRecomendado || '';
    this.telefonoRecomendado = data.telefonoRecomendado || '';
    this.estado = data.estado || EstadoRecomendacion.PENDIENTE;
    this.fechaRecomendacion = data.fechaRecomendacion || new Date();
    this.fechaAceptacion = data.fechaAceptacion;
    this.mensajeEnviado = data.mensajeEnviado || false;
  }

  /**
   * Valida que la recomendación tenga todos los datos requeridos
   */
  public validar(): { valido: boolean; errores: string[] } {
    const errores: string[] = [];

    if (!this.clienteRecomendadorId) {
      errores.push('Se requiere el ID del cliente recomendador');
    }

    if (!this.nombreRecomendado || this.nombreRecomendado.trim().length === 0) {
      errores.push('El nombre del recomendado es requerido');
    }

    if (!this.telefonoRecomendado || !this.validarTelefono()) {
      errores.push('El teléfono debe ser válido para Costa Rica (+506XXXXXXXX)');
    }

    return {
      valido: errores.length === 0,
      errores
    };
  }

  /**
   * Valida que el teléfono sea de Costa Rica
   */
  private validarTelefono(): boolean {
    const regex = /^\+506\d{8}$/;
    return regex.test(this.telefonoRecomendado);
  }

  /**
   * Marca la recomendación como aceptada
   */
  public aceptar(clienteRecomendadoId: string): void {
    this.estado = EstadoRecomendacion.ACEPTADA;
    this.clienteRecomendadoId = clienteRecomendadoId;
    this.fechaAceptacion = new Date();
  }

  /**
   * Marca la recomendación como rechazada
   */
  public rechazar(): void {
    this.estado = EstadoRecomendacion.RECHAZADA;
  }

  /**
   * Marca el mensaje como enviado
   */
  public marcarMensajeEnviado(): void {
    this.mensajeEnviado = true;
  }

  /**
   * Convierte la recomendación a un objeto plano para persistencia
   */
  public toJSON(): IRecomendacion {
    return {
      id: this.id,
      clienteRecomendadorId: this.clienteRecomendadorId,
      clienteRecomendadoId: this.clienteRecomendadoId,
      nombreRecomendado: this.nombreRecomendado,
      telefonoRecomendado: this.telefonoRecomendado,
      estado: this.estado,
      fechaRecomendacion: this.fechaRecomendacion,
      fechaAceptacion: this.fechaAceptacion,
      mensajeEnviado: this.mensajeEnviado
    };
  }

  /**
   * Crea una instancia de Recomendacion desde un objeto plano
   */
  public static fromJSON(data: any): Recomendacion {
    return new Recomendacion({
      ...data,
      fechaRecomendacion: new Date(data.fechaRecomendacion),
      fechaAceptacion: data.fechaAceptacion ? new Date(data.fechaAceptacion) : undefined
    });
  }
}
