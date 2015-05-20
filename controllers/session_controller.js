// MW de autorización de accesos HTTP restringidos
exports.loginRequired = function(req, res, next) {
	if(req.session.user) {
		next();
	} else {
		res.redirect('/login');
	}
};

// GET /login  --formulario de login
exports.new = function (req, res) {
	var errors = req.session.errors || {};
	req.session.errors = {};
	
	res.render('sessions/new', {errors: errors});
};

// POST /login  -- Crear la sesión
exports.create = function (req, res) {
	var login = req.body.login;
	var password = req.body.password;
	var d = new Date();
	var initSession = d.getTime();
	
	var userController = require('./user_controller');
	userController.autenticar(login, password, function (error, user) {
		if (error) {
			req.session.errors = [{"message": 'Se ha producido un error: ' + error}];
			res.redirect("/login");
			return;
		}
		
		// Crear req.session.user y guardar campos id y username
		// La sesión se define por la existancia de: req.session.user
		req.session.user = {id: user.id, username: user.username, initSession: initSession, isAdmin: user.isAdmin};
		
		res.redirect(req.session.redir.toString());
	});
};

// DELETE /logout  -- Destruir sesión
exports.destroy = function (req, res) {
	delete req.session.user;
	res.redirect(req.session.redir.toString());
};

// Auto Logout
exports.autoLogout = function(req, res, next) {
	var d = new Date();
	var actual = d.getTime();
	
	if (!req.session.user) {
		next();
	} else {
		var resta = actual - req.session.user.initSession;
		req.session.user.timeLogin = actual; 
		if(resta < 120000) {
			next();
		} else {
			delete req.session.user;
			res.redirect('/login');
			console.log('Autologout del usuario: ' + req.session.user.login);
		}
	} 
};