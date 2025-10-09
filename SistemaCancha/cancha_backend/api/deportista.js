const express = require('express');
const pool = require('../config/database');

const router = express.Router();

// Función de respuesta estandarizada
const respuesta = (exito, mensaje, datos = null) => ({
  exito,
  mensaje,
  datos,
});

// Función para obtener disciplinas válidas desde la tabla DISCIPLINA
const obtenerDisciplinasValidas = async () => {
  try {
    const query = `
      SELECT nombre FROM disciplina
    `;
    const result = await pool.query(query);
    return result.rows.map(row => row.nombre);
  } catch (error) {
    console.error('Error al obtener disciplinas válidas:', error);
    throw error;
  }
};

// MODELOS - Funciones puras para operaciones de base de datos

/**
 * Obtener datos específicos de deportistas con información de la persona
 */
const obtenerDatosEspecificos = async (limite = 10, offset = 0) => {
  try {
    const queryDatos = `
      SELECT d.id_deportista, p.nombre, p.apellido, p.correo, d.disciplina_principal
      FROM deportista d
      JOIN usuario p ON d.id_deportista = p.id_persona
      ORDER BY d.id_deportista
      LIMIT $1 OFFSET $2
    `;
    const queryTotal = `SELECT COUNT(*) FROM deportista`;
    const [resultDatos, resultTotal] = await Promise.all([
      pool.query(queryDatos, [limite, offset]),
      pool.query(queryTotal)
    ]);
    return {
      deportistas: resultDatos.rows,
      total: parseInt(resultTotal.rows[0].count)
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Obtener deportistas con filtros de ordenamiento
 */
const obtenerDeportistasFiltrados = async (tipoFiltro, limite = 10, offset = 0) => {
  try {
    const ordenesPermitidas = {
      nombre: 'p.nombre ASC, p.apellido ASC',
      disciplina: 'd.disciplina_principal ASC',
      correo: 'p.correo ASC',
      default: 'd.id_deportista ASC'
    };

    const orden = ordenesPermitidas[tipoFiltro] || ordenesPermitidas.default;

    const queryDatos = `
      SELECT d.id_deportista, p.nombre, p.apellido, p.correo, d.disciplina_principal
      FROM deportista d
      JOIN usuario p ON d.id_deportista = p.id_persona
      ORDER BY ${orden}
      LIMIT $1 OFFSET $2
    `;
    const queryTotal = `SELECT COUNT(*) FROM deportista`;

    const [resultDatos, resultTotal] = await Promise.all([
      pool.query(queryDatos, [limite, offset]),
      pool.query(queryTotal)
    ]);

    return {
      deportistas: resultDatos.rows,
      total: parseInt(resultTotal.rows[0].count)
    };
  } catch (error) {
    throw new Error(`Error al obtener deportistas filtrados: ${error.message}`);
  }
};

/**
 * Buscar deportistas por texto en múltiples campos
 */
const buscarDeportistas = async (texto, limite = 10, offset = 0) => {
  try {
    const queryDatos = `
      SELECT d.id_deportista, p.nombre, p.apellido, p.correo, d.disciplina_principal
      FROM deportista d
      JOIN usuario p ON d.id_deportista = p.id_persona
      WHERE 
        p.nombre ILIKE $1 OR 
        p.apellido ILIKE $1 OR 
        p.correo ILIKE $1 OR 
        d.disciplina_principal ILIKE $1
      ORDER BY p.nombre, p.apellido
      LIMIT $2 OFFSET $3
    `;

    const queryTotal = `
      SELECT COUNT(*) 
      FROM deportista d
      JOIN usuario p ON d.id_deportista = p.id_persona
      WHERE 
        p.nombre ILIKE $1 OR 
        p.apellido ILIKE $1 OR 
        p.correo ILIKE $1 OR 
        d.disciplina_principal ILIKE $1
    `;
    
    const sanitizeInput = (input) => input.replace(/[%_\\]/g, '\\$&');
    const terminoBusqueda = `%${sanitizeInput(texto)}%`;
    
    const [resultDatos, resultTotal] = await Promise.all([
      pool.query(queryDatos, [terminoBusqueda, limite, offset]),
      pool.query(queryTotal, [terminoBusqueda])
    ]);

    return {
      deportistas: resultDatos.rows,
      total: parseInt(resultTotal.rows[0].count)
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Obtener deportista por ID
 */
const obtenerDeportistaPorId = async (id) => {
  try {
    const query = `
      SELECT d.id_deportista, p.nombre, p.apellido, p.correo, p.usuario, d.disciplina_principal
      FROM deportista d
      JOIN usuario p ON d.id_deportista = p.id_persona
      WHERE d.id_deportista = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  } catch (error) {
    throw error;
  }
};

/**
 * Crear nuevo deportista
 */
const crearDeportista = async (datosDeportista) => {
  try {
    // Validaciones básicas
    if (!datosDeportista.id_deportista || isNaN(datosDeportista.id_deportista)) {
      throw new Error('El ID del deportista es obligatorio y debe ser un número');
    }

    // Verificar si la persona existe
    const personaQuery = `
      SELECT id_persona FROM usuario WHERE id_persona = $1
    `;
    const personaResult = await pool.query(personaQuery, [datosDeportista.id_deportista]);
    if (!personaResult.rows[0]) {
      throw new Error('La persona asociada no existe');
    }

    // Validar disciplina_principal
    if (datosDeportista.disciplina_principal) {
      if (datosDeportista.disciplina_principal.length > 100) {
        throw new Error('La disciplina principal no debe exceder los 100 caracteres');
      }
      const disciplinasValidas = await obtenerDisciplinasValidas();
      if (!disciplinasValidas.includes(datosDeportista.disciplina_principal)) {
        throw new Error(`La disciplina principal no es válida. Disciplinas permitidas: ${disciplinasValidas.join(', ')}`);
      }
    }

    const query = `
      INSERT INTO deportista (
        id_deportista, disciplina_principal
      ) 
      VALUES ($1, $2)
      RETURNING id_deportista, disciplina_principal
    `;

    const values = [
      datosDeportista.id_deportista,
      datosDeportista.disciplina_principal || null
    ];

    const { rows } = await pool.query(query, values);
    return rows[0];
  } catch (error) {
    console.error('Error al crear deportista:', error.message);
    throw new Error(error.message);
  }
};

/**
 * Actualizar deportista parcialmente
 */
const actualizarDeportista = async (id, camposActualizar) => {
  try {
    const camposPermitidos = ['disciplina_principal'];

    const campos = Object.keys(camposActualizar).filter(key => 
      camposPermitidos.includes(key)
    );

    if (campos.length === 0) {
      throw new Error('No hay campos válidos para actualizar');
    }

    // Validar disciplina_principal si se proporciona
    if (camposActualizar.disciplina_principal) {
      if (camposActualizar.disciplina_principal.length > 100) {
        throw new Error('La disciplina principal no debe exceder los 100 caracteres');
      }
      const disciplinasValidas = await obtenerDisciplinasValidas();
      if (!disciplinasValidas.includes(camposActualizar.disciplina_principal)) {
        throw new Error(`La disciplina principal no es válida. Disciplinas permitidas: ${disciplinasValidas.join(', ')}`);
      }
    }

    const setClause = campos.map((campo, index) => `${campo} = $${index + 2}`).join(', ');
    const values = campos.map(campo => camposActualizar[campo] || null);
    
    const query = `
      UPDATE deportista 
      SET ${setClause}
      WHERE id_deportista = $1
      RETURNING id_deportista, disciplina_principal
    `;

    const result = await pool.query(query, [id, ...values]);
    return result.rows[0] || null;
  } catch (error) {
    throw error;
  }
};

/**
 * Eliminar deportista
 */
const eliminarDeportista = async (id) => {
  try {
    const query = 'DELETE FROM deportista WHERE id_deportista = $1 RETURNING id_deportista';
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

    const { deportistas, total } = await obtenerDatosEspecificos(limite, offset);
    
    res.json(respuesta(true, 'Deportistas obtenidos correctamente', {
      deportistas,
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
const obtenerDeportistasFiltradosController = async (req, res) => {
  try {
    const { tipo } = req.query;
    const limite = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;

    const tiposValidos = ['nombre', 'disciplina', 'correo'];
    if (!tipo || !tiposValidos.includes(tipo)) {
      return res.status(400).json(respuesta(false, 'El parámetro "tipo" es inválido o no proporcionado'));
    }

    const { deportistas, total } = await obtenerDeportistasFiltrados(tipo, limite, offset);

    res.json(respuesta(true, `Deportistas filtrados por ${tipo} obtenidos correctamente`, {
      deportistas,
      filtro: tipo,
      paginacion: { limite, offset, total }
    }));
  } catch (error) {
    console.error('Error en obtenerDeportistasFiltrados:', error.message);
    res.status(500).json(respuesta(false, error.message));
  }
};

/**
 * Controlador para GET /buscar
 */
const buscarDeportistasController = async (req, res) => {
  try {
    const { q } = req.query;
    const limite = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;

    if (!q) {
      return res.status(400).json(respuesta(false, 'El parámetro de búsqueda "q" es requerido'));
    }

    const { deportistas, total } = await buscarDeportistas(q, limite, offset);
    
    res.json(respuesta(true, 'Deportistas obtenidos correctamente', {
      deportistas,
      paginacion: { limite, offset, total }
    }));
  } catch (error) {
    console.error('Error en buscarDeportistas:', error.message);
    res.status(500).json(respuesta(false, error.message));
  }
};

/**
 * Controlador para GET /dato-individual/:id
 */
const obtenerDeportistaPorIdController = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json(respuesta(false, 'ID de deportista no válido'));
    }

    const deportista = await obtenerDeportistaPorId(parseInt(id));

    if (!deportista) {
      return res.status(404).json(respuesta(false, 'Deportista no encontrado'));
    }

    res.json(respuesta(true, 'Deportista obtenido correctamente', { deportista }));
  } catch (error) {
    console.error('Error en obtenerDeportistaPorId:', error.message);
    res.status(500).json(respuesta(false, error.message));
  }
};

/**
 * Controlador para POST - Crear deportista
 */
const crearDeportistaController = async (req, res) => {
  try {
    const datos = req.body;

    // Validaciones básicas
    const camposObligatorios = ['id_deportista'];
    const faltantes = camposObligatorios.filter(campo => !datos[campo] || datos[campo].toString().trim() === '');

    if (faltantes.length > 0) {
      return res.status(400).json(
        respuesta(false, `Faltan campos obligatorios: ${faltantes.join(', ')}`)
      );
    }

    const nuevoDeportista = await crearDeportista(datos);

    res.status(201).json(respuesta(true, 'Deportista creado correctamente', { deportista: nuevoDeportista }));
  } catch (error) {
    console.error('Error en crearDeportista:', error.message);
    
    if (error.code === '23505') { // Violación de unique constraint
      return res.status(400).json(respuesta(false, 'El ID del deportista ya existe'));
    }
    
    res.status(500).json(respuesta(false, error.message));
  }
};

/**
 * Controlador para PATCH - Actualizar deportista
 */
const actualizarDeportistaController = async (req, res) => {
  try {
    const { id } = req.params;
    const camposActualizar = req.body;

    if (!id || isNaN(id)) {
      return res.status(400).json(respuesta(false, 'ID de deportista no válido'));
    }

    if (Object.keys(camposActualizar).length === 0) {
      return res.status(400).json(respuesta(false, 'No se proporcionaron campos para actualizar'));
    }

    const deportistaActualizado = await actualizarDeportista(parseInt(id), camposActualizar);

    if (!deportistaActualizado) {
      return res.status(404).json(respuesta(false, 'Deportista no encontrado'));
    }

    res.json(respuesta(true, 'Deportista actualizado correctamente', { deportista: deportistaActualizado }));
  } catch (error) {
    console.error('Error en actualizarDeportista:', error.message);
    res.status(500).json(respuesta(false, error.message));
  }
};

/**
 * Controlador para DELETE - Eliminar deportista
 */
const eliminarDeportistaController = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json(respuesta(false, 'ID de deportista no válido'));
    }

    const deportistaEliminado = await eliminarDeportista(parseInt(id));

    if (!deportistaEliminado) {
      return res.status(404).json(respuesta(false, 'Deportista no encontrado'));
    }

    res.json(respuesta(true, 'Deportista eliminado correctamente'));
  } catch (error) {
    console.error('Error en eliminarDeportista:', error.message);
    res.status(500).json(respuesta(false, error.message));
  }
};

// RUTAS

// GET endpoints
router.get('/datos-especificos', obtenerDatosEspecificosController);
router.get('/filtro', obtenerDeportistasFiltradosController);
router.get('/buscar', buscarDeportistasController);
router.get('/dato-individual/:id', obtenerDeportistaPorIdController);

// POST, PATCH, DELETE endpoints
router.post('/', crearDeportistaController);
router.patch('/:id', actualizarDeportistaController);
router.delete('/:id', eliminarDeportistaController);

module.exports = router;