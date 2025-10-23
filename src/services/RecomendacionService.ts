/**
 * Servicio: RecomendacionService
 * Maneja la lógica de negocio relacionada con recomendaciones
 */

import { v4 as uuidv4 } from 'uuid';
import { Recomendacion, EstadoRecomendacion } from '../models/Recomendacion';
import { RecomendacionRepository } from '../repositories/RecomendacionRepository';
import { ClienteRepository } from '../repositories/ClienteRepository';
import { Validator } from '../utils/Validator';
import { SMSService } from './SMSService';

export interface CrearRecomendacionDTO {
  codigoRecomendador: string;
  nombreRecomendado: string;
  telefonoRecomendado: string;
}

export interface RecomendacionDTO {
  id: string;
  nombreRecomendado: string;
  telefonoRecomendado: string;
  estado: EstadoRecomendacion;
  fechaRecomendacion: Date;
  mensajeEnviado: boolean;
}

export class RecomendacionService {
  private recomendacionRepository: RecomendacionRepository;
  private clienteRepository: ClienteRepository;
  private smsService: SMSService;

  constructor(dataPath?: string) {
    this.recomendacionRepository = new RecomendacionRepository(dataPath);
    this.clienteRepository = new ClienteRepository(dataPath);
    this.smsService = new SMSService();
  }

  /**
   * Crea una nueva recomendación
   */
  public async crearRecomendacion(dto: CrearRecomendacionDTO): Promise<{
    exito: boolean;
    mensaje: string;
    recomendacion?: RecomendacionDTO;
    errores?: string[];
  }> {
    try {
      // Validar datos de entrada
      const validacion = this.validarDatosRecomendacion(dto);
      if (!validacion.valido) {
        return {
          exito: false,
          mensaje: 'Datos de recomendación inválidos',
          errores: validacion.errores
        };
      }

      // Normalizar teléfono
      const telefonoNormalizado = Validator.normalizarTelefonoCR(dto.telefonoRecomendado);

      // Buscar cliente recomendador por código
      const clienteRecomendador = await this.clienteRepository.findByCodigoReferido(
        dto.codigoRecomendador
      );

      if (!clienteRecomendador) {
        return {
          exito: false,
          mensaje: 'Código de recomendador no válido',
          errores: ['Código no encontrado']
        };
      }

      // Verificar que el recomendado no sea el mismo recomendador
      if (clienteRecomendador.telefono === telefonoNormalizado) {
        return {
          exito: false,
          mensaje: 'No puedes recomendarte a ti mismo',
          errores: ['Auto-recomendación no permitida']
        };
      }

      // Verificar si el teléfono ya está registrado
      const clienteExistente = await this.clienteRepository.findByTelefono(telefonoNormalizado);
      if (clienteExistente) {
        return {
          exito: false,
          mensaje: 'Este número de teléfono ya está registrado',
          errores: ['Teléfono ya registrado']
        };
      }

      // Verificar si ya existe una recomendación para este teléfono
      const recomendacionExistente = await this.recomendacionRepository.findByTelefonoRecomendado(
        telefonoNormalizado
      );
      if (recomendacionExistente) {
        return {
          exito: false,
          mensaje: 'Este número ya fue recomendado anteriormente',
          errores: ['Recomendación duplicada']
        };
      }

      // Crear la recomendación
      const nuevaRecomendacion = new Recomendacion({
        id: uuidv4(),
        clienteRecomendadorId: clienteRecomendador.id,
        nombreRecomendado: Validator.sanitizar(dto.nombreRecomendado),
        telefonoRecomendado: telefonoNormalizado,
        estado: EstadoRecomendacion.PENDIENTE,
        fechaRecomendacion: new Date(),
        mensajeEnviado: false
      });

      // Validar la recomendación
      const validacionRecomendacion = nuevaRecomendacion.validar();
      if (!validacionRecomendacion.valido) {
        return {
          exito: false,
          mensaje: 'Error al crear la recomendación',
          errores: validacionRecomendacion.errores
        };
      }

      // Guardar la recomendación
      await this.recomendacionRepository.save(nuevaRecomendacion);

      // Enviar SMS de invitación
      const resultadoSMS = await this.smsService.enviarMensajeInvitacion(
        telefonoNormalizado,
        nuevaRecomendacion.nombreRecomendado,
        clienteRecomendador.nombre,
        clienteRecomendador.codigoReferido
      );

      // Marcar mensaje como enviado si fue exitoso
      if (resultadoSMS.exito) {
        nuevaRecomendacion.marcarMensajeEnviado();
        await this.recomendacionRepository.update(nuevaRecomendacion.id, nuevaRecomendacion);
      }

      return {
        exito: true,
        mensaje: 'Recomendación creada exitosamente. Se ha enviado un mensaje al recomendado.',
        recomendacion: this.convertirADTO(nuevaRecomendacion)
      };
    } catch (error: any) {
      console.error('Error al crear recomendación:', error);
      return {
        exito: false,
        mensaje: 'Error al crear la recomendación',
        errores: [error.message]
      };
    }
  }

  /**
   * Obtiene las recomendaciones realizadas por un cliente
   */
  public async obtenerRecomendacionesPorCliente(codigoRecomendador: string): Promise<{
    exito: boolean;
    mensaje: string;
    recomendaciones?: RecomendacionDTO[];
    errores?: string[];
  }> {
    try {
      // Buscar cliente por código
      const cliente = await this.clienteRepository.findByCodigoReferido(codigoRecomendador);
      if (!cliente) {
        return {
          exito: false,
          mensaje: 'Cliente no encontrado',
          errores: ['Código no válido']
        };
      }

      // Obtener recomendaciones
      const recomendaciones = await this.recomendacionRepository.findByRecomendador(cliente.id);

      return {
        exito: true,
        mensaje: 'Recomendaciones obtenidas exitosamente',
        recomendaciones: recomendaciones.map(r => this.convertirADTO(r))
      };
    } catch (error: any) {
      console.error('Error al obtener recomendaciones:', error);
      return {
        exito: false,
        mensaje: 'Error al obtener recomendaciones',
        errores: [error.message]
      };
    }
  }

  /**
   * Valida los datos de la recomendación
   */
  private validarDatosRecomendacion(dto: CrearRecomendacionDTO): {
    valido: boolean;
    errores: string[];
  } {
    const errores: string[] = [];

    if (!Validator.validarCodigoReferido(dto.codigoRecomendador)) {
      errores.push('El código de recomendador debe tener 4 dígitos');
    }

    if (!Validator.validarNombre(dto.nombreRecomendado)) {
      errores.push('El nombre debe contener solo letras y tener al menos 2 caracteres');
    }

    const telefonoNormalizado = Validator.normalizarTelefonoCR(dto.telefonoRecomendado);
    if (!Validator.validarTelefonoCR(telefonoNormalizado)) {
      errores.push('El teléfono debe ser válido para Costa Rica');
    }

    return {
      valido: errores.length === 0,
      errores
    };
  }

  /**
   * Convierte una Recomendacion a RecomendacionDTO
   */
  private convertirADTO(recomendacion: Recomendacion): RecomendacionDTO {
    return {
      id: recomendacion.id,
      nombreRecomendado: recomendacion.nombreRecomendado,
      telefonoRecomendado: recomendacion.telefonoRecomendado,
      estado: recomendacion.estado,
      fechaRecomendacion: recomendacion.fechaRecomendacion,
      mensajeEnviado: recomendacion.mensajeEnviado
    };
  }
}
