const {Schema, model} = require('mongoose');

const TodoListItemsSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['sayuran', 'ikan', 'buah'],
        required: true
    }
});

module.exports = model('TodoListFood', TodoListItemsSchema);
