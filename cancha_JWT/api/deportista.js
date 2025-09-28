const express = require('express');
const pool = require('../config/database');
const { verifyToken, checkRole } = require('../middleware/auth');
const path = require('path');
const fs = require('fs').promises;

// --- Modelos ---
async function getAllDeportistas() {
  try {
    const query = `
      SELECT d.id_deportista, d.nivel, d.disciplina_principal, p.id_persona, p.nombre, p.apellido, p.telefono, p.correo, p.sexo, p.imagen_perfil
      FROM DEPORTISTA d
      JOIN PERSONA p ON d.id_deportista = p.id_persona
    `;
    const result = await pool.query(query);
    return result.rows;
  } catch (error) {
    throw new Error('Error al listar deportistas: ' + error.message);
  }
}

async function getDeportistaById(id) {
  try {
    const query = `
      SELECT d.id_deportista, d.nivel, d.disciplina_principal, p.id_persona, p.nombre, p.apellido, p.telefono, p.correo, p.sexo, p.imagen_perfil
      FROM DEPORTISTA d
      JOIN PERSONA p ON d.id_deportista = p.id_persona
      WHERE d.id_deportista = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  } catch (error) {
    throw new Error('Error al obtener deportista por ID: ' + error.message);
  }
}

async function getDeportistaByIdPersona(id_persona) {
  try {
    const query = `
      SELECT d.id_deportista, d.nivel, d.disciplina_principal, p.id_persona, p.nombre, p.apellido, p.telefono, p.correo, p.sexo, p.imagen_perfil
      FROM DEPORTISTA d
      JOIN PERSONA p ON d.id_deportista = p.id_persona
      WHERE p.id_persona = $1
    `;
    const result = await pool.query(query, [id_persona]);
    return result.rows[0];
  } catch (error) {
    throw new Error('Error al obtener deportista por id_persona: ' + error.message);
  }
}

async function getPersonaByDeportistaId(id) {
  try {
    const query = `
      SELECT p.id_persona, p.nombre, p.apellido, p.telefono, p.correo, p.sexo, p.imagen_perfil
      FROM PERSONA p
      JOIN DEPORTISTA d ON p.id_persona = d.id_deportista
      WHERE d.id_deportista = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  } catch (error) {
    throw new Error('Error al obtener persona asociada al deportista: ' + error.message);
  }
}

async function getReservasByDeportistaId(id) {
  try {
    const query = `
      SELECT r.id_reserva, r.fecha_reserva, r.cupo, r.monto_total, r.saldo_pendiente, r.estado, r.id_cliente, r.id_cancha, r.id_disciplina
      FROM RESERVA r
      JOIN participa_en p ON r.id_reserva = p.id_reserva
      WHERE p.id_deportista = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows;
  } catch (error) {
    throw new Error('Error al listar reservas del deportista: ' + error.message);
  }
}

async function getDeportistasByNivel(nivel) {
  try {
    const query = `
      SELECT d.id_deportista, d.nivel, d.disciplina_principal, p.id_persona, p.nombre, p.apellido, p.telefono, p.correo, p.sexo, p.imagen_perfil
      FROM DEPORTISTA d
      JOIN PERSONA p ON d.id_deportista = p.id_persona
      WHERE d.nivel = $1
    `;
    const result = await pool.query(query, [nivel]);
    return result.rows;
  } catch (error) {
    throw new Error('Error al listar deportistas por nivel: ' + error.message);
  }
}

async function getDeportistasByDisciplina(disciplina) {
  try {
    const query = `
      SELECT d.id_deportista, d.nivel, d.disciplina_principal, p.id_persona, p.nombre, p.apellido, p.telefono, p.correo, p.sexo, p.imagen_perfil
      FROM DEPORTISTA d
      JOIN PERSONA p ON d.id_deportista = p.id_persona
      WHERE d.disciplina_principal = $1
    `;
    const result = await pool.query(query, [disciplina]);
    return result.rows;
  } catch (error) {
    throw new Error('Error al listar deportistas por disciplina: ' + error.message);
  }
}

async function createDeportista(nivel, disciplina_principal, id_persona) {
  try {
    const query = `
      INSERT INTO DEPORTISTA (id_deportista, nivel, disciplina_principal)
      VALUES ($1, $2, $3)
      RETURNING id_deportista, nivel, disciplina_principal
    `;
    const values = [id_persona, nivel, disciplina_principal];
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    throw new Error('Error al crear deportista: ' + error.message);
  }
}

async function updateDeportista(id, nivel, disciplina_principal) {
  try {
    const query = `
      UPDATE DEPORTISTA
      SET nivel = COALESCE($1, nivel),
          disciplina_principal = COALESCE($2, disciplina_principal)
      WHERE id_deportista = $3
      RETURNING id_deportista, nivel, disciplina_principal
    `;
    const values = [nivel, disciplina_principal, id];
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    throw new Error('Error al actualizar deportista: ' + error.message);
  }
}

async function deleteDeportista(id) {
  try {
    const query = `
      DELETE FROM DEPORTISTA
      WHERE id_deportista = $1
      RETURNING id_deportista, nivel, disciplina_principal
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  } catch (error) {
    throw new Error('Error al eliminar deportista: ' + error.message);
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

const listarDeportistas = async (req, res) => {
  try {
    const deportistas = await getAllDeportistas();
    const deportistasConImagenValidada = await Promise.all(
      deportistas.map(async (deportista) => {
        if (deportista.imagen_perfil) {
          try {
            const filePath = path.join(__dirname, '../Uploads', deportista.imagen_perfil.replace(/^\/*[uU]ploads\//, ''));
            await fs.access(filePath);
            return deportista;
          } catch (error) {
            console.warn(`Imagen no encontrada para deportista ${deportista.id_deportista}: ${deportista.imagen_perfil}`);
            return { ...deportista, imagen_perfil: null };
          }
        }
        return deportista;
      })
    );
    res.status(200).json(response(true, 'Lista de deportistas obtenida', deportistasConImagenValidada));
  } catch (error) {
    console.error('Error al listar deportistas:', error);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

const obtenerDeportistaPorId = async (req, res) => {
  const { id } = req.params;

  try {
    const deportista = await getDeportistaById(id);
    if (!deportista) {
      return res.status(404).json(response(false, 'Deportista no encontrado'));
    }
    if (deportista.imagen_perfil) {
      try {
        const filePath = path.join(__dirname, '../Uploads', deportista.imagen_perfil.replace(/^\/*[uU]ploads\//, ''));
        await fs.access(filePath);
      } catch (error) {
        console.warn(`Imagen no encontrada para deportista ${deportista.id_deportista}: ${deportista.imagen_perfil}`);
        deportista.imagen_perfil = null;
      }
    }
    res.status(200).json(response(true, 'Deportista obtenido', deportista));
  } catch (error) {
    console.error('Error al obtener deportista por ID:', error);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

const obtenerDeportistaPorIdPersona = async (req, res) => {
  const { id_persona } = req.params;

  try {
    const deportista = await getDeportistaByIdPersona(id_persona);
    if (!deportista) {
      return res.status(404).json(response(false, 'Deportista no encontrado'));
    }
    if (deportista.imagen_perfil) {
      try {
        const filePath = path.join(__dirname, '../Uploads', deportista.imagen_perfil.replace(/^\/*[uU]ploads\//, ''));
        await fs.access(filePath);
      } catch (error) {
        console.warn(`Imagen no encontrada para deportista ${deportista.id_deportista}: ${deportista.imagen_perfil}`);
        deportista.imagen_perfil = null;
      }
    }
    res.status(200).json(response(true, 'Deportista obtenido', deportista));
  } catch (error) {
    console.error('Error al obtener deportista por id_persona:', error);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

const obtenerPersonaPorDeportistaId = async (req, res) => {
  const { id } = req.params;

  try {
    const persona = await getPersonaByDeportistaId(id);
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
    console.error('Error al obtener persona asociada al deportista:', error);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

const obtenerReservasPorDeportistaId = async (req, res) => {
  const { id } = req.params;

  try {
    const reservas = await getReservasByDeportistaId(id);
    if (!reservas.length) {
      return res.status(404).json(response(false, 'No se encontraron reservas para este deportista'));
    }
    res.status(200).json(response(true, 'Reservas obtenidas', reservas));
  } catch (error) {
    console.error('Error al listar reservas del deportista:', error);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

const listarDeportistasPorNivel = async (req, res) => {
  const { nivel } = req.params;

  try {
    const deportistas = await getDeportistasByNivel(nivel);
    if (!deportistas.length) {
      return res.status(404).json(response(false, 'No se encontraron deportistas para este nivel'));
    }
    const deportistasConImagenValidada = await Promise.all(
      deportistas.map(async (deportista) => {
        if (deportista.imagen_perfil) {
          try {
            const filePath = path.join(__dirname, '../Uploads', deportista.imagen_perfil.replace(/^\/*[uU]ploads\//, ''));
            await fs.access(filePath);
            return deportista;
          } catch (error) {
            console.warn(`Imagen no encontrada para deportista ${deportista.id_deportista}: ${deportista.imagen_perfil}`);
            return { ...deportista, imagen_perfil: null };
          }
        }
        return deportista;
      })
    );
    res.status(200).json(response(true, 'Deportistas obtenidos por nivel', deportistasConImagenValidada));
  } catch (error) {
    console.error('Error al listar deportistas por nivel:', error);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

const listarDeportistasPorDisciplina = async (req, res) => {
  const { disciplina } = req.params;

  try {
    const deportistas = await getDeportistasByDisciplina(disciplina);
    if (!deportistas.length) {
      return res.status(404).json(response(false, 'No se encontraron deportistas para esta disciplina'));
    }
    const deportistasConImagenValidada = await Promise.all(
      deportistas.map(async (deportista) => {
        if (deportista.imagen_perfil) {
          try {
            const filePath = path.join(__dirname, '../Uploads', deportista.imagen_perfil.replace(/^\/*[uU]ploads\//, ''));
            await fs.access(filePath);
            return deportista;
          } catch (error) {
            console.warn(`Imagen no encontrada para deportista ${deportista.id_deportista}: ${deportista.imagen_perfil}`);
            return { ...deportista, imagen_perfil: null };
          }
        }
        return deportista;
      })
    );
    res.status(200).json(response(true, 'Deportistas obtenidos por disciplina', deportistasConImagenValidada));
  } catch (error) {
    console.error('Error al listar deportistas por disciplina:', error);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

const crearDeportista = async (req, res) => {
  const { nivel, disciplina_principal, id_persona } = req.body;

  if (!nivel || !id_persona) {
    return res.status(400).json(response(false, 'Nivel e id_persona son obligatorios'));
  }

  try {
    // Verificar que id_persona existe en PERSONA
    const personaExistente = await pool.query('SELECT id_persona FROM PERSONA WHERE id_persona = $1', [id_persona]);
    if (!personaExistente.rows[0]) {
      return res.status(404).json(response(false, 'Persona no encontrada'));
    }

    // Validar nivel contra el tipo enumerado
    const validLevels = ['principiante', 'intermedio', 'avanzado'];
    if (!validLevels.includes(nivel)) {
      return res.status(400).json(response(false, 'Nivel inválido. Debe ser: principiante, intermedio o avanzado'));
    }

    const nuevoDeportista = await createDeportista(nivel, disciplina_principal, id_persona);
    res.status(201).json(response(true, 'Deportista creado exitosamente', nuevoDeportista));
  } catch (error) {
    console.error('Error al crear deportista:', error);
    if (error.message.includes('duplicate key')) {
      return res.status(400).json(response(false, 'El id_persona ya está registrado como deportista'));
    }
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

const actualizarDeportista = async (req, res) => {
  const { id } = req.params;
  const { nivel, disciplina_principal } = req.body;

  try {
    // Validar nivel si se proporciona
    if (nivel) {
      const validLevels = ['principiante', 'intermedio', 'avanzado'];
      if (!validLevels.includes(nivel)) {
        return res.status(400).json(response(false, 'Nivel inválido. Debe ser: principiante, intermedio o avanzado'));
      }
    }

    const deportistaActualizado = await updateDeportista(id, nivel, disciplina_principal);
    if (!deportistaActualizado) {
      return res.status(404).json(response(false, 'Deportista no encontrado'));
    }
    res.status(200).json(response(true, 'Deportista actualizado exitosamente', deportistaActualizado));
  } catch (error) {
    console.error('Error al actualizar deportista:', error);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

const eliminarDeportista = async (req, res) => {
  const { id } = req.params;

  try {
    const deportistaEliminado = await deleteDeportista(id);
    if (!deportistaEliminado) {
      return res.status(404).json(response(false, 'Deportista no encontrado'));
    }
    res.status(200).json(response(true, 'Deportista eliminado exitosamente'));
  } catch (error) {
    console.error('Error al eliminar deportista:', error);
    res.status(500).json(response(false, 'Error interno del servidor'));
  }
};

// --- Rutas ---
const router = express.Router();

router.post('/', verifyToken, checkRole(['Administrador_ESP_DEPORTIVO']), crearDeportista);

router.get('/', verifyToken, checkRole(['Administrador_ESP_DEPORTIVO', 'DEPORTISTA']), listarDeportistas);
router.get('/:id', verifyToken, checkRole(['Administrador_ESP_DEPORTIVO', 'DEPORTISTA']), obtenerDeportistaPorId);
router.get('/persona/:id_persona', verifyToken, checkRole(['Administrador_ESP_DEPORTIVO', 'DEPORTISTA']), obtenerDeportistaPorIdPersona);
router.get('/:id/persona', verifyToken, checkRole(['Administrador_ESP_DEPORTIVO', 'DEPORTISTA']), obtenerPersonaPorDeportistaId);
router.get('/nivel/:nivel', verifyToken, checkRole(['Administrador_ESP_DEPORTIVO', 'DEPORTISTA']), listarDeportistasPorNivel);
router.get('/disciplina/:disciplina', verifyToken, checkRole(['Administrador_ESP_DEPORTIVO', 'DEPORTISTA']), listarDeportistasPorDisciplina);
router.get('/:id/reservas', verifyToken, checkRole(['Administrador_ESP_DEPORTIVO', 'DEPORTISTA']), obtenerReservasPorDeportistaId);

router.patch('/:id', verifyToken, checkRole(['Administrador_ESP_DEPORTIVO']), actualizarDeportista);
router.delete('/:id', verifyToken, checkRole(['Administrador_ESP_DEPORTIVO']), eliminarDeportista);

module.exports = router;
