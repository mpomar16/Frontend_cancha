const express = require('express');
const pool = require('../config/database');
const bcrypt = require('bcrypt');
const { verifyToken, checkRole } = require('../middleware/auth');
const { handleUpload } = require('../middleware/multer');
const path = require('path');
const fs = require('fs').promises;

// --- Modelos ---
async function getAllClientes() {
  try {
    const query = `
      SELECT c.id_cliente, c.fecha_registro, c.fecha_nac, c.carnet_identidad, c.ci_complemento,
             p.nombre, p.apellido, p.telefono, p.correo, p.sexo, p.imagen_perfil, p.usuario
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
      SELECT c.id_cliente, c.fecha_registro, c.fecha_nac, c.carnet_identidad, c.ci_complemento,
             p.nombre, p.apellido, p.telefono, p.correo, p.sexo, p.imagen_perfil, p.usuario
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

async function getClienteByCorreo(correo) {
  try {
    const query = `
      SELECT c.id_cliente, c.fecha_registro, c.fecha_nac, c.carnet_identidad, c.ci_complemento,
             p.nombre, p.apellido, p.telefono, p.correo, p.sexo, p.imagen_perfil, p.usuario
      FROM CLIENTE c
      JOIN PERSONA p ON c.id_cliente = p.id_persona
      WHERE p.correo = $1
    `;
    const result = await pool.query(query, [correo]);
    return result.rows[0];
  } catch (error) {
    throw new Error('Error al obtener cliente por correo: ' + error.message);
  }
}

async function getClientesByNombre(nombre) {
  try {
    const query = `
      SELECT c.id_cliente, c.fecha_registro, c.fecha_nac, c.carnet_identidad, c.ci_complemento,
             p.nombre, p.apellido, p.telefono, p.correo, p.sexo, p.imagen_perfil, p.usuario
      FROM CLIENTE c
      JOIN PERSONA p ON c.id_cliente = p.id_persona
      WHERE p.nombre ILIKE $1
      ORDER BY p.nombre ASC
      LIMIT 10
    `;
    const values = [`%${nombre}%`];
    const result = await pool.query(query, values);
    return result.rows;
  } catch (error) {
    throw new Error('Error al buscar clientes por nombre: ' + error.message);
  }
}

async function createCliente(nombre, apellido, contraseña, telefono, correo, sexo, usuario, fecha_nac, carnet_identidad, ci_complemento, imagen_perfil = null) {
  try {
    const hashedPassword = await bcrypt.hash(contraseña, 10);

    // Generar latitud y longitud aleatorias dentro de La Paz (consistent with administrador.js)
    const latMin = -16.55, latMax = -16.49;
    const lonMin = -68.20, lonMax = -68.12;
    const latitud = Math.floor((Math.random() * (latMax - latMin) + latMin) * 1e6) / 1e6;
    const longitud = Math.floor((Math.random() * (lonMax - lonMin) + lonMin) * 1e6) / 1e6;

    // Insertar en PERSONA
    const personaQuery = `
      INSERT INTO PERSONA (nombre, apellido, contraseña, telefono, correo, sexo, imagen_perfil, usuario, latitud, longitud)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING id_persona
    `;
    const personaValues = [nombre, apellido, hashedPassword, telefono, correo, sexo, imagen_perfil, usuario, latitud, longitud];
    const personaResult = await pool.query(personaQuery, personaValues);
    const id = personaResult.rows[0].id_persona;

    // Insertar en CLIENTE
    const clienteQuery = `
      INSERT INTO CLIENTE (id_cliente, fecha_registro, fecha_nac, carnet_identidad, ci_complemento)
      VALUES ($1, CURRENT_DATE, $2, $3, $4)
      RETURNING id_cliente, fecha_registro, fecha_nac, carnet_identidad, ci_complemento
    `;
    const clienteValues = [id, fecha_nac, carnet_identidad, ci_complemento];
    const clienteResult = await pool.query(clienteQuery, clienteValues);

    // Combinar resultados
    return {
      ...clienteResult.rows[0],
      nombre, apellido, telefono, correo, sexo, imagen_perfil, usuario
    };
  } catch (error) {
    throw new Error('Error al crear cliente: ' + error.message);
  }
}

async function updateCliente(id, nombre, apellido, contraseña, telefono, correo, sexo, usuario, fecha_nac, carnet_identidad, ci_complemento, imagen_perfil) {
  try {
    // Actualizar PERSONA
    let personaQuery = `
      UPDATE PERSONA
      SET nombre = COALESCE($1, nombre),
          apellido = COALESCE($2, apellido),
          telefono = COALESCE($3, telefono),
          correo = COALESCE($4, correo),
          sexo = COALESCE($5, sexo),
          usuario = COALESCE($6, usuario),
          imagen_perfil = COALESCE($7, imagen_perfil)
    `;
    const personaValues = [nombre, apellido, telefono, correo, sexo, usuario, imagen_perfil];
    let paramIndex = 8;

    if (contraseña && contraseña.trim() !== "") {
      const hashedPassword = await bcrypt.hash(contraseña, 10);
      personaQuery += `, contraseña = $${paramIndex}`;
      personaValues.push(hashedPassword);
      paramIndex++;
    }

    personaQuery += ` WHERE id_persona = $${paramIndex}`;
    personaValues.push(id);

    await pool.query(personaQuery, personaValues);

    // Actualizar CLIENTE
    let clienteQuery = `
      UPDATE CLIENTE
      SET fecha_nac = COALESCE($1, fecha_nac),
          carnet_identidad = COALESCE($2, carnet_identidad),
          ci_complemento = COALESCE($3, ci_complemento)
    `;
    const clienteValues = [fecha_nac, carnet_identidad, ci_complemento];
    paramIndex = 4;

    clienteQuery += ` WHERE id_cliente = $${paramIndex}`;
    clienteValues.push(id);

    await pool.query(clienteQuery, clienteValues);

    // Obtener el registro actualizado
    return await getClienteById(id);
  } catch (error) {
    throw new Error('Error al actualizar cliente: ' + error.message);
  }
}

async function deleteCliente(id) {
  try {
    // Obtener cliente para eliminar imagen después
    const cliente = await getClienteById(id);
    if (!cliente) {
      throw new Error('Cliente no encontrado');
    }

    // Eliminar de PERSONA (cascada eliminará CLIENTE)
    const personaQuery = 'DELETE FROM PERSONA WHERE id_persona = $1 RETURNING *';
    const personaResult = await pool.query(personaQuery, [id]);

    return { ...cliente, deleted_from_persona: !!personaResult.rows[0] };
  } catch (error) {
    throw new Error('Error al eliminar cliente: ' + error.message);
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
          } catch (error) {
            console.warn(`Imagen no encontrada para cliente ${cliente.id_cliente}: ${cliente.imagen_perfil}`);
            cliente.imagen_perfil = null;
          }
        }
        return cliente;
      })
    );
    console.log(`✅ [${req.method}] ejecutada con éxito.`, "url solicitada:", req.originalUrl);
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
      } catch (error) {
        console.warn(`Imagen no encontrada para cliente ${cliente.id_cliente}: ${cliente.imagen_perfil}`);
        cliente.imagen_perfil = null;
      }
    }
    console.log(`✅ [${req.method}] ejecutada con éxito.`, "url solicitada:", req.originalUrl);
    res.status(200).json(response(true, 'Cliente obtenido', cliente));
  } catch (error) {
    console.error('Error al obtener cliente por ID:', error);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

const obtenerClientePorCorreo = async (req, res) => {
  const { correo } = req.params;

  try {
    const cliente = await getClienteByCorreo(correo);
    if (!cliente) {
      return res.status(404).json(response(false, 'Cliente no encontrado'));
    }
    if (cliente.imagen_perfil) {
      try {
        const filePath = path.join(__dirname, '../Uploads', cliente.imagen_perfil.replace(/^\/*[uU]ploads\//, ''));
        await fs.access(filePath);
      } catch (error) {
        console.warn(`Imagen no encontrada para cliente ${cliente.id_cliente}: ${cliente.imagen_perfil}`);
        cliente.imagen_perfil = null;
      }
    }
    console.log(`✅ [${req.method}] ejecutada con éxito.`, "url solicitada:", req.originalUrl);
    res.status(200).json(response(true, 'Cliente obtenido', cliente));
  } catch (error) {
    console.error('Error al obtener cliente por correo:', error);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

const buscarClientePorNombre = async (req, res) => {
  const { nombre } = req.params;

  try {
    const clientes = await getClientesByNombre(nombre);
    if (!clientes.length) {
      return res.status(404).json(response(false, 'No se encontraron clientes'));
    }
    const clientesConImagenValidada = await Promise.all(
      clientes.map(async (cliente) => {
        if (cliente.imagen_perfil) {
          try {
            const filePath = path.join(__dirname, '../Uploads', cliente.imagen_perfil.replace(/^\/*[uU]ploads\//, ''));
            await fs.access(filePath);
          } catch (error) {
            console.warn(`Imagen no encontrada para cliente ${cliente.id_cliente}: ${cliente.imagen_perfil}`);
            cliente.imagen_perfil = null;
          }
        }
        return cliente;
      })
    );
    console.log(`✅ [${req.method}] ejecutada con éxito.`, "url solicitada:", req.originalUrl);
    res.status(200).json(response(true, 'Clientes encontrados', clientesConImagenValidada));
  } catch (error) {
    console.error('Error al buscar clientes por nombre:', error);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

const crearCliente = async (req, res) => {
  const { nombre, apellido, contraseña, telefono, correo, sexo, usuario, fecha_nac, carnet_identidad, ci_complemento } = req.body;

  if (!nombre || !apellido || !contraseña || !correo || !usuario) {
    return res.status(400).json(response(false, 'Campos obligatorios: nombre, apellido, contraseña, correo, usuario'));
  }

  let imagen_perfil = null;
  if (req.file) {
    imagen_perfil = `/Uploads/cliente/${req.file.filename}`;
  }

  try {
    const nuevoCliente = await createCliente(
      nombre,
      apellido,
      contraseña,
      telefono,
      correo,
      sexo,
      usuario,
      fecha_nac,
      carnet_identidad,
      ci_complemento,
      imagen_perfil
    );
    console.log(`✅ [${req.method}] ejecutada con éxito.`, "url solicitada:", req.originalUrl);
    res.status(201).json(response(true, 'Cliente creado exitosamente', nuevoCliente));
  } catch (error) {
    console.error('Error al crear cliente:', error);
    if (error.message.includes('correo') || error.message.includes('usuario')) {
      return res.status(400).json(response(false, 'Correo o usuario ya registrado'));
    }
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

const actualizarCliente = async (req, res) => {
  const { id } = req.params;
  const { nombre, apellido, contraseña, telefono, correo, sexo, usuario, fecha_nac, carnet_identidad, ci_complemento } = req.body;

  try {
    const clienteExistente = await getClienteById(id);
    if (!clienteExistente) {
      return res.status(404).json(response(false, 'Cliente no encontrado'));
    }

    let imagen_perfil = clienteExistente.imagen_perfil;
    let oldFilePath = null;

    if (req.file) {
      imagen_perfil = `/Uploads/cliente/${req.file.filename}`;
      if (clienteExistente.imagen_perfil) {
        oldFilePath = path.join(__dirname, '../Uploads', clienteExistente.imagen_perfil.replace(/^\/*[uU]ploads\//, ''));
      }
    }

    const clienteActualizado = await updateCliente(
      id,
      nombre,
      apellido,
      contraseña,
      telefono,
      correo,
      sexo,
      usuario,
      fecha_nac,
      carnet_identidad,
      ci_complemento,
      imagen_perfil
    );

    if (oldFilePath) {
      await fs.unlink(oldFilePath).catch(err => console.warn('No se pudo eliminar imagen antigua:', err));
    }

    console.log(`✅ [${req.method}] ejecutada con éxito.`, "url solicitada:", req.originalUrl);
    res.status(200).json(response(true, 'Cliente actualizado exitosamente', clienteActualizado));
  } catch (error) {
    console.error('Error al actualizar cliente:', error);
    if (error.message.includes('correo') || error.message.includes('usuario')) {
      return res.status(400).json(response(false, 'Correo o usuario ya registrado'));
    }
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

const eliminarCliente = async (req, res) => {
  const { id } = req.params;

  try {
    const clienteEliminado = await deleteCliente(id);
    if (clienteEliminado.imagen_perfil) {
      const filePath = path.join(__dirname, '../Uploads', clienteEliminado.imagen_perfil.replace(/^\/*[uU]ploads\//, ''));
      await fs.unlink(filePath).catch(err => console.warn('No se pudo eliminar imagen:', err));
    }
    console.log(`✅ [${req.method}] ejecutada con éxito.`, "url solicitada:", req.originalUrl);
    res.status(200).json(response(true, 'Cliente eliminado exitosamente'));
  } catch (error) {
    console.error('Error al eliminar cliente:', error);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

const obtenerReservasPorCliente = async (req, res) => {
  const { id } = req.params;

  try {
    const reservas = await getReservasByClienteId(id);
    console.log(`✅ [${req.method}] ejecutada con éxito.`, "url solicitada:", req.originalUrl);
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
    console.log(`✅ [${req.method}] ejecutada con éxito.`, "url solicitada:", req.originalUrl);
    res.status(200).json(response(true, 'Lista de comentarios obtenida', comentarios));
  } catch (error) {
    console.error('Error al obtener comentarios por cliente:', error);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

// --- Rutas ---
const router = express.Router();

router.post('/', verifyToken, checkRole(['ADMINISTRADOR']), handleUpload('cliente', 'imagen_perfil'), crearCliente);
router.get('/datos-total', verifyToken, checkRole(['ADMINISTRADOR']), listarClientes);
router.get('/id/:id', verifyToken, checkRole(['ADMINISTRADOR', 'Cliente']), obtenerClientePorId);
router.get('/correo/:correo', verifyToken, checkRole(['ADMINISTRADOR', 'Cliente']), obtenerClientePorCorreo);
router.get('/buscar-nombre/:nombre', verifyToken, checkRole(['ADMINISTRADOR', 'Cliente']), buscarClientePorNombre);
router.get('/:id/reservas', verifyToken, checkRole(['ADMINISTRADOR', 'Cliente']), obtenerReservasPorCliente);
router.get('/:id/comentarios', verifyToken, checkRole(['ADMINISTRADOR', 'Cliente']), obtenerComentariosPorCliente);
router.patch('/:id', verifyToken, checkRole(['ADMINISTRADOR', 'Cliente']), handleUpload('cliente', 'imagen_perfil'), actualizarCliente);
router.delete('/:id', verifyToken, checkRole(['ADMINISTRADOR']), eliminarCliente);

module.exports = router;