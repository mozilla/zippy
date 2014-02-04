exports.retrieve = function(req, res) {
  var context = {
    title: 'Welcome to Zippy!',
    lang: 'en',
  };
  res.render('homepage.html', context);
};
