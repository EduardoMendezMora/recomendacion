# Sistema de Recomendación Piramidal - Costa Rica

Sistema completo de recomendación de clientes con arquitectura orientada a objetos (POO), diseñado para Costa Rica. Los clientes reciben un código único de 4 dígitos para recomendar a otros usuarios, quienes reciben notificaciones por SMS.

## Características Principales

- **Registro de Clientes**: Sistema de registro con validación para números de Costa Rica (+506)
- **Códigos Únicos**: Cada cliente recibe un código de 4 dígitos para compartir
- **Sistema de Recomendación**: Los clientes pueden recomendar amigos usando su código
- **Notificaciones SMS**: Integración con Twilio para enviar mensajes automáticos
- **Interfaz Web Moderna**: Frontend responsive con HTML, CSS y JavaScript
- **API RESTful**: Endpoints serverless con Netlify Functions
- **Arquitectura POO**: Código estructurado con mejores prácticas de programación

## Tecnologías Utilizadas

- **Backend**: Node.js + TypeScript
- **Serverless**: Netlify Functions
- **SMS**: Twilio API
- **Base de Datos**: Almacenamiento en JSON (escalable a base de datos)
- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Despliegue**: Netlify

## Estructura del Proyecto

```
recomendacion/
├── src/
│   ├── models/              # Modelos de dominio (POO)
│   │   ├── Cliente.ts
│   │   ├── Recomendacion.ts
│   │   └── CodigoReferido.ts
│   ├── services/            # Servicios de negocio
│   │   ├── ClienteService.ts
│   │   ├── RecomendacionService.ts
│   │   └── SMSService.ts
│   ├── repositories/        # Capa de persistencia
│   │   ├── IRepository.ts
│   │   ├── JsonRepository.ts
│   │   ├── ClienteRepository.ts
│   │   └── RecomendacionRepository.ts
│   ├── utils/              # Utilidades
│   │   ├── Validator.ts
│   │   └── Response.ts
│   └── config/             # Configuración
│       └── config.ts
├── netlify/
│   └── functions/          # API Endpoints
│       ├── registrar-cliente.ts
│       ├── crear-recomendacion.ts
│       ├── consultar-cliente.ts
│       └── mis-recomendaciones.ts
├── public/                 # Frontend
│   ├── index.html
│   ├── styles.css
│   └── app.js
├── data/                   # Almacenamiento de datos
│   ├── clientes.json
│   └── recomendaciones.json
├── package.json
├── tsconfig.json
└── netlify.toml
```

## Arquitectura POO

### Modelos de Dominio

#### Cliente
```typescript
class Cliente {
  id: string
  nombre: string
  telefono: string
  codigoReferido: string
  referidoPor?: string
  recomendaciones: string[]
  activo: boolean
}
```

#### Recomendacion
```typescript
class Recomendacion {
  id: string
  clienteRecomendadorId: string
  clienteRecomendadoId?: string
  nombreRecomendado: string
  telefonoRecomendado: string
  estado: EstadoRecomendacion
}
```

### Servicios

- **ClienteService**: Gestión de clientes (registro, consulta)
- **RecomendacionService**: Gestión de recomendaciones
- **SMSService**: Envío de mensajes SMS via Twilio

### Repositorios

Implementan el patrón Repository para abstraer la persistencia de datos.

## Instalación

### Prerrequisitos

- Node.js (v16 o superior)
- npm o yarn
- Cuenta de Twilio (para SMS)
- Cuenta de Netlify

### Configuración Local

1. **Clonar el repositorio**
```bash
git clone https://github.com/EduardoMendezMora/recomendacion.git
cd recomendacion
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**

Crear archivo `.env` en la raíz del proyecto:
```bash
# Twilio Configuration
TWILIO_ACCOUNT_SID=tu_account_sid
TWILIO_AUTH_TOKEN=tu_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# Application Configuration
APP_NAME=Sistema de Recomendación
BASE_URL=http://localhost:8888
```

4. **Ejecutar en modo desarrollo**
```bash
npm run dev
```

El servidor estará disponible en `http://localhost:8888`

## Configuración de Twilio

1. Crear cuenta en [Twilio](https://www.twilio.com/)
2. Obtener credenciales:
   - Account SID
   - Auth Token
   - Número de teléfono habilitado para SMS
3. Configurar las variables de entorno

## Despliegue en Netlify

### Método 1: Desde GitHub

1. Conectar el repositorio con Netlify
2. Configurar variables de entorno en Netlify Dashboard:
   - `TWILIO_ACCOUNT_SID`
   - `TWILIO_AUTH_TOKEN`
   - `TWILIO_PHONE_NUMBER`
   - `APP_NAME`
   - `BASE_URL`
3. Netlify detectará automáticamente la configuración

### Método 2: Netlify CLI

```bash
# Instalar Netlify CLI
npm install -g netlify-cli

# Login en Netlify
netlify login

# Desplegar
netlify deploy --prod
```

## API Endpoints

### POST /api/registrar-cliente
Registra un nuevo cliente en el sistema.

**Request Body:**
```json
{
  "nombre": "Juan Pérez",
  "telefono": "+50688881234",
  "codigoRecomendador": "1234"  // Opcional
}
```

**Response:**
```json
{
  "exito": true,
  "mensaje": "Cliente registrado exitosamente",
  "datos": {
    "id": "uuid",
    "nombre": "Juan Pérez",
    "telefono": "+50688881234",
    "codigoReferido": "5678",
    "totalRecomendaciones": 0
  }
}
```

### POST /api/crear-recomendacion
Crea una nueva recomendación.

**Request Body:**
```json
{
  "codigoRecomendador": "5678",
  "nombreRecomendado": "María García",
  "telefonoRecomendado": "+50688889999"
}
```

**Response:**
```json
{
  "exito": true,
  "mensaje": "Recomendación creada exitosamente",
  "datos": {
    "id": "uuid",
    "nombreRecomendado": "María García",
    "estado": "PENDIENTE",
    "mensajeEnviado": true
  }
}
```

### GET /api/consultar-cliente?codigo=5678
Obtiene información de un cliente por su código.

**Response:**
```json
{
  "exito": true,
  "mensaje": "Cliente encontrado",
  "datos": {
    "id": "uuid",
    "nombre": "Juan Pérez",
    "codigoReferido": "5678",
    "totalRecomendaciones": 3
  }
}
```

### GET /api/mis-recomendaciones?codigo=5678
Obtiene las recomendaciones realizadas por un cliente.

**Response:**
```json
{
  "exito": true,
  "mensaje": "Recomendaciones obtenidas exitosamente",
  "datos": {
    "cliente": {...},
    "recomendaciones": [...]
  }
}
```

## Validaciones

### Teléfono
- Formato: `+506XXXXXXXX` (8 dígitos después del código de país)
- Validación automática y normalización

### Nombre
- Solo letras y espacios
- Mínimo 2 caracteres
- Soporta caracteres latinos (á, é, í, ó, ú, ñ)

### Código de Referido
- Exactamente 4 dígitos
- Generado automáticamente
- Único en el sistema

## Seguridad

- Validación de entrada en todos los endpoints
- Sanitización de datos
- CORS habilitado
- Validación de teléfonos específica para Costa Rica
- Prevención de duplicados

## Mejoras Futuras

- [ ] Integración con base de datos (MongoDB, PostgreSQL, FaunaDB)
- [ ] Sistema de autenticación y autorización
- [ ] Dashboard administrativo
- [ ] Estadísticas y reportes
- [ ] Sistema de recompensas por recomendaciones
- [ ] Notificaciones push
- [ ] App móvil nativa
- [ ] Tests automatizados

## Desarrollo

### Compilar TypeScript
```bash
npm run build
```

### Ejecutar en Desarrollo
```bash
npm run dev
```

## Modo Desarrollo (Sin Twilio)

Si no configuras Twilio, el sistema funcionará en modo desarrollo simulando el envío de SMS. Los mensajes se imprimirán en la consola.

## Soporte

Para problemas o preguntas, crear un issue en el repositorio de GitHub.

## Licencia

ISC

## Autor

Sistema desarrollado con mejores prácticas de programación orientada a objetos para Costa Rica.