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
    rating: {
        type: Number,
        default: 0
    },
    specialization: {
        type: String,
        enum: ['Kulit', 'Anak', 'Saraf', 'Jantung', 'Mata', 'Psikolog'],
        required: true
    }
});

module.exports = model('TodoListDoctors', TodoListItemsSchema);




