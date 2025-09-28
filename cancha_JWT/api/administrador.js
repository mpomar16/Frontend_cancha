const express = require('express');
const pool = require('../config/database');
const { verifyToken, checkRole } = require('../middleware/auth');
const path = require('path');
const fs = require('fs').promises;

// --- Modelos ---
async function getAllAdministradores() {
  try {
    const query = `
      SELECT a.id_admin, a.fecha_ingreso, a.direccion, p.id_persona, p.nombre, p.apellido, p.telefono, p.correo, p.sexo, p.imagen_perfil
      FROM ADMINISTRADOR_ESP_DEPORTIVO a
      JOIN PERSONA p ON a.id_admin = p.id_persona
    `;
    const result = await pool.query(query);
    return result.rows;
  } catch (error) {
    throw new Error('Error al listar administradores: ' + error.message);
  }
}

async function getAdministradorById(id) {
  try {
    const query = `
      SELECT a.id_admin, a.fecha_ingreso, a.direccion, p.id_persona, p.nombre, p.apellido, p.telefono, p.correo, p.sexo, p.imagen_perfil
      FROM ADMINISTRADOR_ESP_DEPORTIVO a
      JOIN PERSONA p ON a.id_admin = p.id_persona
      WHERE a.id_admin = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  } catch (error) {
    throw new Error('Error al obtener administrador por ID: ' + error.message);
  }
}

async function getAdministradorByIdPersona(id_persona) {
  try {
    const query = `
      SELECT a.id_admin, a.fecha_ingreso, a.direccion, p.id_persona, p.nombre, p.apellido, p.telefono, p.correo, p.sexo, p.imagen_perfil
      FROM ADMINISTRADOR_ESP_DEPORTIVO a
      JOIN PERSONA p ON a.id_admin = p.id_persona
      WHERE p.id_persona = $1
    `;
    const result = await pool.query(query, [id_persona]);
    return result.rows[0];
  } catch (error) {
    throw new Error('Error al obtener administrador por id_persona: ' + error.message);
  }
}

async function getPersonaByAdminId(id) {
  try {
    const query = `
      SELECT p.id_persona, p.nombre, p.apellido, p.telefono, p.correo, p.sexo, p.imagen_perfil
      FROM PERSONA p
      JOIN ADMINISTRADOR_ESP_DEPORTIVO a ON p.id_persona = a.id_admin
      WHERE a.id_admin = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  } catch (error) {
    throw new Error('Error al obtener persona asociada al administrador: ' + error.message);
  }
}

async function getEspaciosByAdminId(id) {
  try {
    const query = `
      SELECT id_espacio, nombre, direccion, descripcion, latitud, longitud, horario_apertura, horario_cierre, id_admin
      FROM ESPACIO_DEPORTIVO
      WHERE id_admin = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows;
  } catch (error) {
    throw new Error('Error al listar espacios deportivos: ' + error.message);
  }
}

async function createAdministrador(fecha_ingreso, direccion, id_persona) {
  try {
    const query = `
      INSERT INTO ADMINISTRADOR_ESP_DEPORTIVO (id_admin, fecha_ingreso, direccion)
      VALUES ($1, $2, $3)
      RETURNING id_admin, fecha_ingreso, direccion
    `;
    const values = [id_persona, fecha_ingreso, direccion];
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    throw new Error('Error al crear administrador: ' + error.message);
  }
}

async function updateAdministrador(id, direccion) {
  try {
    const query = `
      UPDATE ADMINISTRADOR_ESP_DEPORTIVO
      SET direccion = $1
      WHERE id_admin = $2
      RETURNING id_admin, fecha_ingreso, direccion
    `;
    const result = await pool.query(query, [direccion, id]);
    return result.rows[0];
  } catch (error) {
    throw new Error('Error al actualizar administrador: ' + error.message);
  }
}

async function deleteAdministrador(id) {
  try {
    const query = `
      DELETE FROM ADMINISTRADOR_ESP_DEPORTIVO
      WHERE id_admin = $1
      RETURNING id_admin, fecha_ingreso, direccion
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  } catch (error) {
    throw new Error('Error al eliminar administrador: ' + error.message);
  }
}


// ----------------------
// ----------------------
// ----------------------
// ----------------------
// ----------------------
// ----------------------
// ----------------------
// ----------------------
// ----------------------
// ----------------------
// ----------------------
// ----------------------
// ----------------------
// ----------------------
// ----------------------
// ----------------------
// --- Controladores ---

const response = (success, message, data = null) => ({
  success,
  message,
  data,
});

const listarAdministradores = async (req, res) => {
  try {
    const administradores = await getAllAdministradores();
    const administradoresConImagenValidada = await Promise.all(
      administradores.map(async (admin) => {
        if (admin.imagen_perfil) {
          try {
            const filePath = path.join(__dirname, '../Uploads', admin.imagen_perfil.replace(/^\/*[uU]ploads\//, ''));
            await fs.access(filePath);
            return admin;
          } catch (error) {
            console.warn(`Imagen no encontrada para administrador ${admin.id_admin}: ${admin.imagen_perfil}`);
            return { ...admin, imagen_perfil: null };
          }
        }
        return admin;
      })
    );
    res.status(200).json(response(true, 'Lista de administradores obtenida', administradoresConImagenValidada));
  } catch (error) {
    console.error('Error al listar administradores:', error);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

const obtenerAdministradorPorId = async (req, res) => {
  const { id } = req.params;

  try {
    const administrador = await getAdministradorById(id);
    if (!administrador) {
      return res.status(404).json(response(false, 'Administrador no encontrado'));
    }
    if (administrador.imagen_perfil) {
      try {
        const filePath = path.join(__dirname, '../Uploads', administrador.imagen_perfil.replace(/^\/*[uU]ploads\//, ''));
        await fs.access(filePath);
      } catch (error) {
        console.warn(`Imagen no encontrada para administrador ${administrador.id_admin}: ${administrador.imagen_perfil}`);
        administrador.imagen_perfil = null;
      }
    }
    res.status(200).json(response(true, 'Administrador obtenido', administrador));
  } catch (error) {
    console.error('Error al obtener administrador por ID:', error);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

const obtenerAdministradorPorIdPersona = async (req, res) => {
  const { id_persona } = req.params;

  try {
    const administrador = await getAdministradorByIdPersona(id_persona);
    if (!administrador) {
      return res.status(404).json(response(false, 'Administrador no encontrado'));
    }
    if (administrador.imagen_perfil) {
      try {
        const filePath = path.join(__dirname, '../Uploads', administrador.imagen_perfil.replace(/^\/*[uU]ploads\//, ''));
        await fs.access(filePath);
      } catch (error) {
        console.warn(`Imagen no encontrada para administrador ${administrador.id_admin}: ${administrador.imagen_perfil}`);
        administrador.imagen_perfil = null;
      }
    }
    res.status(200).json(response(true, 'Administrador obtenido', administrador));
  } catch (error) {
    console.error('Error al obtener administrador por id_persona:', error);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

const obtenerPersonaPorAdminId = async (req, res) => {
  const { id } = req.params;

  try {
    const persona = await getPersonaByAdminId(id);
    if (!persona) {
      return res.status(404).json(response(false, 'Persona no encontrada'));
    }
    if (persona.imagen_perfil) {
      try {
        const filePath = path.join(__dirname, '../Uploads', persona.imagen_perfil.replace(/^\/*[uU]ploads\//, ''));
        await fs.access(filePath);
      } catch (error) {
        console.warn(`Imagen no encontrada para persona ${persona.id_persona}: ${persona.imagen_perfil}`);
        persona.imagen_perfil = null;
      }
    }
    res.status(200).json(response(true, 'Persona obtenida', persona));
  } catch (error) {
    console.error('Error al obtener persona asociada al administrador:', error);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

const obtenerEspaciosPorAdminId = async (req, res) => {
  const { id } = req.params;

  try {
    const espacios = await getEspaciosByAdminId(id);
    if (!espacios.length) {
      return res.status(404).json(response(false, 'No se encontraron espacios deportivos para este administrador'));
    }
    res.status(200).json(response(true, 'Espacios deportivos obtenidos', espacios));
  } catch (error) {
    console.error('Error al listar espacios deportivos:', error);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

const crearAdministrador = async (req, res) => {
  const { fecha_ingreso, direccion, id_persona } = req.body;

  if (!fecha_ingreso || !id_persona) {
    return res.status(400).json(response(false, 'Fecha de ingreso e id_persona son obligatorios'));
  }

  try {
    // Verificar que id_persona existe en PERSONA
    const personaExistente = await pool.query('SELECT id_persona FROM PERSONA WHERE id_persona = $1', [id_persona]);
    if (!personaExistente.rows[0]) {
      return res.status(404).json(response(false, 'Persona no encontrada'));
    }

    const nuevoAdministrador = await createAdministrador(fecha_ingreso, direccion, id_persona);
    res.status(201).json(response(true, 'Administrador creado exitosamente', nuevoAdministrador));
  } catch (error) {
    console.error('Error al crear administrador:', error);
    if (error.message.includes('duplicate key')) {
      return res.status(400).json(response(false, 'El id_persona ya está registrado como administrador'));
    }
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

const actualizarAdministrador = async (req, res) => {
  const { id } = req.params;
  const { direccion } = req.body;

  if (!direccion) {
    return res.status(400).json(response(false, 'La dirección es obligatoria'));
  }

  try {
    const administradorActualizado = await updateAdministrador(id, direccion);
    if (!administradorActualizado) {
      return res.status(404).json(response(false, 'Administrador no encontrado'));
    }
    res.status(200).json(response(true, 'Administrador actualizado exitosamente', administradorActualizado));
  } catch (error) {
    console.error('Error al actualizar administrador:', error);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

const eliminarAdministrador = async (req, res) => {
  const { id } = req.params;

  try {
    const administradorEliminado = await deleteAdministrador(id);
    if (!administradorEliminado) {
      return res.status(404).json(response(false, 'Administrador no encontrado'));
    }
    res.status(200).json(response(true, 'Administrador eliminado exitosamente'));
  } catch (error) {
    console.error('Error al eliminar administrador:', error);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

// --- Rutas ---
const router = express.Router();

router.post('/', verifyToken, checkRole(['Administrador_ESP_DEPORTIVO']), crearAdministrador);

router.get('/', verifyToken, checkRole(['Administrador_ESP_DEPORTIVO']), listarAdministradores);
router.get('/:id', verifyToken, checkRole(['Administrador_ESP_DEPORTIVO']), obtenerAdministradorPorId);
router.get('/persona/:id_persona', verifyToken, checkRole(['Administrador_ESP_DEPORTIVO']), obtenerAdministradorPorIdPersona);
router.get('/:id/persona', verifyToken, checkRole(['Administrador_ESP_DEPORTIVO']), obtenerPersonaPorAdminId);
router.get('/:id/espacios', verifyToken, checkRole(['Administrador_ESP_DEPORTIVO']), obtenerEspaciosPorAdminId);

router.patch('/:id', verifyToken, checkRole(['Administrador_ESP_DEPORTIVO']), actualizarAdministrador);
router.delete('/:id', verifyToken, checkRole(['Administrador_ESP_DEPORTIVO']), eliminarAdministrador);

module.exports = router;