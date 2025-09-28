const express = require('express');
const pool = require('../config/database');
const { verifyToken, checkRole } = require('../middleware/auth');
const path = require('path');
const fs = require('fs').promises;

// --- Modelos ---
async function getAllClientes() {
  try {
    const query = `
      SELECT 
        c.id_cliente, 
        c.fecha_registro, 
        c.fecha_nac,
        p.id_persona,
        p.nombre,
        p.apellido,
        p.telefono,
        p.correo,
        p.sexo,
        p.imagen_perfil
      FROM CLIENTE c
      JOIN PERSONA p ON c.id_cliente = p.id_persona
      ORDER BY c.id_cliente
    `;
    const result = await pool.query(query);
    return result.rows;
  } catch (error) {
    throw new Error('Error al listar clientes: ' + error.message);
  }
}

async function getClienteById(id) {
  try {
    const query = `
      SELECT 
        c.id_cliente, 
        c.fecha_registro, 
        c.fecha_nac,
        p.id_persona,
        p.nombre,
        p.apellido,
        p.telefono,
        p.correo,
        p.sexo,
        p.imagen_perfil
      FROM CLIENTE c
      JOIN PERSONA p ON c.id_cliente = p.id_persona
      WHERE c.id_cliente = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  } catch (error) {
    throw new Error('Error al obtener cliente por ID: ' + error.message);
  }
}

async function getClienteByPersonaId(id_persona) {
  try {
    const query = `
      SELECT 
        c.id_cliente, 
        c.fecha_registro, 
        c.fecha_nac,
        p.id_persona,
        p.nombre,
        p.apellido,
        p.telefono,
        p.correo,
        p.sexo,
        p.imagen_perfil
      FROM CLIENTE c
      JOIN PERSONA p ON c.id_cliente = p.id_persona
      WHERE c.id_cliente = $1
    `;
    const result = await pool.query(query, [id_persona]);
    return result.rows[0];
  } catch (error) {
    throw new Error('Error al obtener cliente por id_persona: ' + error.message);
  }
}

async function createCliente(fecha_registro, fecha_nac, id_persona) {
  try {
    const query = `
      INSERT INTO CLIENTE (fecha_registro, fecha_nac, id_cliente)
      VALUES ($1, $2, $3)
      RETURNING id_cliente, fecha_registro, fecha_nac
    `;
    const values = [fecha_registro, fecha_nac, id_persona];
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    throw new Error('Error al crear cliente: ' + error.message);
  }
}

async function updateCliente(id, fecha_nac) {
  try {
    let query = 'UPDATE CLIENTE SET ';
    const values = [];
    let paramIndex = 1;

    if (fecha_nac !== undefined) {
      query += `fecha_nac = $${paramIndex}`;
      values.push(fecha_nac);
      paramIndex++;
    }

    query += ` WHERE id_cliente = $${paramIndex} RETURNING id_cliente, fecha_registro, fecha_nac`;
    values.push(id);

    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    throw new Error('Error al actualizar cliente: ' + error.message);
  }
}

async function deleteCliente(id) {
  try {
    const query = 'DELETE FROM CLIENTE WHERE id_cliente = $1 RETURNING id_cliente';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  } catch (error) {
    throw new Error('Error al eliminar cliente: ' + error.message);
  }
}

async function getPersonaByClienteId(id) {
  try {
    const query = `
      SELECT 
        id_persona,
        nombre,
        apellido,
        telefono,
        correo,
        sexo,
        imagen_perfil
      FROM PERSONA 
      WHERE id_persona = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  } catch (error) {
    throw new Error('Error al obtener persona por cliente ID: ' + error.message);
  }
}

async function getReservasByClienteId(id) {
  try {
    const query = `
      SELECT 
        id_reserva,
        fecha_reserva,
        cupo,
        monto_total,
        saldo_pendiente,
        estado,
        id_cliente,
        id_cancha,
        id_disciplina
      FROM RESERVA 
      WHERE id_cliente = $1
      ORDER BY fecha_reserva DESC
    `;
    const result = await pool.query(query, [id]);
    return result.rows;
  } catch (error) {
    throw new Error('Error al listar reservas del cliente: ' + error.message);
  }
}

async function getComentariosByClienteId(id) {
  try {
    const query = `
      SELECT 
        id_comentario,
        contenido,
        fecha_comentario,
        hora_comentario,
        estado,
        id_cancha,
        id_cliente
      FROM COMENTARIO 
      WHERE id_cliente = $1
      ORDER BY fecha_comentario DESC
    `;
    const result = await pool.query(query, [id]);
    return result.rows;
  } catch (error) {
    throw new Error('Error al listar comentarios del cliente: ' + error.message);
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

const listarClientes = async (req, res) => {
  try {
    const clientes = await getAllClientes();
    const clientesConImagenValidada = await Promise.all(
      clientes.map(async (cliente) => {
        if (cliente.imagen_perfil) {
          try {
            const filePath = path.join(__dirname, '../Uploads', cliente.imagen_perfil.replace(/^\/*[uU]ploads\//, ''));
            await fs.access(filePath);
            cliente.imagen_perfil = `http://localhost:3000${cliente.imagen_perfil}`;
            return cliente;
          } catch (error) {
            console.warn(`Imagen no encontrada para cliente ${cliente.id_cliente}: ${cliente.imagen_perfil}`);
            cliente.imagen_perfil = null;
            return cliente;
          }
        }
        return cliente;
      })
    );
    res.status(200).json(response(true, 'Lista de clientes obtenida', clientesConImagenValidada));
  } catch (error) {
    console.error('Error al listar clientes:', error);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

const obtenerClientePorId = async (req, res) => {
  const { id } = req.params;

  try {
    const cliente = await getClienteById(id);
    if (!cliente) {
      return res.status(404).json(response(false, 'Cliente no encontrado'));
    }
    if (cliente.imagen_perfil) {
      try {
        const filePath = path.join(__dirname, '../Uploads', cliente.imagen_perfil.replace(/^\/*[uU]ploads\//, ''));
        await fs.access(filePath);
        cliente.imagen_perfil = `http://localhost:3000${cliente.imagen_perfil}`;
      } catch (error) {
        console.warn(`Imagen no encontrada para cliente ${cliente.id_cliente}: ${cliente.imagen_perfil}`);
        cliente.imagen_perfil = null;
      }
    }
    res.status(200).json(response(true, 'Cliente obtenido', cliente));
  } catch (error) {
    console.error('Error al obtener cliente por ID:', error);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

const obtenerClientePorPersonaId = async (req, res) => {
  const { id_persona } = req.params;

  try {
    const cliente = await getClienteByPersonaId(id_persona);
    if (!cliente) {
      return res.status(404).json(response(false, 'Cliente no encontrado'));
    }
    if (cliente.imagen_perfil) {
      try {
        const filePath = path.join(__dirname, '../Uploads', cliente.imagen_perfil.replace(/^\/*[uU]ploads\//, ''));
        await fs.access(filePath);
        cliente.imagen_perfil = `http://localhost:3000${cliente.imagen_perfil}`;
      } catch (error) {
        console.warn(`Imagen no encontrada para cliente ${cliente.id_cliente}: ${cliente.imagen_perfil}`);
        cliente.imagen_perfil = null;
      }
    }
    res.status(200).json(response(true, 'Cliente obtenido', cliente));
  } catch (error) {
    console.error('Error al obtener cliente por id_persona:', error);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

const crearCliente = async (req, res) => {
  const { fecha_registro, fecha_nac, id_persona } = req.body;

  if (!id_persona) {
    return res.status(400).json(response(false, 'id_persona es obligatorio'));
  }

  try {
    // Verificar si el id_persona existe en PERSONA
    const personaCheck = await pool.query('SELECT id_persona FROM PERSONA WHERE id_persona = $1', [id_persona]);
    if (personaCheck.rows.length === 0) {
      return res.status(400).json(response(false, 'Persona no encontrada'));
    }

    // Verificar si ya existe un cliente para esta persona
    const existingCheck = await pool.query('SELECT id_cliente FROM CLIENTE WHERE id_cliente = $1', [id_persona]);
    if (existingCheck.rows.length > 0) {
      return res.status(400).json(response(false, 'Ya existe un cliente para esta persona'));
    }

    const nuevoCliente = await createCliente(
      fecha_registro || new Date().toISOString().split('T')[0],
      fecha_nac,
      id_persona
    );
    res.status(201).json(response(true, 'Cliente creado exitosamente', nuevoCliente));
  } catch (error) {
    console.error('Error al crear cliente:', error);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

const actualizarCliente = async (req, res) => {
  const { id } = req.params;
  const { fecha_nac } = req.body;

  try {
    const clienteExistente = await pool.query('SELECT * FROM CLIENTE WHERE id_cliente = $1', [id]);
    if (!clienteExistente.rows[0]) {
      return res.status(404).json(response(false, 'Cliente no encontrado'));
    }

    const clienteActualizado = await updateCliente(
      id,
      fecha_nac !== undefined ? fecha_nac : clienteExistente.rows[0].fecha_nac
    );

    if (!clienteActualizado) {
      return res.status(404).json(response(false, 'No se pudo actualizar el cliente'));
    }

    res.status(200).json(response(true, 'Cliente actualizado exitosamente', clienteActualizado));
  } catch (error) {
    console.error('Error al actualizar cliente:', error);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

const eliminarCliente = async (req, res) => {
  const { id } = req.params;

  try {
    const clienteEliminado = await deleteCliente(id);
    if (!clienteEliminado) {
      return res.status(404).json(response(false, 'Cliente no encontrado'));
    }
    res.status(200).json(response(true, 'Cliente eliminado exitosamente'));
  } catch (error) {
    console.error('Error al eliminar cliente:', error);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

const obtenerPersonaPorCliente = async (req, res) => {
  const { id } = req.params;

  try {
    const persona = await getPersonaByClienteId(id);
    if (!persona) {
      return res.status(404).json(response(false, 'Persona no encontrada'));
    }
    if (persona.imagen_perfil) {
      try {
        const filePath = path.join(__dirname, '../Uploads', persona.imagen_perfil.replace(/^\/*[uU]ploads\//, ''));
        await fs.access(filePath);
        persona.imagen_perfil = `http://localhost:3000${persona.imagen_perfil}`;
      } catch (error) {
        console.warn(`Imagen no encontrada para persona ${persona.id_persona}: ${persona.imagen_perfil}`);
        persona.imagen_perfil = null;
      }
    }
    res.status(200).json(response(true, 'Persona obtenida', persona));
  } catch (error) {
    console.error('Error al obtener persona por cliente:', error);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

const obtenerReservasPorCliente = async (req, res) => {
  const { id } = req.params;

  try {
    const reservas = await getReservasByClienteId(id);
    res.status(200).json(response(true, 'Lista de reservas obtenida', reservas));
  } catch (error) {
    console.error('Error al obtener reservas por cliente:', error);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

const obtenerComentariosPorCliente = async (req, res) => {
  const { id } = req.params;

  try {
    const comentarios = await getComentariosByClienteId(id);
    res.status(200).json(response(true, 'Lista de comentarios obtenida', comentarios));
  } catch (error) {
    console.error('Error al obtener comentarios por cliente:', error);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

// --- Rutas ---
const router = express.Router();

router.post('/', verifyToken, checkRole(['Administrador_ESP_DEPORTIVO']), crearCliente);

router.get('/', verifyToken, checkRole(['Administrador_ESP_DEPORTIVO']), listarClientes);
router.get('/:id', verifyToken, checkRole(['Administrador_ESP_DEPORTIVO', 'Cliente']), obtenerClientePorId);
router.get('/persona/:id_persona', verifyToken, checkRole(['Administrador_ESP_DEPORTIVO', 'Cliente']), obtenerClientePorPersonaId);
router.get('/:id/persona', verifyToken, checkRole(['Administrador_ESP_DEPORTIVO', 'Cliente']), obtenerPersonaPorCliente);
router.get('/:id/reservas', verifyToken, checkRole(['Administrador_ESP_DEPORTIVO', 'Cliente']), obtenerReservasPorCliente);
router.get('/:id/comentarios', verifyToken, checkRole(['Administrador_ESP_DEPORTIVO', 'Cliente']), obtenerComentariosPorCliente);

router.patch('/:id', verifyToken, checkRole(['Administrador_ESP_DEPORTIVO', 'Cliente']), actualizarCliente);
router.delete('/:id', verifyToken, checkRole(['Administrador_ESP_DEPORTIVO']), eliminarCliente);

module.exports = router;