import { supabase } from "./database.js";

export async function obtenerUsuarioId(data) {
  try {
    // Buscar usuario en la base de datos por correo y/o cédula
    const { data: usuarios, error: errorBusqueda } = await supabase
      .from("usuarios")
      .select("id")
      .or(`correo.eq.${data.correo},cedula.eq.${data.cedula}`);

    if (errorBusqueda) {
      throw new Error(`Error al buscar usuario: ${errorBusqueda.message}`);
    }

    if (!usuarios || usuarios.length === 0) {
      // Si no se encuentra ningún usuario, crear uno nuevo
      const { data: nuevoUsuario, error: errorInsercion } = await supabase
        .from("usuarios")
        .insert([
          {
            nombre: data.nombre,
            apellido: data.apellido,
            correo: data.correo,
            cedula: data.cedula || null, // Asegurar que cédula sea opcional
          },
        ])
        .select("id")
        .single();

      if (errorInsercion) {
        throw new Error(`Error al crear usuario: ${errorInsercion.message}`);
      }

      return nuevoUsuario.id;
    } else if (usuarios.length > 1) {
      throw new Error("Se encontraron múltiples usuarios con el mismo correo o cédula.");
    }

    // Si se encuentra exactamente un usuario, devolver su ID
    return usuarios[0].id;
  } catch (error) {
    console.error("Error en obtenerUsuarioId:", error.message);
    throw error;
  }
}
