const express = require('express');
const pool = require('../config/database');
const { verifyToken, checkRole } = require('../middleware/auth');

// --- Modelos ---
async function getAllSePractica() {
  try {
    const query = `
      SELECT id_cancha, id_disciplina, frecuencia_practica
      FROM SE_PRACTICA
    `;
    const result = await pool.query(query);
    return result.rows;
  } catch (error) {
    throw new Error('Error al listar relaciones cancha-disciplina: ' + error.message);
  }
}

async function getSePracticaById(id_cancha, id_disciplina) {
  try {
    const query = `
      SELECT id_cancha, id_disciplina, frecuencia_practica
      FROM SE_PRACTICA
      WHERE id_cancha = $1 AND id_disciplina = $2
    `;
    const result = await pool.query(query, [id_cancha, id_disciplina]);
    return result.rows[0];
  } catch (error) {
    throw new Error('Error al obtener relación cancha-disciplina por ID: ' + error.message);
  }
}

async function getDisciplinasByCanchaId(id_cancha) {
  try {
    const query = `
      SELECT d.id_disciplina, d.nombre, d.descripcion
      FROM DISCIPLINA d
      JOIN SE_PRACTICA sp ON d.id_disciplina = sp.id_disciplina
      WHERE sp.id_cancha = $1
    `;
    const result = await pool.query(query, [id_cancha]);
    return result.rows;
  } catch (error) {
    throw new Error('Error al listar disciplinas asociadas a la cancha: ' + error.message);
  }
}

async function getCanchasByDisciplinaId(id_disciplina) {
  try {
    const query = `
      SELECT c.id_cancha, c.nombre, c.capacidad, c.estado, c.ubicacion, c.monto_por_hora, c.imagen_principal, c.imagen_sec_1, c.imagen_sec_2, c.imagen_sec_3, c.imagen_sec_4, c.id_espacio
      FROM CANCHA c
      JOIN SE_PRACTICA sp ON c.id_cancha = sp.id_cancha
      WHERE sp.id_disciplina = $1
    `;
    const result = await pool.query(query, [id_disciplina]);
    return result.rows;
  } catch (error) {
    throw new Error('Error al listar canchas asociadas a la disciplina: ' + error.message);
  }
}

async function createSePractica(id_cancha, id_disciplina, frecuencia_practica) {
  try {
    const query = `
      INSERT INTO SE_PRACTICA (id_cancha, id_disciplina, frecuencia_practica)
      VALUES ($1, $2, $3, $4)
      RETURNING id_cancha, id_disciplina, frecuencia_practica
    `;
    const values = [id_cancha, id_disciplina, frecuencia_practica];
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    throw new Error('Error al crear relación cancha-disciplina: ' + error.message);
  }
}

async function updateSePractica(id_cancha, id_disciplina, frecuencia_practica) {
  try {
    const query = `
      UPDATE SE_PRACTICA
      SET frecuencia_practica = COALESCE($1, frecuencia_practica)
      WHERE id_cancha = $2 AND id_disciplina = $3
      RETURNING id_cancha, id_disciplina, frecuencia_practica
    `;
    const values = [frecuencia_practica, id_cancha, id_disciplina];
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    throw new Error('Error al actualizar relación cancha-disciplina: ' + error.message);
  }
}

async function deleteSePractica(id_cancha, id_disciplina) {
  try {
    const query = `
      DELETE FROM SE_PRACTICA
      WHERE id_cancha = $1 AND id_disciplina = $2
      RETURNING id_cancha, id_disciplina, frecuencia_practica
    `;
    const result = await pool.query(query, [id_cancha, id_disciplina]);
    return result.rows[0];
  } catch (error) {
    throw new Error('Error al eliminar relación cancha-disciplina: ' + error.message);
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

const listarSePractica = async (req, res) => {
  try {
    const relaciones = await getAllSePractica();
    console.log(`✅ [${req.method}] ejecutada con éxito.`, "url solicitada:", req.originalUrl);
    res.status(200).json(response(true, 'Lista de relaciones cancha-disciplina obtenida', relaciones));
  } catch (error) {
    console.error('Error al listar relaciones cancha-disciplina:', error);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

const obtenerSePracticaPorId = async (req, res) => {
  const { id_cancha, id_disciplina } = req.params;

  try {
    const relacion = await getSePracticaById(id_cancha, id_disciplina);
    if (!relacion) {
      return res.status(404).json(response(false, 'Relación cancha-disciplina no encontrada'));
    }
    console.log(`✅ [${req.method}] ejecutada con éxito.`, "url solicitada:", req.originalUrl);
    res.status(200).json(response(true, 'Relación cancha-disciplina obtenida', relacion));
  } catch (error) {
    console.error('Error al obtener relación cancha-disciplina por ID:', error);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

const listarDisciplinasPorCanchaId = async (req, res) => {
  const { id_cancha } = req.params;

  try {
    const disciplinas = await getDisciplinasByCanchaId(id_cancha);
    if (!disciplinas.length) {
      return res.status(404).json(response(false, 'No se encontraron disciplinas para esta cancha'));
    }
    console.log(`✅ [${req.method}] ejecutada con éxito.`, "url solicitada:", req.originalUrl);
    res.status(200).json(response(true, 'Disciplinas obtenidas por cancha', disciplinas));
  } catch (error) {
    console.error('Error al listar disciplinas por cancha:', error);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

const listarCanchasPorDisciplinaId = async (req, res) => {
  const { id_disciplina } = req.params;

  try {
    const canchas = await getCanchasByDisciplinaId(id_disciplina);
    if (!canchas.length) {
      return res.status(404).json(response(false, 'No se encontraron canchas para esta disciplina'));
    }
    console.log(`✅ [${req.method}] ejecutada con éxito.`, "url solicitada:", req.originalUrl);
    res.status(200).json(response(true, 'Canchas obtenidas por disciplina', canchas));
  } catch (error) {
    console.error('Error al listar canchas por disciplina:', error);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

const crearSePractica = async (req, res) => {
  const { id_cancha, id_disciplina, frecuencia_practica } = req.body;

  if (!id_cancha || !id_disciplina || !frecuencia_practica) {
    return res.status(400).json(response(false, 'Todos los campos son obligatorios'));
  }

  try {
    // Verificar que id_cancha existe en CANCHA
    const canchaExistente = await pool.query('SELECT id_cancha FROM CANCHA WHERE id_cancha = $1 AND estado = true', [id_cancha]);
    if (!canchaExistente.rows[0]) {
      return res.status(404).json(response(false, 'Cancha no encontrada o no disponible'));
    }

    // Verificar que id_disciplina existe en DISCIPLINA
    const disciplinaExistente = await pool.query('SELECT id_disciplina FROM DISCIPLINA WHERE id_disciplina = $1', [id_disciplina]);
    if (!disciplinaExistente.rows[0]) {
      return res.status(404).json(response(false, 'Disciplina no encontrada'));
    }

    // Validar frecuencia_practica
    const validFrecuencias = ['Diaria', 'Semanal', 'Mensual'];
    if (!validFrecuencias.includes(frecuencia_practica)) {
      return res.status(400).json(response(false, 'Frecuencia de práctica inválida. Debe ser: Diaria, Semanal o Mensual'));
    }

    // Verificar que no exista una relación duplicada
    const relacionExistente = await pool.query('SELECT id_cancha FROM SE_PRACTICA WHERE id_cancha = $1 AND id_disciplina = $2', [id_cancha, id_disciplina]);
    if (relacionExistente.rows[0]) {
      return res.status(400).json(response(false, 'La relación cancha-disciplina ya existe'));
    }

    const nuevaRelacion = await createSePractica(id_cancha, id_disciplina, frecuencia_practica, nivel);
    console.log(`✅ [${req.method}] ejecutada con éxito.`, "url solicitada:", req.originalUrl);
    res.status(201).json(response(true, 'Relación cancha-disciplina creada exitosamente', nuevaRelacion));
  } catch (error) {
    console.error('Error al crear relación cancha-disciplina:', error);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

const actualizarSePractica = async (req, res) => {
  const { id_cancha, id_disciplina } = req.params;
  const { frecuencia_practica } = req.body;

  try {
    // Validar frecuencia_practica si se proporciona
    if (frecuencia_practica) {
      const validFrecuencias = ['Diaria', 'Semanal', 'Mensual'];
      if (!validFrecuencias.includes(frecuencia_practica)) {
        return res.status(400).json(response(false, 'Frecuencia de práctica inválida. Debe ser: Diaria, Semanal o Mensual'));
      }
    }

    const relacionActualizada = await updateSePractica(id_cancha, id_disciplina, frecuencia_practica, nivel);
    if (!relacionActualizada) {
      return res.status(404).json(response(false, 'Relación cancha-disciplina no encontrada'));
    }
    console.log(`✅ [${req.method}] ejecutada con éxito.`, "url solicitada:", req.originalUrl);
    res.status(200).json(response(true, 'Relación cancha-disciplina actualizada exitosamente', relacionActualizada));
  } catch (error) {
    console.error('Error al actualizar relación cancha-disciplina:', error);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

const eliminarSePractica = async (req, res) => {
  const { id_cancha, id_disciplina } = req.params;

  try {
    const relacionEliminada = await deleteSePractica(id_cancha, id_disciplina);
    if (!relacionEliminada) {
      return res.status(404).json(response(false, 'Relación cancha-disciplina no encontrada'));
    }
    console.log(`✅ [${req.method}] ejecutada con éxito.`, "url solicitada:", req.originalUrl);
    res.status(200).json(response(true, 'Relación cancha-disciplina eliminada exitosamente'));
  } catch (error) {
    console.error('Error al eliminar relación cancha-disciplina:', error);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

//-------- Rutas --------- 
//------------------------
//------------------------

const router = express.Router();

router.post('/', verifyToken, checkRole(['ADMINISTRADOR']), crearSePractica);

router.get('/datos-total', verifyToken, checkRole(['ADMINISTRADOR', 'CLIENTE', 'ENCARGADO']), listarSePractica);
router.get('/cancha/:id_cancha', verifyToken, checkRole(['ADMINISTRADOR', 'CLIENTE', 'ENCARGADO']), listarDisciplinasPorCanchaId);
router.get('/disciplina/:id_disciplina', verifyToken, checkRole(['ADMINISTRADOR', 'CLIENTE', 'ENCARGADO']), listarCanchasPorDisciplinaId);
router.get('/:id_cancha/:id_disciplina', verifyToken, checkRole(['ADMINISTRADOR', 'CLIENTE', 'ENCARGADO']), obtenerSePracticaPorId);

router.patch('/:id_cancha/:id_disciplina', verifyToken, checkRole(['ADMINISTRADOR']), actualizarSePractica);
router.delete('/:id_cancha/:id_disciplina', verifyToken, checkRole(['ADMINISTRADOR']), eliminarSePractica);

module.exports = router;