var models = require('../models/models.js');

// MW que permite acciones solamente si el quiz objeto
//pertenece al usuario logueado o si es cuenta admin
exports.ownershipRequired = function(req, res, next) {
	var objQuizOwner = req.user.id;
	var logUser = req.session.user.id;
	var isAdmin = req.session.user.isAdmin;
	
	if(isAdmin || objQuizOwner === logUser) {
		next();
	} else {
		res.redirect('/');
	}
};


// autoload
exports.load = function( req, res, next, userId){
    models.User.find({
        where: { id: Number(userId)}
    })
    .then(function(user){
        if(user){
            req.user = user;
            next();
        } else {
            next(new Error("No existe usuario: "+userId));
        }
    }).catch(function(error){ next(error)});
}

// autenticar
exports.autenticar = function(login, password, callback){
    models.User.find({
        where: { username: login}
    })
    .then(function(user){
        if(user){ // si existe usuario
            if(user.verifyPassword(password)){
                callback(null, user);
            } else {
                callback(new Error('password erroneo.'))
            }
        } else {
            callback(new Error('No existe el usuario: '+login))
        }
    })
    .catch(function(error){callback(error)});
};

// get /user/id/edit
exports.edit = function(req, res){
    res.render('user/edit', {
        user: req.user,
        errors: []
    })
};

// get /user
exports.new = function(req, res){
    var user = models.User.build({username: "", password: ""});
    res.render('user/new', {user: user, errors: []});
};

// post /user
exports.create = function(req, res, next){
    var user = models.User.build( req.body.user );

    user
    .validate()
    .then(
        function(err){
            if (err) {
                res.render('user/new', {user: user, errors: err.errors});
            } else {
                user // save: guarda en DB campos username y password de user
                .save({fields: ["username", "password"]})
                .then( function(){
                    // crea la sesión para que el usuario acceda ya autenticado y redirige a /
                    req.session.user = {id:user.id, username:user.username};
                    res.redirect('/');
                }); 
            }
        }
    ).catch(function(error){next(error)});
//    
};

// put /user/userId
exports.update = function(req, res, next){
    req.user.username = req.body.user.username;
    req.user.password = req.body.user.password;
//    console.log("usuario: "+req.user.username);
    
    req.user.validate()
    .then(function(err){
        if(err){
            res.render('user/edit', {user: req.user, errors: err});
        } else{
            req.user
            .save( {fields: ['username', 'password']})
            .then(function(){res.redirect('/');});
        }
    })
    .catch(function(error){next(error)});
};

// delete /user/userId
exports.destroy = function(req, res){
    req.user.destroy().then(function(){
        delete req.session.user;
        res.redirect('/');
    }).catch(function(error){ next(error)});
};