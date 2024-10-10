import express from 'express';
import bodyParser from 'body-parser';
import { readData, writeData } from './data.js';
import Joi from 'joi';

const app = express();
const PORT = 3000;

app.use(bodyParser.json());

const mascotaSchema = Joi.object({
    id: Joi.number().integer().positive(), 
    nombre: Joi.string().min(1).required(), 
    especie: Joi.string().valid('perro', 'gato', 'otro').required(), 
    raza: Joi.string().min(1).required(), 
    edad: Joi.number().integer().min(0).required(), 
    dueño: Joi.string().min(1).required(), 
    telefono: Joi.string().pattern(/^[0-9]{10}$/).required(), 
    historial: Joi.array().items(Joi.string()).required(), 
});

//  Obtener todas las mascotas
app.get('/mascotas', (req, res) => {
    const data = readData();
    res.json(data);
});

//  Obtener una mascota por ID
app.get('/mascotas/:mascotaId', (req, res) => {
    const mascotaId = parseInt(req.params.mascotaId);
    if (isNaN(mascotaId)) {
        return res.status(400).send('ID de mascota inválido');
    }

    const data = readData();
    const mascota = data.find(m => m.id === mascotaId);

    if (mascota) {
        res.json(mascota);
    } else {
        res.status(404).send('Mascota no encontrada');
    }
});

//  Agregar una nueva mascota
app.post('/mascotas', (req, res) => {
    const { error } = mascotaSchema.validate(req.body);
    if (error) {
        return res.status(400).send(error.details[0].message);
    }

    const data = readData();
    const nuevaMascota = req.body;

    // Asignar un nuevo ID
    nuevaMascota.id = data.length ? data[data.length - 1].id + 1 : 1;
    data.push(nuevaMascota);
    writeData(data);
    res.status(201).json(nuevaMascota);
});

//  Actualizar una mascota
app.put('/mascotas/:mascotaId', (req, res) => {
    const mascotaId = parseInt(req.params.mascotaId);
    if (isNaN(mascotaId)) {
        return res.status(400).send('ID de mascota inválido');
    }

    const { error } = mascotaSchema.validate(req.body);
    if (error) {
        return res.status(400).send(error.details[0].message);
    }

    const data = readData();
    const index = data.findIndex(m => m.id === mascotaId);

    if (index !== -1) {
        data[index] = { ...data[index], ...req.body };
        writeData(data);
        res.json(data[index]);
    } else {
        res.status(404).send('Mascota no encontrada');
    }
});

//  Eliminar una mascota
app.delete('/mascotas/:mascotaId', (req, res) => {
    const mascotaId = parseInt(req.params.mascotaId);
    if (isNaN(mascotaId)) {
        return res.status(400).send('ID de mascota inválido');
    }

    const data = readData();
    const index = data.findIndex(m => m.id === mascotaId);

    if (index !== -1) {
        data.splice(index, 1);
        writeData(data);
        res.status(204).send();
    } else {
        res.status(404).send('Mascota no encontrada');
    }
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});