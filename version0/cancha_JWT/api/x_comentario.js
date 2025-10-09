const express = require('express');
const pool = require('../config/database');
const { verifyToken, checkRole } = require('../middleware/auth');

// --- Modelos ---
async function getAllComentarios() {
  try {
    const query = `
      SELECT id_comentario, contenido, fecha_comentario, hora_comentario, estado, id_cancha, id_cliente
      FROM COMENTARIO
    `;
    const result = await pool.query(query);
    return result.rows;
  } catch (error) {
    throw new Error('Error al listar comentarios: ' + error.message);
  }
}

async function getComentarioById(id) {
  try {
    const query = `
      SELECT id_comentario, contenido, fecha_comentario, hora_comentario, estado, id_cancha, id_cliente
      FROM COMENTARIO
      WHERE id_comentario = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  } catch (error) {
    throw new Error('Error al obtener comentario por ID: ' + error.message);
  }
}

async function getCanchaByComentarioId(id) {
  try {
    const query = `
      SELECT c.id_cancha, c.nombre, c.capacidad, c.estado, c.ubicacion, c.monto_por_hora, c.imagen_principal, c.imagen_sec_1, c.imagen_sec_2, c.imagen_sec_3, c.imagen_sec_4, c.id_espacio
      FROM CANCHA c
      JOIN COMENTARIO co ON c.id_cancha = co.id_cancha
      WHERE co.id_comentario = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  } catch (error) {
    throw new Error('Error al obtener cancha asociada al comentario: ' + error.message);
  }
}

async function getClienteByComentarioId(id) {
  try {
    const query = `
      SELECT cl.id_cliente, cl.fecha_registro, cl.fecha_nac
      FROM CLIENTE cl
      JOIN COMENTARIO co ON cl.id_cliente = co.id_cliente
      WHERE co.id_comentario = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  } catch (error) {
    throw new Error('Error al obtener cliente asociado al comentario: ' + error.message);
  }
}

async function getComentariosByCanchaId(id_cancha) {
  try {
    const query = `
      SELECT id_comentario, contenido, fecha_comentario, hora_comentario, estado, id_cancha, id_cliente
      FROM COMENTARIO
      WHERE id_cancha = $1
    `;
    const result = await pool.query(query, [id_cancha]);
    return result.rows;
  } catch (error) {
    throw new Error('Error al listar comentarios por cancha: ' + error.message);
  }
}

async function getComentariosByClienteId(id_cliente) {
  try {
    const query = `
      SELECT id_comentario, contenido, fecha_comentario, hora_comentario, estado, id_cancha, id_cliente
      FROM COMENTARIO
      WHERE id_cliente = $1
    `;
    const result = await pool.query(query, [id_cliente]);
    return result.rows;
  } catch (error) {
    throw new Error('Error al listar comentarios por cliente: ' + error.message);
  }
}

async function getComentariosByEstado(estado) {
  try {
    const query = `
      SELECT id_comentario, contenido, fecha_comentario, hora_comentario, estado, id_cancha, id_cliente
      FROM COMENTARIO
      WHERE estado = $1
    `;
    const result = await pool.query(query, [estado]);
    return result.rows;
  } catch (error) {
    throw new Error('Error al listar comentarios por estado: ' + error.message);
  }
}

async function createComentario(contenido, fecha_comentario, hora_comentario, estado, id_cancha, id_cliente) {
  try {
    const query = `
      INSERT INTO COMENTARIO (contenido, fecha_comentario, hora_comentario, estado, id_cancha, id_cliente)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id_comentario, contenido, fecha_comentario, hora_comentario, estado, id_cancha, id_cliente
    `;
    const values = [contenido, fecha_comentario, hora_comentario, estado, id_cancha, id_cliente];
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    throw new Error('Error al crear comentario: ' + error.message);
  }
}

async function updateComentario(id, contenido, fecha_comentario, hora_comentario, estado, id_cancha, id_cliente) {
  try {
    const query = `
      UPDATE COMENTARIO
      SET contenido = COALESCE($1, contenido),
          fecha_comentario = COALESCE($2, fecha_comentario),
          hora_comentario = COALESCE($3, hora_comentario),
          estado = COALESCE($4, estado),
          id_cancha = COALESCE($5, id_cancha),
          id_cliente = COALESCE($6, id_cliente)
      WHERE id_comentario = $7
      RETURNING id_comentario, contenido, fecha_comentario, hora_comentario, estado, id_cancha, id_cliente
    `;
    const values = [contenido, fecha_comentario, hora_comentario, estado, id_cancha, id_cliente, id];
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    throw new Error('Error al actualizar comentario: ' + error.message);
  }
}

async function deleteComentario(id) {
  try {
    const query = `
      DELETE FROM COMENTARIO
      WHERE id_comentario = $1
      RETURNING id_comentario, contenido, fecha_comentario, hora_comentario, estado, id_cancha, id_cliente
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  } catch (error) {
    throw new Error('Error al eliminar comentario: ' + error.message);
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

const listarComentarios = async (req, res) => {
  try {
    const comentarios = await getAllComentarios();
    res.status(200).json(response(true, 'Lista de comentarios obtenida', comentarios));
  } catch (error) {
    console.error('Error al listar comentarios:', error);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

const obtenerComentarioPorId = async (req, res) => {
  const { id } = req.params;

  try {
    const comentario = await getComentarioById(id);
    if (!comentario) {
      return res.status(404).json(response(false, 'Comentario no encontrado'));
    }
    res.status(200).json(response(true, 'Comentario obtenido', comentario));
  } catch (error) {
    console.error('Error al obtener comentario por ID:', error);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

const obtenerCanchaPorComentarioId = async (req, res) => {
  const { id } = req.params;

  try {
    const cancha = await getCanchaByComentarioId(id);
    if (!cancha) {
      return res.status(404).json(response(false, 'Cancha no encontrada'));
    }
    res.status(200).json(response(true, 'Cancha obtenida', cancha));
  } catch (error) {
    console.error('Error al obtener cancha asociada al comentario:', error);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

const obtenerClientePorComentarioId = async (req, res) => {
  const { id } = req.params;

  try {
    const cliente = await getClienteByComentarioId(id);
    if (!cliente) {
      return res.status(404).json(response(false, 'Cliente no encontrado'));
    }
    res.status(200).json(response(true, 'Cliente obtenido', cliente));
  } catch (error) {
    console.error('Error al obtener cliente asociado al comentario:', error);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

const listarComentariosPorCanchaId = async (req, res) => {
  const { id_cancha } = req.params;

  try {
    const comentarios = await getComentariosByCanchaId(id_cancha);
    if (!comentarios.length) {
      return res.status(404).json(response(false, 'No se encontraron comentarios para esta cancha'));
    }
    res.status(200).json(response(true, 'Comentarios obtenidos por cancha', comentarios));
  } catch (error) {
    console.error('Error al listar comentarios por cancha:', error);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

const listarComentariosPorClienteId = async (req, res) => {
  const { id_cliente } = req.params;

  try {
    const comentarios = await getComentariosByClienteId(id_cliente);
    if (!comentarios.length) {
      return res.status(404).json(response(false, 'No se encontraron comentarios para este cliente'));
    }
    res.status(200).json(response(true, 'Comentarios obtenidos por cliente', comentarios));
  } catch (error) {
    console.error('Error al listar comentarios por cliente:', error);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

const listarComentariosPorEstado = async (req, res) => {
  const { estado } = req.params;

  try {
    const comentarios = await getComentariosByEstado(estado);
    if (!comentarios.length) {
      return res.status(404).json(response(false, 'No se encontraron comentarios para este estado'));
    }
    res.status(200).json(response(true, 'Comentarios obtenidos por estado', comentarios));
  } catch (error) {
    console.error('Error al listar comentarios por estado:', error);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

const crearComentario = async (req, res) => {
  const { contenido, fecha_comentario, hora_comentario, estado, id_cancha, id_cliente } = req.body;

  if (!contenido || !fecha_comentario || !hora_comentario || !estado || !id_cancha || !id_cliente) {
    return res.status(400).json(response(false, 'Todos los campos son obligatorios'));
  }

  try {
    // Verificar que id_cancha existe en CANCHA
    const canchaExistente = await pool.query('SELECT id_cancha FROM CANCHA WHERE id_cancha = $1 AND estado = true', [id_cancha]);
    if (!canchaExistente.rows[0]) {
      return res.status(404).json(response(false, 'Cancha no encontrada o no disponible'));
    }

    // Verificar que id_cliente existe en CLIENTE
    const clienteExistente = await pool.query('SELECT id_cliente FROM CLIENTE WHERE id_cliente = $1', [id_cliente]);
    if (!clienteExistente.rows[0]) {
      return res.status(404).json(response(false, 'Cliente no encontrado'));
    }

    // Validar estado
    const validEstados = ['valido', 'no_valido'];
    if (!validEstados.includes(estado)) {
      return res.status(400).json(response(false, 'Estado inválido. Debe ser: valido o no_valido'));
    }

    // Validar formato de hora_comentario
    const horaRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/;
    if (!horaRegex.test(hora_comentario)) {
      return res.status(400).json(response(false, 'Formato de hora inválido. Debe ser HH:MM:SS'));
    }

    const nuevoComentario = await createComentario(contenido, fecha_comentario, hora_comentario, estado, id_cancha, id_cliente);
    res.status(201).json(response(true, 'Comentario creado exitosamente', nuevoComentario));
  } catch (error) {
    console.error('Error al crear comentario:', error);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

const actualizarComentario = async (req, res) => {
  const { id } = req.params;
  const { contenido, fecha_comentario, hora_comentario, estado, id_cancha, id_cliente } = req.body;

  try {
    // Verificar que id_cancha existe si se proporciona
    if (id_cancha) {
      const canchaExistente = await pool.query('SELECT id_cancha FROM CANCHA WHERE id_cancha = $1 AND estado = true', [id_cancha]);
      if (!canchaExistente.rows[0]) {
        return res.status(404).json(response(false, 'Cancha no encontrada o no disponible'));
      }
    }

    // Verificar que id_cliente existe si se proporciona
    if (id_cliente) {
      const clienteExistente = await pool.query('SELECT id_cliente FROM CLIENTE WHERE id_cliente = $1', [id_cliente]);
      if (!clienteExistente.rows[0]) {
        return res.status(404).json(response(false, 'Cliente no encontrado'));
      }
    }

    // Validar estado si se proporciona
    if (estado) {
      const validEstados = ['valido', 'no_valido'];
      if (!validEstados.includes(estado)) {
        return res.status(400).json(response(false, 'Estado inválido. Debe ser: valido o no_valido'));
      }
    }

    // Validar formato de hora_comentario si se proporciona
    if (hora_comentario) {
      const horaRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/;
      if (!horaRegex.test(hora_comentario)) {
        return res.status(400).json(response(false, 'Formato de hora inválido. Debe ser HH:MM:SS'));
      }
    }

    const comentarioActualizado = await updateComentario(id, contenido, fecha_comentario, hora_comentario, estado, id_cancha, id_cliente);
    if (!comentarioActualizado) {
      return res.status(404).json(response(false, 'Comentario no encontrado'));
    }
    res.status(200).json(response(true, 'Comentario actualizado exitosamente', comentarioActualizado));
  } catch (error) {
    console.error('Error al actualizar comentario:', error);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

const eliminarComentario = async (req, res) => {
  const { id } = req.params;

  try {
    const comentarioEliminado = await deleteComentario(id);
    if (!comentarioEliminado) {
      return res.status(404).json(response(false, 'Comentario no encontrado'));
    }
    res.status(200).json(response(true, 'Comentario eliminado exitosamente'));
  } catch (error) {
    console.error('Error al eliminar comentario:', error);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

//-------- Rutas --------- 
//------------------------
//------------------------

const router = express.Router();

router.post('/', verifyToken, checkRole(['CLIENTE']), crearComentario);

router.get('/datos-total', verifyToken, checkRole(['ADMINISTRADOR', 'CLIENTE', 'ENCARGADO']), listarComentarios);
router.get('/id/:id', verifyToken, checkRole(['ADMINISTRADOR', 'CLIENTE', 'ENCARGADO']), obtenerComentarioPorId);
router.get('/:id/cancha', verifyToken, checkRole(['ADMINISTRADOR', 'CLIENTE', 'ENCARGADO']), obtenerCanchaPorComentarioId);
router.get('/:id/cliente', verifyToken, checkRole(['ADMINISTRADOR', 'CLIENTE', 'ENCARGADO']), obtenerClientePorComentarioId);
router.get('/cancha/:id_cancha', verifyToken, checkRole(['ADMINISTRADOR', 'CLIENTE', 'ENCARGADO']), listarComentariosPorCanchaId);
router.get('/cliente/:id_cliente', verifyToken, checkRole(['ADMINISTRADOR', 'CLIENTE']), listarComentariosPorClienteId);
router.get('/estado/:estado', verifyToken, checkRole(['ADMINISTRADOR', 'CLIENTE', 'ENCARGADO']), listarComentariosPorEstado);

router.patch('/:id', verifyToken, checkRole(['ADMINISTRADOR', 'CLIENTE']), actualizarComentario);
router.delete('/:id', verifyToken, checkRole(['ADMINISTRADOR', 'CLIENTE']), eliminarComentario);

module.exports = router;