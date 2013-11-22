var z = require('./zutil');

module.exports = {

  confirmPayment: function (req, res, next) {
    var body = z.env.render('confirm.html', {
      title: 'Confirm Payment',
    });
    res.send(body);
    next();
  },

  creditCard: function (req, res, next) {
    var body = z.env.render('credit-card.html', {
      title: 'Pay by Card',
    });
    res.send(body);
    next();
  }

};
