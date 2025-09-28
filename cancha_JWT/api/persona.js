const express = require('express');
const pool = require('../config/database');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { verifyToken, checkRole } = require('../middleware/auth');
const { handleUpload } = require('../middleware/multer');
const { validatePersonaFields } = require('../middleware/validate');
const path = require('path');
const fs = require('fs').promises;

// Clave secreta para JWT (en producción, usar variable de entorno)
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

// --- Modelos ---
async function getAllPersonas(limit = 12, offset = 0) {
  try {
    const query = `SELECT 
      id_persona, nombre, apellido, telefono, correo, sexo, imagen_perfil 
      FROM PERSONA
      ORDER BY id_persona
      LIMIT $1 OFFSET $2
      `;
    const result = await pool.query(query, [limit, offset]);
    return result.rows;
  } catch (error) {
    throw new Error('Error al listar personas: ' + error.message);
  }
}

async function getPersonaById(id) {
  try {
    const query = `
    SELECT id_persona, nombre, apellido, telefono, correo, sexo, imagen_perfil 
    FROM PERSONA WHERE id_persona = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  } catch (error) {
    throw new Error('Error al obtener persona por ID: ' + error.message);
  }
}

async function getPersonaByCorreo(correo) {
  try {
    const query = 'SELECT id_persona, nombre, apellido, telefono, correo, sexo, imagen_perfil FROM PERSONA WHERE correo = $1';
    const result = await pool.query(query, [correo]);
    return result.rows[0];
  } catch (error) {
    throw new Error('Error al obtener persona por correo: ' + error.message);
  }
}

async function getPersonasByNombre(nombre) {
  try {
    const query = `
      SELECT id_persona, nombre, apellido, telefono, correo, sexo, imagen_perfil
      FROM PERSONA
      WHERE nombre ILIKE $1
      ORDER BY nombre ASC
      LIMIT 10
    `;
    const values = [`%${nombre}%`]; // Coincidencia parcial
    const result = await pool.query(query, values);
    return result.rows;
  } catch (error) {
    throw new Error('Error al buscar personas por nombre: ' + error.message);
  }
}

async function createPersonaCasual(nombre, contraseña, correo) {
  try {
    const hashedPassword = await bcrypt.hash(contraseña, 10);

    // Generar latitud y longitud aleatorias dentro de La Paz
    const latMin = -16.55, latMax = -16.49;
    const lonMin = -68.20, lonMax = -68.12;

    const latitud = Math.floor((Math.random() * (latMax - latMin) + latMin) * 1e6) / 1e6;
    const longitud = Math.floor((Math.random() * (lonMax - lonMin) + lonMin) * 1e6) / 1e6;

    const query = `
      INSERT INTO PERSONA (nombre, contraseña, correo, latitud, longitud)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id_persona, nombre, apellido, telefono, correo, sexo, imagen_perfil, latitud, longitud
    `;
    
    
    const values = [nombre || null, hashedPassword, correo, latitud, longitud];
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    throw new Error('Error al crear persona casual: ' + error.message);
  }
}

async function updatePersona(id, nombre, apellido, contraseña, telefono, correo, sexo, imagen_perfil) {
  try {
    let query = `
      UPDATE PERSONA
      SET nombre = $1, apellido = $2, telefono = $3, correo = $4, sexo = $5, imagen_perfil = $6`;
    const values = [nombre, apellido, telefono, correo, sexo, imagen_perfil];
    let paramIndex = 7;

    console.log(contraseña)
    if (contraseña && contraseña.trim() !== "") {
      const hashedPassword = await bcrypt.hash(contraseña, 10);
      query += `, contraseña = $${paramIndex}`;
      values.push(hashedPassword);
      paramIndex++;
    }

    query += ` WHERE id_persona = $${paramIndex} RETURNING id_persona, nombre, apellido, telefono, correo, sexo, imagen_perfil`;
    values.push(id);

    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    throw new Error('Error al actualizar persona: ' + error.message);
  }
}

async function deletePersona(id) {
  try {
    const query = 'DELETE FROM PERSONA WHERE id_persona = $1 RETURNING id_persona, nombre, apellido, telefono, correo, sexo, imagen_perfil';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  } catch (error) {
    throw new Error('Error al eliminar persona: ' + error.message);
  }
}

async function loginPersona(correo, contraseña) { 
  const query = 'SELECT * FROM PERSONA WHERE correo = $1'; 
  const result = await pool.query(query, [correo]); 
  const persona = result.rows[0]; 
    
  if (!persona) {
    throw new Error('Correo no encontrado'); 
  } 

  const isMatch = await bcrypt.compare(contraseña, persona.contraseña); 

  if (!isMatch) { 
    throw new Error('Contraseña incorrecta'); 
  } 
  return { 
    id_persona: persona.id_persona, 
    nombre: persona.nombre, 
    apellido: persona.apellido, 
    correo: persona.correo, 
    sexo: persona.sexo, 
    imagen_perfil: persona.imagen_perfil 
  };
}

module.exports = { loginPersona };

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

const listarPersonas = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 12;
    const offset = parseInt(req.query.offset) || 0;
  
    //console.log(`Listing personas with limit=${limit}, offset=${offset}`); // Debug log to confirm params

    const personas = await getAllPersonas(limit, offset);

    const personasConImagenValidada = await Promise.all(
      personas.map(async (persona) => {
        if (persona.imagen_perfil) {
          try {
            const filePath = path.join(__dirname, '../Uploads', persona.imagen_perfil.replace(/^\/*[uU]ploads\//, ''));
            await fs.access(filePath);
            return persona;
          } catch (error) {
            console.warn(`Imagen no encontrada para persona ${persona.id_persona}: ${persona.imagen_perfil}`);
            return { ...persona, imagen_perfil: null };
          }
        }
        return persona;
      })
    );

    const hasMore = personasConImagenValidada.length === limit; // Proper hasMore logic
    const dataResponse = {
      personas: personasConImagenValidada,
      limit,
      offset,
      hasMore
    };

    let message = 'Lista de personas obtenida';
    if (personasConImagenValidada.length === 0) {
      message = offset === 0 ? 'No hay personas registradas' : 'No hay más personas para mostrarse';
    }

    console.log(`Returning ${personasConImagenValidada.length} personas, hasMore=${hasMore}`); // Debug log
    res.status(200).json(response(true, message, dataResponse));

  } catch (error) {
    console.error('Error al listar personas:', error.message);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

const obtenerPersonaPorId = async (req, res) => {
  const { id } = req.params;

  try {
    const persona = await getPersonaById(id);
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
    console.log("Persona obtenida segun id ", id)
  } catch (error) {
    console.error('Error al obtener persona por ID:', error.message);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

const obtenerPersonaPorCorreo = async (req, res) => {
  const { correo } = req.params;

  try {
    const persona = await getPersonaByCorreo(correo);
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
    console.log("Se devuelve persona según correo ", persona.correo)
  } catch (error) {
    console.error('Error al obtener persona por correo:', error.message);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

const buscarPersonaPorNombre = async (req, res) => {
  const { nombre } = req.params;

  try {
    const personas = await getPersonasByNombre(nombre);
    if (personas.length === 0) {
      return res.status(404).json(response(false, 'No se encontraron personas'));
    }

    // Opcional: validar imágenes
    for (const persona of personas) {
      if (persona.imagen_perfil) {
        try {
          const filePath = path.join(__dirname, '../Uploads', persona.imagen_perfil.replace(/^\/*[uU]ploads\//, ''));
          await fs.access(filePath);
        } catch (error) {
          console.warn(`Imagen no encontrada para persona ${persona.id_persona}: ${persona.imagen_perfil}`);
          persona.imagen_perfil = null;
        }
      }
    }

    res.status(200).json(response(true, 'Personas encontradas', personas));
    console.log(`Se devuelven ${personas.length} personas para búsqueda: ${nombre}`);
  } catch (error) {
    console.error('Error al buscar personas por nombre:', error.message);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

const crearPersonaCasual = async (req, res) => {
  const { nombre, contraseña, correo } = req.body;

  if (!contraseña || !correo) {
    return res.status(400).json(response(false, 'Contraseña y correo son obligatorios'));
  }

  try {
    const nuevaPersona = await createPersonaCasual(nombre, contraseña, correo);
    res.status(201).json(response(true, 'Persona creada exitosamente', nuevaPersona));
    console.log("Persona creada exitosamente", new Date())
  } catch (error) {
    console.error('Error al crear persona casual:', error.message);
    if (error.message.includes('correo')) {
      return res.status(400).json(response(false, 'El correo ya está registrado'));
    }
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

const actualizarPersona = async (req, res) => {
  const { id } = req.params;
  const idPersonaToken = req.user.id_persona;

  const { nombre, apellido, contraseña, telefono, correo, sexo } = req.body;

  // Validaciones solo si el campo llega en la request
  if (correo !== undefined && !correo.trim()) {
    return res.status(400).json(response(false, 'Correo no puede estar vacío'));
  }
  if (sexo !== undefined && !['masculino', 'femenino'].includes(sexo)) {
    return res.status(400).json(response(false, 'Sexo debe ser "masculino" o "femenino"'));
  }

  try {
    const personaExistente = await pool.query(
      'SELECT * FROM PERSONA WHERE id_persona = $1',
      [id]
    );
    if (!personaExistente.rows[0]) {
      return res.status(404).json(response(false, 'Persona no encontrada'));
    }

    let imagen_perfil = personaExistente.rows[0].imagen_perfil;
    let oldFilePath = null;

    // Si viene nueva imagen, reemplazar
    if (req.file) {
      imagen_perfil = `/Uploads/persona/${req.file.filename}`;
      if (personaExistente.rows[0].imagen_perfil) {
        oldFilePath = path.join(
          __dirname,
          '../Uploads',
          personaExistente.rows[0].imagen_perfil.replace(/^\/*[uU]ploads\//, '')
        );
      }
    }

    // Construcción de datos actualizados:
    const personaActualizada = await updatePersona(
      id,
      nombre !== undefined ? nombre : personaExistente.rows[0].nombre,
      apellido !== undefined ? apellido : personaExistente.rows[0].apellido,
      contraseña,
      telefono !== undefined ? telefono : personaExistente.rows[0].telefono,
      correo !== undefined ? correo : personaExistente.rows[0].correo,
      sexo !== undefined ? sexo : personaExistente.rows[0].sexo,
      imagen_perfil
    );

    // Si había imagen previa, eliminarla
    if (oldFilePath) {
      try {
        await fs.unlink(oldFilePath);
      } catch (error) {
        console.warn(`No se pudo eliminar la imagen antigua: ${oldFilePath}`);
      }
    }

    res
      .status(200)
      .json(response(true, 'Persona actualizada exitosamente', personaActualizada));
    console.log(`Persona ${id} actualizada exitosamente`);
  } catch (error) {
    console.error('Error al actualizar persona:', error.message);

    if (error.message.includes('correo')) {
      return res.status(400).json(response(false, 'El correo ya está registrado'));
    }

    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

const eliminarPersona = async (req, res) => {
  const { id } = req.params;

  try {
    const personaEliminada = await deletePersona(id);
    if (!personaEliminada) {
      return res.status(404).json(response(false, 'Persona no encontrada'));
    }
    if (personaEliminada.imagen_perfil) {
      try {
        const filePath = path.join(__dirname, '../Uploads', personaEliminada.imagen_perfil.replace(/^\/*[uU]ploads\//, ''));
        await fs.unlink(filePath);
      } catch (error) {
        console.warn(`No se pudo eliminar la imagen: ${personaEliminada.imagen_perfil}`);
      }
    }
    res.status(200).json(response(true, 'Persona eliminada exitosamente'));
    console.log("Persona eliminada exitosamente ", personaEliminada.nombre)
  } catch (error) {
    console.error('Error al eliminar persona:', error.message);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

const login = async (req, res) => {
  const { correo, contraseña } = req.body;

  if (!correo || !contraseña) {
    return res.status(400).json(response(false, 'Correo y contraseña son obligatorios'));
  }

  try {
    const persona = await loginPersona(correo, contraseña);
    const token = jwt.sign(
      { id_persona: persona.id_persona }, 
      JWT_SECRET, 
      { expiresIn: '5h' }
    );
    console.log("Se hizo un login exitoso ", correo)
    res.status(200).json(response(true, 'Login exitoso', { token, persona }));
  
  } catch (error) {
    console.error('Error en login:', error.message);
    
    if (error.message.includes('Correo no encontrado') || error.message.includes('Contraseña incorrecta')) {
      return res.status(401).json(response(false, 'Credenciales inválidas'));
    }
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

//-------- Rutas --------- 
//------------------------
//------------------------

const router = express.Router();

router.post('/registro', validatePersonaFields, crearPersonaCasual);
router.post('/login', login);

router.get('/', verifyToken, checkRole(['Administrador_ESP_DEPORTIVO']), listarPersonas);
router.get('/:id', verifyToken, checkRole(['Administrador_ESP_DEPORTIVO', 'Cliente', 'Deportista', 'Encargado']), obtenerPersonaPorId);
router.get('/correo/:correo', verifyToken, checkRole(['Administrador_ESP_DEPORTIVO']), obtenerPersonaPorCorreo);
router.get('/buscar-nombre/:nombre', verifyToken, checkRole(['Administrador_ESP_DEPORTIVO']), buscarPersonaPorNombre);

router.patch('/:id', verifyToken, checkRole(['Administrador_ESP_DEPORTIVO', 'Cliente', 'Deportista', 'Encargado']), handleUpload('persona', 'imagen_perfil'), actualizarPersona);
router.delete('/:id', verifyToken, checkRole(['Administrador_ESP_DEPORTIVO']), eliminarPersona);

module.exports = router;