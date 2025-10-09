const express = require('express');
const pool = require('../config/database');
const { verifyToken, checkRole } = require('../middleware/auth');
const { createUploadAndProcess, unlinkFile } = require('../middleware/multer');

// raw json

const crearDisciplinaRaw = async(req, res) => {
    try{
        const {nombre, descripcion, imagen } = req.body;

        // validar
        if(!nombre) {
            return res.status(400).json ({
                success: false,
                message: 'El nombre es obligatorio'
            });
        }

        // Insertar en base de datos
        const query = `
            INSERT INTO disciplina (nombre, imagen, descripcion)
            VALUES ($1, $2, $3)
            RETURNING *
        `;

        const values = [nombre, imagen || null, descripcion || null];

        const result = await pool.query(query, values);
        const nuevaDisciplina = result.rows[0];

        res.status(201).json({
            success: true,
            data: nuevaDisciplina,
            message: "Disciplina creada exitosamnte"
        });

    }catch (error){
        console.log(" Error al crear disciplina", error.message);

        res.status(500).json({
            success: false,
            message: "Error al crear disciplina: " + error.message
        });
    }
} 


const crearDisciplinaForm = async(req, res) => {
    let imagePath = null;
    try{
        const {nombre, descripcion } = req.body;

        // validar
        if(!nombre || nombre.trim() === '') {
            return res.status(400).json ({
                success: false,
                message: 'El nombre es obligatorio'
            });
        }

        if(req.file) {
            const uploadFolder = "disciplinas";
            const nombre_imagen_ini = 'disciplina';

            imagePath = await createUploadAndProcess("imagen", uploadFolder, nombre_imagen_ini)(req, res);
        }

        // Insertar en base de datos
        const query = `
            INSERT INTO disciplina (nombre, imagen, descripcion)
            VALUES ($1, $2, $3)
            RETURNING *
        `;

        const values = [nombre.trim(), imagePath, descripcion?.trim() || null];

        const result = await pool.query(query, values);
        const nuevaDisciplina = result.rows[0];

        res.status(201).json({
            success: true,
            data: nuevaDisciplina,
            message: "Disciplina creada exitosamnte"
        });

    }catch (error){
        console.log(" Error al crear disciplina", error.message);

        if(!imagePath) {
            await unlinkFile(imagePath);
        }

        res.status(500).json({
            success: false,
            message: "Error al crear disciplina: " + error.message
        });
    }
} 
