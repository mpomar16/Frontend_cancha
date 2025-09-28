const express = require('express');
const pool = require('../config/database');
const { verifyToken, checkRole } = require('../middleware/auth');

// --- Modelos ---
async function getAllEspacios() {
  try {
    const query = `
      SELECT id_espacio, nombre, direccion, descripcion, latitud, longitud, horario_apertura, horario_cierre, id_admin
      FROM ESPACIO_DEPORTIVO
    `;
    const result = await pool.query(query);
    return result.rows;
  } catch (error) {
    throw new Error('Error al listar espacios deportivos: ' + error.message);
  }
}

async function getEspacioById(id) {
  try {
    const query = `
      SELECT id_espacio, nombre, direccion, descripcion, latitud, longitud, horario_apertura, horario_cierre, id_admin
      FROM ESPACIO_DEPORTIVO
      WHERE id_espacio = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  } catch (error) {
    throw new Error('Error al obtener espacio deportivo por ID: ' + error.message);
  }
}

async function getAdministradorByEspacioId(id) {
  try {
    const query = `
      SELECT a.id_admin, a.fecha_ingreso, a.direccion, p.id_persona, p.nombre
      FROM ADMINISTRADOR_ESP_DEPORTIVO a
      JOIN PERSONA p ON a.id_admin = p.id_persona
      JOIN ESPACIO_DEPORTIVO e ON a.id_admin = e.id_admin
      WHERE e.id_espacio = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  } catch (error) {
    throw new Error('Error al obtener administrador asociado al espacio: ' + error.message);
  }
}

async function getCanchasByEspacioId(id) {
  try {
    const query = `
      SELECT id_cancha, nombre, capacidad, estado, ubicacion, monto_por_hora, imagen_principal, id_espacio
      FROM CANCHA
      WHERE id_espacio = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows;
  } catch (error) {
    throw new Error('Error al listar canchas del espacio deportivo: ' + error.message);
  }
}

async function getEspaciosByAdminId(id_admin) {
  try {
    const query = `
      SELECT id_espacio, nombre, direccion, descripcion, latitud, longitud, horario_apertura, horario_cierre, id_admin
      FROM ESPACIO_DEPORTIVO
      WHERE id_admin = $1
    `;
    const result = await pool.query(query, [id_admin]);
    return result.rows;
  } catch (error) {
    throw new Error('Error al listar espacios deportivos por administrador: ' + error.message);
  }
}

async function createEspacio(nombre, direccion, descripcion, latitud, longitud, horario_apertura, horario_cierre, id_admin) {
  try {
    const query = `
      INSERT INTO ESPACIO_DEPORTIVO (nombre, direccion, descripcion, latitud, longitud, horario_apertura, horario_cierre, id_admin)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id_espacio, nombre, direccion, descripcion, latitud, longitud, horario_apertura, horario_cierre, id_admin
    `;
    const values = [nombre, direccion, descripcion, latitud, longitud, horario_apertura, horario_cierre, id_admin];
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    throw new Error('Error al crear espacio deportivo: ' + error.message);
  }
}

async function updateEspacio(id, nombre, direccion, descripcion, latitud, longitud, horario_apertura, horario_cierre, id_admin) {
  try {
    const query = `
      UPDATE ESPACIO_DEPORTIVO
      SET nombre = COALESCE($1, nombre),
          direccion = COALESCE($2, direccion),
          descripcion = COALESCE($3, descripcion),
          latitud = COALESCE($4, latitud),
          longitud = COALESCE($5, longitud),
          horario_apertura = COALESCE($6, horario_apertura),
          horario_cierre = COALESCE($7, horario_cierre),
          id_admin = COALESCE($8, id_admin)
      WHERE id_espacio = $9
      RETURNING id_espacio, nombre, direccion, descripcion, latitud, longitud, horario_apertura, horario_cierre, id_admin
    `;
    const values = [nombre, direccion, descripcion, latitud, longitud, horario_apertura, horario_cierre, id_admin, id];
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    throw new Error('Error al actualizar espacio deportivo: ' + error.message);
  }
}

async function deleteEspacio(id) {
  try {
    const query = `
      DELETE FROM ESPACIO_DEPORTIVO
      WHERE id_espacio = $1
      RETURNING id_espacio, nombre, direccion, descripcion, latitud, longitud, horario_apertura, horario_cierre, id_admin
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  } catch (error) {
    throw new Error('Error al eliminar espacio deportivo: ' + error.message);
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

const listarEspacios = async (req, res) => {
  try {
    const espacios = await getAllEspacios();
    res.status(200).json(response(true, 'Lista de espacios deportivos obtenida', espacios));
  } catch (error) {
    console.error('Error al listar espacios deportivos:', error);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

const obtenerEspacioPorId = async (req, res) => {
  const { id } = req.params;

  try {
    const espacio = await getEspacioById(id);
    if (!espacio) {
      return res.status(404).json(response(false, 'Espacio deportivo no encontrado'));
    }
    res.status(200).json(response(true, 'Espacio deportivo obtenido', espacio));
  } catch (error) {
    console.error('Error al obtener espacio deportivo por ID:', error);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

const obtenerAdministradorPorEspacioId = async (req, res) => {
  const { id } = req.params;

  try {
    const administrador = await getAdministradorByEspacioId(id);
    if (!administrador) {
      return res.status(404).json(response(false, 'Administrador no encontrado para este espacio'));
    }
    res.status(200).json(response(true, 'Administrador obtenido', administrador));
  } catch (error) {
    console.error('Error al obtener administrador asociado al espacio:', error);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

const obtenerCanchasPorEspacioId = async (req, res) => {
  const { id } = req.params;

  try {
    const canchas = await getCanchasByEspacioId(id);
    if (!canchas.length) {
      return res.status(404).json(response(false, 'No se encontraron canchas para este espacio deportivo'));
    }
    res.status(200).json(response(true, 'Canchas obtenidas', canchas));
  } catch (error) {
    console.error('Error al listar canchas del espacio deportivo:', error);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

const obtenerEspaciosPorAdminId = async (req, res) => {
  const { id_admin } = req.params;

  try {
    const espacios = await getEspaciosByAdminId(id_admin);
    if (!espacios.length) {
      return res.status(404).json(response(false, 'No se encontraron espacios deportivos para este administrador'));
    }
    res.status(200).json(response(true, 'Espacios deportivos obtenidos', espacios));
  } catch (error) {
    console.error('Error al listar espacios deportivos por administrador:', error);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

const crearEspacio = async (req, res) => {
  const { nombre, direccion, descripcion, latitud, longitud, horario_apertura, horario_cierre, id_admin } = req.body;

  if (!nombre || !id_admin) {
    return res.status(400).json(response(false, 'Nombre e id_admin son obligatorios'));
  }

  try {
    // Verificar que id_admin existe en ADMINISTRADOR_ESP_DEPORTIVO
    const adminExistente = await pool.query('SELECT id_admin FROM ADMINISTRADOR_ESP_DEPORTIVO WHERE id_admin = $1', [id_admin]);
    if (!adminExistente.rows[0]) {
      return res.status(404).json(response(false, 'Administrador no encontrado'));
    }

    // Validar latitud y longitud si se proporcionan
    if (latitud && (latitud < -90 || latitud > 90)) {
      return res.status(400).json(response(false, 'Latitud inválida. Debe estar entre -90 y 90'));
    }
    if (longitud && (longitud < -180 || longitud > 180)) {
      return res.status(400).json(response(false, 'Longitud inválida. Debe estar entre -180 y 180'));
    }

    const nuevoEspacio = await createEspacio(nombre, direccion, descripcion, latitud, longitud, horario_apertura, horario_cierre, id_admin);
    res.status(201).json(response(true, 'Espacio deportivo creado exitosamente', nuevoEspacio));
  } catch (error) {
    console.error('Error al crear espacio deportivo:', error);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

const actualizarEspacio = async (req, res) => {
  const { id } = req.params;
  const { nombre, direccion, descripcion, latitud, longitud, horario_apertura, horario_cierre, id_admin } = req.body;

  try {
    // Validar latitud y longitud si se proporcionan
    if (latitud && (latitud < -90 || latitud > 90)) {
      return res.status(400).json(response(false, 'Latitud inválida. Debe estar entre -90 y 90'));
    }
    if (longitud && (longitud < -180 || longitud > 180)) {
      return res.status(400).json(response(false, 'Longitud inválida. Debe estar entre -180 y 180'));
    }

    // Verificar que id_admin existe si se proporciona
    if (id_admin) {
      const adminExistente = await pool.query('SELECT id_admin FROM ADMINISTRADOR_ESP_DEPORTIVO WHERE id_admin = $1', [id_admin]);
      if (!adminExistente.rows[0]) {
        return res.status(404).json(response(false, 'Administrador no encontrado'));
      }
    }

    const espacioActualizado = await updateEspacio(id, nombre, direccion, descripcion, latitud, longitud, horario_apertura, horario_cierre, id_admin);
    if (!espacioActualizado) {
      return res.status(404).json(response(false, 'Espacio deportivo no encontrado'));
    }
    res.status(200).json(response(true, 'Espacio deportivo actualizado exitosamente', espacioActualizado));
  } catch (error) {
    console.error('Error al actualizar espacio deportivo:', error);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

const eliminarEspacio = async (req, res) => {
  const { id } = req.params;

  try {
    const espacioEliminado = await deleteEspacio(id);
    if (!espacioEliminado) {
      return res.status(404).json(response(false, 'Espacio deportivo no encontrado'));
    }
    res.status(200).json(response(true, 'Espacio deportivo eliminado exitosamente'));
  } catch (error) {
    console.error('Error al eliminar espacio deportivo:', error);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

// --- Rutas ---
const router = express.Router();
router.post('/', verifyToken, checkRole(['Administrador_ESP_DEPORTIVO']), crearEspacio);

router.get('/', verifyToken, checkRole(['Administrador_ESP_DEPORTIVO', 'CLIENTE', 'DEPORTISTA', 'ENCARGADO']), listarEspacios);
router.get('/:id', verifyToken, checkRole(['Administrador_ESP_DEPORTIVO', 'CLIENTE', 'DEPORTISTA', 'ENCARGADO']), obtenerEspacioPorId);
router.get('/:id/administrador', verifyToken, checkRole(['Administrador_ESP_DEPORTIVO', 'CLIENTE', 'DEPORTISTA', 'ENCARGADO']), obtenerAdministradorPorEspacioId);
router.get('/administrador/:id_admin', verifyToken, checkRole(['Administrador_ESP_DEPORTIVO']), obtenerEspaciosPorAdminId);
router.get('/:id/canchas', verifyToken, checkRole(['Administrador_ESP_DEPORTIVO', 'CLIENTE', 'DEPORTISTA', 'ENCARGADO']), obtenerCanchasPorEspacioId);

router.patch('/:id', verifyToken, checkRole(['Administrador_ESP_DEPORTIVO']), actualizarEspacio);
router.delete('/:id', verifyToken, checkRole(['Administrador_ESP_DEPORTIVO']), eliminarEspacio);

module.exports = router;