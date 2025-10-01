const express = require('express');
const pool = require('../config/database');
const { verifyToken, checkRole } = require('../middleware/auth');

// --- Modelos ---
async function getAllDisciplinas() {
  try {
    const query = `
      SELECT id_disciplina, nombre, descripcion
      FROM DISCIPLINA
    `;
    const result = await pool.query(query);
    return result.rows;
  } catch (error) {
    throw new Error('Error al listar disciplinas: ' + error.message);
  }
}

async function getDisciplinaById(id) {
  try {
    const query = `
      SELECT id_disciplina, nombre, descripcion
      FROM DISCIPLINA
      WHERE id_disciplina = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  } catch (error) {
    throw new Error('Error al obtener disciplina por ID: ' + error.message);
  }
}

async function getCanchasByDisciplinaId(id) {
  try {
    const query = `
      SELECT c.id_cancha, c.nombre, c.capacidad, c.estado, c.ubicacion, c.monto_por_hora, c.imagen_principal, c.id_espacio
      FROM CANCHA c
      JOIN se_practica sp ON c.id_cancha = sp.id_cancha
      WHERE sp.id_disciplina = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows;
  } catch (error) {
    throw new Error('Error al listar canchas de la disciplina: ' + error.message);
  }
}

async function getReservasByDisciplinaId(id) {
  try {
    const query = `
      SELECT r.id_reserva, r.fecha_reserva, r.cupo, r.monto_total, r.saldo_pendiente, r.estado, r.id_cliente, r.id_cancha, r.id_disciplina
      FROM RESERVA r
      WHERE r.id_disciplina = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows;
  } catch (error) {
    throw new Error('Error al listar reservas de la disciplina: ' + error.message);
  }
}

async function getDeportistasByDisciplinaId(id) {
  try {
    const query = `
      SELECT d.id_deportista, d.nivel, d.disciplina_principal, p.id_persona
      FROM DEPORTISTA d
      JOIN PERSONA p ON d.id_deportista = p.id_persona
      WHERE d.disciplina_principal = (SELECT nombre FROM DISCIPLINA WHERE id_disciplina = $1)
    `;
    const result = await pool.query(query, [id]);
    return result.rows;
  } catch (error) {
    throw new Error('Error al listar deportistas de la disciplina: ' + error.message);
  }
}

async function createDisciplina(nombre, descripcion) {
  try {
    const query = `
      INSERT INTO DISCIPLINA (nombre, descripcion)
      VALUES ($1, $2)
      RETURNING id_disciplina, nombre, descripcion
    `;
    const values = [nombre, descripcion];
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    throw new Error('Error al crear disciplina: ' + error.message);
  }
}

async function updateDisciplina(id, nombre, descripcion) {
  try {
    const query = `
      UPDATE DISCIPLINA
      SET nombre = COALESCE($1, nombre),
          descripcion = COALESCE($2, descripcion)
      WHERE id_disciplina = $3
      RETURNING id_disciplina, nombre, descripcion
    `;
    const values = [nombre, descripcion, id];
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    throw new Error('Error al actualizar disciplina: ' + error.message);
  }
}

async function deleteDisciplina(id) {
  try {
    const query = `
      DELETE FROM DISCIPLINA
      WHERE id_disciplina = $1
      RETURNING id_disciplina, nombre, descripcion
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  } catch (error) {
    throw new Error('Error al eliminar disciplina: ' + error.message);
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

const listarDisciplinas = async (req, res) => {
  try {
    const disciplinas = await getAllDisciplinas();
    console.log(`✅ [${req.method}] ejecutada con éxito.`, "url solicitada:", req.originalUrl);
    res.status(200).json(response(true, 'Lista de disciplinas obtenida', disciplinas));
  } catch (error) {
    console.error('Error al listar disciplinas:', error);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

const obtenerDisciplinaPorId = async (req, res) => {
  const { id } = req.params;

  try {
    const disciplina = await getDisciplinaById(id);
    if (!disciplina) {
      return res.status(404).json(response(false, 'Disciplina no encontrada'));
    }
    console.log(`✅ [${req.method}] ejecutada con éxito.`, "url solicitada:", req.originalUrl);
    res.status(200).json(response(true, 'Disciplina obtenida', disciplina));
  } catch (error) {
    console.error('Error al obtener disciplina por ID:', error);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

const obtenerCanchasPorDisciplinaId = async (req, res) => {
  const { id } = req.params;

  try {
    const canchas = await getCanchasByDisciplinaId(id);
    if (!canchas.length) {
      return res.status(404).json(response(false, 'No se encontraron canchas para esta disciplina'));
    }
    console.log(`✅ [${req.method}] ejecutada con éxito.`, "url solicitada:", req.originalUrl);
    res.status(200).json(response(true, 'Canchas obtenidas', canchas));
  } catch (error) {
    console.error('Error al listar canchas de la disciplina:', error);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

const obtenerReservasPorDisciplinaId = async (req, res) => {
  const { id } = req.params;

  try {
    const reservas = await getReservasByDisciplinaId(id);
    if (!reservas.length) {
      return res.status(404).json(response(false, 'No se encontraron reservas para esta disciplina'));
    }
    console.log(`✅ [${req.method}] ejecutada con éxito.`, "url solicitada:", req.originalUrl);
    res.status(200).json(response(true, 'Reservas obtenidas', reservas));
  } catch (error) {
    console.error('Error al listar reservas de la disciplina:', error);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

const obtenerDeportistasPorDisciplinaId = async (req, res) => {
  const { id } = req.params;

  try {
    const deportistas = await getDeportistasByDisciplinaId(id);
    if (!deportistas.length) {
      return res.status(404).json(response(false, 'No se encontraron deportistas para esta disciplina'));
    }
    console.log(`✅ [${req.method}] ejecutada con éxito.`, "url solicitada:", req.originalUrl);
    res.status(200).json(response(true, 'Deportistas obtenidos', deportistas));
  } catch (error) {
    console.error('Error al listar deportistas de la disciplina:', error);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

const crearDisciplina = async (req, res) => {
  const { nombre, descripcion } = req.body;

  if (!nombre) {
    return res.status(400).json(response(false, 'El nombre es obligatorio'));
  }

  try {
    const nuevaDisciplina = await createDisciplina(nombre, descripcion);
    console.log(`✅ [${req.method}] ejecutada con éxito.`, "url solicitada:", req.originalUrl);
    res.status(201).json(response(true, 'Disciplina creada exitosamente', nuevaDisciplina));
  } catch (error) {
    console.error('Error al crear disciplina:', error);
    if (error.message.includes('duplicate key')) {
      return res.status(400).json(response(false, 'El nombre de la disciplina ya está registrado'));
    }
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

const actualizarDisciplina = async (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion } = req.body;

  try {
    const disciplinaActualizada = await updateDisciplina(id, nombre, descripcion);
    if (!disciplinaActualizada) {
      return res.status(404).json(response(false, 'Disciplina no encontrada'));
    }
    console.log(`✅ [${req.method}] ejecutada con éxito.`, "url solicitada:", req.originalUrl);
    res.status(200).json(response(true, 'Disciplina actualizada exitosamente', disciplinaActualizada));
  } catch (error) {
    console.error('Error al actualizar disciplina:', error);
    if (error.message.includes('duplicate key')) {
      return res.status(400).json(response(false, 'El nombre de la disciplina ya está registrado'));
    }
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

const eliminarDisciplina = async (req, res) => {
  const { id } = req.params;

  try {
    const disciplinaEliminada = await deleteDisciplina(id);
    if (!disciplinaEliminada) {
      return res.status(404).json(response(false, 'Disciplina no encontrada'));
    }
    console.log(`✅ [${req.method}] ejecutada con éxito.`, "url solicitada:", req.originalUrl);
    res.status(200).json(response(true, 'Disciplina eliminada exitosamente'));
  } catch (error) {
    console.error('Error al eliminar disciplina:', error);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};


//-------- Rutas --------- 
//------------------------
//------------------------

const router = express.Router();

router.post('/', verifyToken, checkRole(['ADMINISTRADOR']), crearDisciplina);

router.get('/datos-total', verifyToken, checkRole(['ADMINISTRADOR', 'CLIENTE', 'DEPORTISTA', 'ENCARGADO']), listarDisciplinas);
router.get('/id/:id', verifyToken, checkRole(['ADMINISTRADOR', 'CLIENTE', 'DEPORTISTA', 'ENCARGADO']), obtenerDisciplinaPorId);
router.get('/:id/canchas', verifyToken, checkRole(['ADMINISTRADOR', 'CLIENTE', 'DEPORTISTA', 'ENCARGADO']), obtenerCanchasPorDisciplinaId);
router.get('/:id/reservas', verifyToken, checkRole(['ADMINISTRADOR', 'CLIENTE', 'DEPORTISTA', 'ENCARGADO']), obtenerReservasPorDisciplinaId);
router.get('/:id/deportistas', verifyToken, checkRole(['ADMINISTRADOR', 'CLIENTE', 'DEPORTISTA', 'ENCARGADO']), obtenerDeportistasPorDisciplinaId);

router.patch('/:id', verifyToken, checkRole(['ADMINISTRADOR']), actualizarDisciplina);
router.delete('/:id', verifyToken, checkRole(['ADMINISTRADOR']), eliminarDisciplina);

module.exports = router;