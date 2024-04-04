const {Router} = require('express');
const router = Router();
const TodoListItems = require('../../models/TodoListItems');

router.get('/', async (req, res) => {
    try {
        const todoListItems = await TodoListItems.find();
        res.status(200).json(todoListItems);
    }
    catch (error) {
        res.status(500).json({error: error.message});
    }
});

module.exports = router;