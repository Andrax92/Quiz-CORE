var users = {
	admin: {id: 1, username: "admin", password: "1234"},
	andrax: {id: 2, username: "andrax", password: "andrax"}
};

// Comprueba si el usuario está registrado en users
// Si falla o hay errores se ejecuta el callback(error)
exports.autenticar = function(login, password, callback) {
	if(users[login]) {
		if(password === users[login].password) {
			callback(null, users[login]);
		} else {
			callback(new Error('Contraseña errónea'));
		}
	} else {
		callback(new Error('No existe el usuario'));
	}
};