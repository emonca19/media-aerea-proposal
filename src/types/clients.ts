// Definición de la interfaz Client
export interface Client {
  id: string; // Identificador único del cliente
  name: string; // Nombre del cliente
  contactName: string; // Nombre de la persona de contacto
  contactEmail: string; // Correo electrónico de la persona de contacto
  projects?: string[]; // IDs de proyectos asociados
  contracts?: string[]; // IDs de contratos vigentes
}