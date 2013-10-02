
function home (req, res, next) {
    res.docName = 'home';
    res.send('Home of Zippy.');
    next();
}

module.exports = {
    home: home,
};
