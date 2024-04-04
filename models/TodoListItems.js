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
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = model('TodoListItemsKelasH', TodoListItemsSchema);