const {Schema, model} = require('mongoose');

const TodoListItemsSchema = new Schema({
    title: {
        type: 'string',
        required: true
    },
    completed: {
        type: 'boolean',
        default: false
    },
    description: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },

    jenis: {
        type: String,
        enum: ['Penyakit Jantung', 'Penyakit Saraf', 'Penyakit Kulit', 'Penyakit Pernapasan', 'Penyakit Pencernaan', 'Penyakit Mental'],
        required: true
    }
});

module.exports = model('TodoListSickness', TodoListItemsSchema);




