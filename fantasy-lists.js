var List = require('./src/list'),
    Zipper = require('./src/zipper');

if (typeof module != 'undefined')
    module.exports = {
        List: List,
        Zipper: Zipper
    };