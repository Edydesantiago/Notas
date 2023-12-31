const mongoose = require('mongoose');
const { Schema } = mongoose;

const NotasSchema = new Schema(
    {
        titulo: {
            type: String,
            required: true
        },
        descripcion: {
            type: String,
            required: true
        },
        fecha: {
            type: Date,
            default: Date.now
        },
        usuario: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },// categoria
        categoria: {
            type: String, 
            enum: ['trabajo', 'casa']
        }
    }// fincategoria

);

module.exports = mongoose.model('Nota', NotasSchema);