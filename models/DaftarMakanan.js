const {Schema, model} = require('mongoose');

// Definisikan schema untuk jenis kelompok makanan
const TodoListItemsSchema = new Schema({
    // Nama kelompok makanan
    title: {
        type: String,
        required: true
    },
    // Deskripsi kelompok makanan
    description: {
        type: String,
        required: true
    },
    // Gambar kelompok makanan (URL atau path file)
    image: {
        type: String,
        required: true
    },
    // Role kelompok makanan
    role: {
        type: String,
        enum: ['sayuran', 'ikan', 'buah'],
        required: true
    }
});

module.exports = model('TodoListFood', TodoListItemsSchema);
