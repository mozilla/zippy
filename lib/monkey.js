'use strict';

/*
                      __,__
             .--.  .-"     "-.  .--.
            / .. \/  .-. .-.  \/ .. \
           | |  '|  /   Y   \  |'  | |
           | \   \  \ o | o /  /   / |
            \ '- ,\.-"`` ``"-./, -' /
             `'-' /_   ^ ^   _\ '-'`
             .--'|  \._ _ _./  |'--.
           /`    \   \.-.  /   /    `\
          /       '._/  |-' _.'       \
         /          ;  /--~'   |       \
        /        .'\|.-\--.     \       \
       /   .'-. /.-.;\  |\|'~'-.|\       \
       \       `-./`|_\_/ `     `\'.      \
        '.      ;     ___)        '.`;    /
          '-.,_ ;     ___)          \/   /
           \   ``'------'\       \   `  /
            '.    \       '.      |   ;/_
     jgs  ___>     '.       \_ _ _/   ,  '--.
        .'   '.   .-~~~~~-. /     |--'`~~-.  \
       // / .---'/  .-~~-._/ / / /---..__.'  /
      ((_(_/    /  /      (_(_(_(---.__    .'
                | |     _              `~~`
                | |     \'.
                 \ '....' |
                  '.,___.'


 * As we're using Restify this is needed to put render onto the Response.
 * It also makes res.locals available in the context.
 */
exports.patchNunjucksRender = function _patchNunjucksRender(server) {
  function render(req, res, next) {
    res.render = function(name, ctx, cb) {
      var obj = res.locals;
      Object.keys(obj).forEach(function(key) {
        ctx[key] = obj[key];
      });
      return server.env.render.apply(server.env, [name, ctx, cb]);
    };
    next();
  }
  return render;
};


/*
 * This is required to make restify work with i18n-abide. It adds the missing
 * res.locals which i18n-abide uses to poke template vars onto to be used in
 * views.
 */
exports.patchResLocals = function _patchResLocals(req, res, next) {
  var locals = function _locals() {
    function locals(obj){
      Object.keys(obj).forEach(function(key) {
        locals[key] = obj[key];
      });
      return obj;
    }
    return locals;
  };
  res.locals = locals(res);
  next();
};
