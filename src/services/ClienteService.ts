/**
 * Servicio: ClienteService
 * Maneja la lógica de negocio relacionada con clientes
 */

import { v4 as uuidv4 } from 'uuid';
import { Cliente } from '../models/Cliente';
import { CodigoReferido } from '../models/CodigoReferido';
import { ClienteRepository } from '../repositories/ClienteRepository';
import { Validator } from '../utils/Validator';
import { SMSService } from './SMSService';

export interface RegistroClienteDTO {
  nombre: string;
  telefono: string;
  codigoRecomendador?: string;
}

export interface ClienteDTO {
  id: string;
  nombre: string;
  telefono: string;
  codigoReferido: string;
  fechaRegistro: Date;
  totalRecomendaciones: number;
}

export class ClienteService {
  private clienteRepository: ClienteRepository;
  private smsService: SMSService;

  constructor(dataPath?: string) {
    this.clienteRepository = new ClienteRepository(dataPath);
    this.smsService = new SMSService();
  }

  /**
   * Registra un nuevo cliente
   */
  public async registrarCliente(dto: RegistroClienteDTO): Promise<{
    exito: boolean;
    mensaje: string;
    cliente?: ClienteDTO;
    errores?: string[];
  }> {
    try {
      // Validar datos de entrada
      const validacion = this.validarDatosRegistro(dto);
      if (!validacion.valido) {
        return {
          exito: false,
          mensaje: 'Datos de registro inválidos',
          errores: validacion.errores
        };
      }

      // Normalizar teléfono
      const telefonoNormalizado = Validator.normalizarTelefonoCR(dto.telefono);

      // Verificar si el cliente ya existe
      const clienteExistente = await this.clienteRepository.findByTelefono(telefonoNormalizado);
      if (clienteExistente) {
        return {
          exito: false,
          mensaje: 'Este número de teléfono ya está registrado',
          errores: ['Teléfono duplicado']
        };
      }

      // Verificar código de recomendador si se proporcionó
      let clienteRecomendador: Cliente | null = null;
      if (dto.codigoRecomendador) {
        clienteRecomendador = await this.clienteRepository.findByCodigoReferido(
          dto.codigoRecomendador
        );
        if (!clienteRecomendador) {
          return {
            exito: false,
            mensaje: 'El código de recomendador no es válido',
            errores: ['Código de recomendador inválido']
          };
        }
      }

      // Generar código único de referido
      const codigoReferido = await this.generarCodigoUnico();

      // Crear nuevo cliente
      const nuevoCliente = new Cliente({
        id: uuidv4(),
        nombre: Validator.sanitizar(dto.nombre),
        telefono: telefonoNormalizado,
        codigoReferido: codigoReferido,
        referidoPor: clienteRecomendador?.id,
        fechaRegistro: new Date(),
        recomendaciones: [],
        activo: true
      });

      // Validar el cliente
      const validacionCliente = nuevoCliente.validar();
      if (!validacionCliente.valido) {
        return {
          exito: false,
          mensaje: 'Error al crear el cliente',
          errores: validacionCliente.errores
        };
      }

      // Guardar el cliente
      await this.clienteRepository.save(nuevoCliente);

      // Si fue recomendado, actualizar el cliente recomendador
      if (clienteRecomendador) {
        clienteRecomendador.agregarRecomendacion(nuevoCliente.id);
        await this.clienteRepository.update(clienteRecomendador.id, clienteRecomendador);
      }

      // Enviar SMS de bienvenida
      await this.smsService.enviarMensajeBienvenida(
        telefonoNormalizado,
        nuevoCliente.nombre,
        codigoReferido
      );

      return {
        exito: true,
        mensaje: 'Cliente registrado exitosamente',
        cliente: this.convertirADTO(nuevoCliente)
      };
    } catch (error: any) {
      console.error('Error al registrar cliente:', error);
      return {
        exito: false,
        mensaje: 'Error al registrar el cliente',
        errores: [error.message]
      };
    }
  }

  /**
   * Obtiene un cliente por su código de referido
   */
  public async obtenerClientePorCodigo(codigo: string): Promise<ClienteDTO | null> {
    const cliente = await this.clienteRepository.findByCodigoReferido(codigo);
    return cliente ? this.convertirADTO(cliente) : null;
  }

  /**
   * Obtiene un cliente por su ID
   */
  public async obtenerClientePorId(id: string): Promise<ClienteDTO | null> {
    const cliente = await this.clienteRepository.findById(id);
    return cliente ? this.convertirADTO(cliente) : null;
  }

  /**
   * Obtiene un cliente por su teléfono
   */
  public async obtenerClientePorTelefono(telefono: string): Promise<ClienteDTO | null> {
    const telefonoNormalizado = Validator.normalizarTelefonoCR(telefono);
    const cliente = await this.clienteRepository.findByTelefono(telefonoNormalizado);
    return cliente ? this.convertirADTO(cliente) : null;
  }

  /**
   * Obtiene las recomendaciones de un cliente
   */
  public async obtenerRecomendaciones(clienteId: string): Promise<ClienteDTO[]> {
    const clientes = await this.clienteRepository.findRecomendacionesByCliente(clienteId);
    return clientes.map(c => this.convertirADTO(c));
  }

  /**
   * Valida los datos de registro
   */
  private validarDatosRegistro(dto: RegistroClienteDTO): {
    valido: boolean;
    errores: string[];
  } {
    const errores: string[] = [];

    if (!Validator.validarNombre(dto.nombre)) {
      errores.push('El nombre debe contener solo letras y tener al menos 2 caracteres');
    }

    const telefonoNormalizado = Validator.normalizarTelefonoCR(dto.telefono);
    if (!Validator.validarTelefonoCR(telefonoNormalizado)) {
      errores.push('El teléfono debe ser válido para Costa Rica');
    }

    if (dto.codigoRecomendador && !Validator.validarCodigoReferido(dto.codigoRecomendador)) {
      errores.push('El código de recomendador debe tener 4 dígitos');
    }

    return {
      valido: errores.length === 0,
      errores
    };
  }

  /**
   * Genera un código único de 4 dígitos
   */
  private async generarCodigoUnico(): Promise<string> {
    let codigo: string;
    let existe: boolean;

    do {
      codigo = CodigoReferido.generarCodigo();
      existe = await this.clienteRepository.existeCodigoReferido(codigo);
    } while (existe);

    return codigo;
  }

  /**
   * Convierte un Cliente a ClienteDTO
   */
  private convertirADTO(cliente: Cliente): ClienteDTO {
    return {
      id: cliente.id,
      nombre: cliente.nombre,
      telefono: cliente.telefono,
      codigoReferido: cliente.codigoReferido,
      fechaRegistro: cliente.fechaRegistro,
      totalRecomendaciones: cliente.getTotalRecomendaciones()
    };
  }
}
