const express = require('express');
const pool = require('../config/database');

const router = express.Router();

// Función de respuesta estandarizada
const respuesta = (exito, mensaje, datos = null) => ({
  exito,
  mensaje,
  datos,
});

// MODELOS - Funciones puras para operaciones de base de datos

/**
 * Obtener datos específicos de clientes con información de la persona
 */
const obtenerDatosEspecificos = async (limite = 10, offset = 0) => {
  try {
    const queryDatos = `
      SELECT c.id_cliente, p.nombre, p.apellido, p.correo, c.fecha_registro, c.fecha_nac, c.carnet_identidad, c.ci_complemento
      FROM cliente c
      JOIN usuario p ON c.id_cliente = p.id_persona
      ORDER BY c.id_cliente
      LIMIT $1 OFFSET $2
    `;
    const queryTotal = `SELECT COUNT(*) FROM cliente`;
    const [resultDatos, resultTotal] = await Promise.all([
      pool.query(queryDatos, [limite, offset]),
      pool.query(queryTotal)
    ]);
    return {
      clientes: resultDatos.rows,
      total: parseInt(resultTotal.rows[0].count)
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Obtener clientes con filtros de ordenamiento
 */
const obtenerClientesFiltrados = async (tipoFiltro, limite = 10, offset = 0) => {
  try {
    const ordenesPermitidas = {
      nombre: 'p.nombre ASC, p.apellido ASC',
      fecha: 'c.fecha_registro DESC',
      correo: 'p.correo ASC',
      default: 'c.id_cliente ASC'
    };

    const orden = ordenesPermitidas[tipoFiltro] || ordenesPermitidas.default;

    const queryDatos = `
      SELECT c.id_cliente, p.nombre, p.apellido, p.correo, c.fecha_registro, c.fecha_nac, c.carnet_identidad, c.ci_complemento
      FROM cliente c
      JOIN usuario p ON c.id_cliente = p.id_persona
      ORDER BY ${orden}
      LIMIT $1 OFFSET $2
    `;
    const queryTotal = `SELECT COUNT(*) FROM cliente`;

    const [resultDatos, resultTotal] = await Promise.all([
      pool.query(queryDatos, [limite, offset]),
      pool.query(queryTotal)
    ]);

    return {
      clientes: resultDatos.rows,
      total: parseInt(resultTotal.rows[0].count)
    };
  } catch (error) {
    throw new Error(`Error al obtener clientes filtrados: ${error.message}`);
  }
};

/**
 * Buscar clientes por texto en múltiples campos
 */
const buscarClientes = async (texto, limite = 10, offset = 0) => {
  try {
    const queryDatos = `
      SELECT c.id_cliente, p.nombre, p.apellido, p.correo, c.fecha_registro, c.fecha_nac, c.carnet_identidad, c.ci_complemento
      FROM cliente c
      JOIN usuario p ON c.id_cliente = p.id_persona
      WHERE 
        p.nombre ILIKE $1 OR 
        p.apellido ILIKE $1 OR 
        p.correo ILIKE $1 OR 
        c.carnet_identidad ILIKE $1
      ORDER BY p.nombre, p.apellido
      LIMIT $2 OFFSET $3
    `;

    const queryTotal = `
      SELECT COUNT(*) 
      FROM cliente c
      JOIN usuario p ON c.id_cliente = p.id_persona
      WHERE 
        p.nombre ILIKE $1 OR 
        p.apellido ILIKE $1 OR 
        p.correo ILIKE $1 OR 
        c.carnet_identidad ILIKE $1
    `;
    
    const sanitizeInput = (input) => input.replace(/[%_\\]/g, '\\$&');
    const terminoBusqueda = `%${sanitizeInput(texto)}%`;
    
    const [resultDatos, resultTotal] = await Promise.all([
      pool.query(queryDatos, [terminoBusqueda, limite, offset]),
      pool.query(queryTotal, [terminoBusqueda])
    ]);

    return {
      clientes: resultDatos.rows,
      total: parseInt(resultTotal.rows[0].count)
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Obtener cliente por ID
 */
const obtenerClientePorId = async (id) => {
  try {
    const query = `
      SELECT c.id_cliente, p.nombre, p.apellido, p.correo, p.usuario, c.fecha_registro, c.fecha_nac, c.carnet_identidad, c.ci_complemento
      FROM cliente c
      JOIN usuario p ON c.id_cliente = p.id_persona
      WHERE c.id_cliente = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  } catch (error) {
    throw error;
  }
};

/**
 * Crear nuevo cliente
 */
const crearCliente = async (datosCliente) => {
  try {
    // Validaciones básicas
    if (!datosCliente.id_cliente || isNaN(datosCliente.id_cliente)) {
      throw new Error('El ID del cliente es obligatorio y debe ser un número');
    }

    // Verificar si la persona existe
    const personaQuery = `
      SELECT id_persona FROM usuario WHERE id_persona = $1
    `;
    const personaResult = await pool.query(personaQuery, [datosCliente.id_cliente]);
    if (!personaResult.rows[0]) {
      throw new Error('La persona asociada no existe');
    }

    // Validar carnet_identidad
    if (datosCliente.carnet_identidad && !/^\d{1,10}$/.test(datosCliente.carnet_identidad)) {
      throw new Error('El carnet de identidad debe ser numérico y no exceder los 10 caracteres');
    }

    // Validar ci_complemento
    if (datosCliente.ci_complemento && !/^[A-Za-z0-9]{1,3}$/.test(datosCliente.ci_complemento)) {
      throw new Error('El complemento del carnet debe tener hasta 3 caracteres alfanuméricos');
    }

    // Validar fecha_nac
    if (datosCliente.fecha_nac) {
      const fechaNac = new Date(datosCliente.fecha_nac);
      if (isNaN(fechaNac.getTime()) || fechaNac > new Date()) {
        throw new Error('La fecha de nacimiento no es válida o está en el futuro');
      }
    }

    const query = `
      INSERT INTO cliente (
        id_cliente, fecha_registro, fecha_nac, carnet_identidad, ci_complemento
      ) 
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id_cliente, fecha_registro, fecha_nac, carnet_identidad, ci_complemento
    `;

    const values = [
      datosCliente.id_cliente,
      datosCliente.fecha_registro || new Date().toISOString().split('T')[0],
      datosCliente.fecha_nac || null,
      datosCliente.carnet_identidad || null,
      datosCliente.ci_complemento || null
    ];

    const { rows } = await pool.query(query, values);
    return rows[0];
  } catch (error) {
    console.error('Error al crear cliente:', error.message);
    throw new Error(error.message);
  }
};

/**
 * Actualizar cliente parcialmente
 */
const actualizarCliente = async (id, camposActualizar) => {
  try {
    const camposPermitidos = ['fecha_nac', 'carnet_identidad', 'ci_complemento'];

    const campos = Object.keys(camposActualizar).filter(key => 
      camposPermitidos.includes(key)
    );

    if (campos.length === 0) {
      throw new Error('No hay campos válidos para actualizar');
    }

    // Validar carnet_identidad si se proporciona
    if (camposActualizar.carnet_identidad && !/^\d{1,10}$/.test(camposActualizar.carnet_identidad)) {
      throw new Error('El carnet de identidad debe ser numérico y no exceder los 10 caracteres');
    }

    // Validar ci_complemento si se proporciona
    if (camposActualizar.ci_complemento && !/^[A-Za-z0-9]{1,3}$/.test(camposActualizar.ci_complemento)) {
      throw new Error('El complemento del carnet debe tener hasta 3 caracteres alfanuméricos');
    }

    // Validar fecha_nac si se proporciona
    if (camposActualizar.fecha_nac) {
      const fechaNac = new Date(camposActualizar.fecha_nac);
      if (isNaN(fechaNac.getTime()) || fechaNac > new Date()) {
        throw new Error('La fecha de nacimiento no es válida o está en el futuro');
      }
    }

    const setClause = campos.map((campo, index) => `${campo} = $${index + 2}`).join(', ');
    const values = campos.map(campo => camposActualizar[campo] || null);
    
    const query = `
      UPDATE cliente 
      SET ${setClause}
      WHERE id_cliente = $1
      RETURNING id_cliente, fecha_registro, fecha_nac, carnet_identidad, ci_complemento
    `;

    const result = await pool.query(query, [id, ...values]);
    return result.rows[0] || null;
  } catch (error) {
    throw error;
  }
};

/**
 * Eliminar cliente
 */
const eliminarCliente = async (id) => {
  try {
    const query = 'DELETE FROM cliente WHERE id_cliente = $1 RETURNING id_cliente';
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  } catch (error) {
    throw error;
  }
};

// CONTROLADORES - Manejan las request y response

/**
 * Controlador para GET /datos-especificos
 */
const obtenerDatosEspecificosController = async (req, res) => {
  try {
    const limite = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;

    const { clientes, total } = await obtenerDatosEspecificos(limite, offset);
    
    res.json(respuesta(true, 'Clientes obtenidos correctamente', {
      clientes,
      paginacion: { limite, offset, total }
    }));
  } catch (error) {
    console.error('Error en obtenerDatosEspecificos:', error.message);
    res.status(500).json(respuesta(false, error.message));
  }
};

/**
 * Controlador para GET /filtro
 */
const obtenerClientesFiltradosController = async (req, res) => {
  try {
    const { tipo } = req.query;
    const limite = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;

    const tiposValidos = ['nombre', 'fecha', 'correo'];
    if (!tipo || !tiposValidos.includes(tipo)) {
      return res.status(400).json(respuesta(false, 'El parámetro "tipo" es inválido o no proporcionado'));
    }

    const { clientes, total } = await obtenerClientesFiltrados(tipo, limite, offset);

    res.json(respuesta(true, `Clientes filtrados por ${tipo} obtenidos correctamente`, {
      clientes,
      filtro: tipo,
      paginacion: { limite, offset, total }
    }));
  } catch (error) {
    console.error('Error en obtenerClientesFiltrados:', error.message);
    res.status(500).json(respuesta(false, error.message));
  }
};

/**
 * Controlador para GET /buscar
 */
const buscarClientesController = async (req, res) => {
  try {
    const { q } = req.query;
    const limite = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;

    if (!q) {
      return res.status(400).json(respuesta(false, 'El parámetro de búsqueda "q" es requerido'));
    }

    const { clientes, total } = await buscarClientes(q, limite, offset);
    
    res.json(respuesta(true, 'Clientes obtenidos correctamente', {
      clientes,
      paginacion: { limite, offset, total }
    }));
  } catch (error) {
    console.error('Error en buscarClientes:', error.message);
    res.status(500).json(respuesta(false, error.message));
  }
};

/**
 * Controlador para GET /dato-individual/:id
 */
const obtenerClientePorIdController = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json(respuesta(false, 'ID de cliente no válido'));
    }

    const cliente = await obtenerClientePorId(parseInt(id));

    if (!cliente) {
      return res.status(404).json(respuesta(false, 'Cliente no encontrado'));
    }

    res.json(respuesta(true, 'Cliente obtenido correctamente', { cliente }));
  } catch (error) {
    console.error('Error en obtenerClientePorId:', error.message);
    res.status(500).json(respuesta(false, error.message));
  }
};

/**
 * Controlador para POST - Crear cliente
 */
const crearClienteController = async (req, res) => {
  try {
    const datos = req.body;

    // Validaciones básicas
    const camposObligatorios = ['id_cliente'];
    const faltantes = camposObligatorios.filter(campo => !datos[campo] || datos[campo].toString().trim() === '');

    if (faltantes.length > 0) {
      return res.status(400).json(
        respuesta(false, `Faltan campos obligatorios: ${faltantes.join(', ')}`)
      );
    }

    const nuevoCliente = await crearCliente(datos);

    res.status(201).json(respuesta(true, 'Cliente creado correctamente', { cliente: nuevoCliente }));
  } catch (error) {
    console.error('Error en crearCliente:', error.message);
    
    if (error.code === '23505') { // Violación de unique constraint
      return res.status(400).json(respuesta(false, 'El ID del cliente ya existe'));
    }
    
    res.status(500).json(respuesta(false, error.message));  }
};

/**
 * Controlador para PATCH - Actualizar cliente
 */
const actualizarClienteController = async (req, res) => {
  try {
    const { id } = req.params;
    const camposActualizar = req.body;

    if (!id || isNaN(id)) {
      return res.status(400).json(respuesta(false, 'ID de cliente no válido'));
    }

    if (Object.keys(camposActualizar).length === 0) {
      return res.status(400).json(respuesta(false, 'No se proporcionaron campos para actualizar'));
    }

    const clienteActualizado = await actualizarCliente(parseInt(id), camposActualizar);

    if (!clienteActualizado) {
      return res.status(404).json(respuesta(false, 'Cliente no encontrado'));
    }

    res.json(respuesta(true, 'Cliente actualizado correctamente', { cliente: clienteActualizado }));
  } catch (error) {
    console.error('Error en actualizarCliente:', error.message);
    res.status(500).json(respuesta(false, error.message));
  }
};

/**
 * Controlador para DELETE - Eliminar cliente
 */
const eliminarClienteController = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json(respuesta(false, 'ID de cliente no válido'));
    }

    const clienteEliminado = await eliminarCliente(parseInt(id));

    if (!clienteEliminado) {
      return res.status(404).json(respuesta(false, 'Cliente no encontrado'));
    }

    res.json(respuesta(true, 'Cliente eliminado correctamente'));
  } catch (error) {
    console.error('Error en eliminarCliente:', error.message);
    res.status(500).json(respuesta(false, error.message));
  }
};

// RUTAS

// GET endpoints
router.get('/datos-especificos', obtenerDatosEspecificosController);
router.get('/filtro', obtenerClientesFiltradosController);
router.get('/buscar', buscarClientesController);
router.get('/dato-individual/:id', obtenerClientePorIdController);

// POST, PATCH, DELETE endpoints
router.post('/', crearClienteController);
router.patch('/:id', actualizarClienteController);
router.delete('/:id', eliminarClienteController);

module.exports = router;