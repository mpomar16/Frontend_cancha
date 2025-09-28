const express = require('express');
const path = require('path');
const cors = require('cors');


const personaRoutes = require('./api/persona');
const administradorRoutes = require('./api/administrador');
const clienteRoutes = require('./api/cliente');
const deportistaRoutes = require('./api/deportista');
const encargadoRoutes = require('./api/encargado');
const espacio_deportivoRoutes = require('./api/espacio_deportivo');
const canchaRoutes = require('./api/cancha');
const disciplinaRoutes = require('./api/disciplina');
const reservaRoutes = require('./api/reserva');
const pagoRoutes = require('./api/pago');
const qr_reservaRoutes = require('./api/qr_reserva');
const controlRoutes = require('./api/control');
const reporte_incidenciaRoutes = require('./api/reporte_incidencia');
const comentarioRoutes = require('./api/comentario');
const ponderacionRoutes = require('./api/ponderacion');
const se_practicaRoutes = require('./api/se_practica');
const participa_enRoutes = require('./api/participa_en');


const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Para manejar multipart/form-data
app.use('/Uploads', express.static(path.join(__dirname, 'Uploads')));

// Rutas
try {
  app.use('/persona', personaRoutes);
  app.use('/administrador', administradorRoutes);
  app.use('/cliente', clienteRoutes);
  app.use('/deportista', deportistaRoutes);
  app.use('/encargado', encargadoRoutes);
  app.use('/espacio_deportivo', espacio_deportivoRoutes);
  app.use('/cancha', canchaRoutes);
  app.use('/disciplina', disciplinaRoutes);
  app.use('/reserva', reservaRoutes);
  app.use('/pago', pagoRoutes);
  app.use('/qr_reserva', qr_reservaRoutes);
  app.use('/control', controlRoutes);
  app.use('/reporte_incidencia', reporte_incidenciaRoutes);
  app.use('/comentario', comentarioRoutes);
  app.use('/ponderacion', ponderacionRoutes);
  app.use('/se_practica', se_practicaRoutes);
  app.use('/participa_en', participa_enRoutes);

} catch (err) {
  console.error('Error al cargar las rutas:', err);
  process.exit(1); // Termina el proceso si hay un error en las rutas
}

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Error interno del servidor',
  });
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});

module.exports = app;