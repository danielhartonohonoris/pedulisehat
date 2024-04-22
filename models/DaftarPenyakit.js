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
    }
});

module.exports = model('TodoListSickness', TodoListItemsSchema);




