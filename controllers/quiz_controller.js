var models = require('../models/models.js');

// MW que permite acciones solamente si el quiz objeto
//pertenece al usuario logueado o si es cuenta admin
exports.ownershipRequired = function(req, res, next) {
	var objQuizOwner = req.quiz.UserId;
	var logUser = req.session.user.id;
	var isAdmin = req.session.user.isAdmin;
	
	if(isAdmin || objQuizOwner === logUser) {
		next();
	} else {
		res.redirect('/');
	}
};

// Autoload :id
exports.load = function(req, res, next, quizId) {
  models.Quiz.find({
	  where: {
		  id: Number(quizId)
	  },
	  include: [{
		  model: models.Comment
	  }]
  }).then(
    function(quiz) {
      if (quiz) {
        req.quiz = quiz;
        next();
      } else{next(new Error('No existe quizId=' + quizId))}
    }
  ).catch(function(error){next(error)});
};

// GET /quizes
// GET /users/:userId/quizes
exports.index = function(req, res, next){
    var options = {};
    var searchQuizes = [];
    
    if(req.user){
        options.where = {UserId: req.user.id}
    }
    
    if(req.query.search){
        var search = '%'+req.query.search+'%';
         // Aqui ponemos que busque las preguntas que contienen la palabra buscada
        models.Quiz.findAll({
            where: ["pregunta like ?", search],
            order: 'pregunta ASC'
        })
            .then(function(quizes){
            if(req.session.user){
                var user= req.session.user;
                findQuizesIndex(req, res, user, options, quizes);
            }else{
                res.render('quizes', {quizes: quizes, errors: []});
            }
        })
    }else if(req.session.user){
        var user = req.session.user;
        findQuizesIndex(req, res, user, options, searchQuizes);        
    } else{
        models.Quiz.findAll(options).then(function(quizes){
            res.render('quizes', {quizes: quizes, errors: []}); 
        }).catch(function(error){ next(error)})
    }      
};

// GET /quizes/:id
exports.show = function(req, res){
  models.Quiz.find(req.params.quizId).then(function(quiz){
      
      // para poder coger el quiz con quizes[0]
      var quizUnique = req.quiz;
      var quizes = [quizUnique];
      // si hay usuario, poner la estrellita
      if(req.session.user){
          var user = req.session.user;
          isFavInShow(req, res, user, quizUnique);   
         
      }
      else{
          res.render('quizes/show', {quizes: quizes, errors: []});
      }
  })  
};

// GET /quizes/:id/answer
exports.answer = function(req, res) {
  var resultado = 'Incorrecto';
  if (req.query.respuesta === req.quiz.respuesta) {
    resultado = 'Correcto';
  }
  res.render('quizes/answer', 
    { quiz: req.quiz, 
      respuesta: resultado, 
      errors: []
    }
  );
};

// GET /quizes/new
exports.new = function(req, res) {
  var quiz = models.Quiz.build( // crea objeto quiz 
    {pregunta: "Pregunta", respuesta: "Respuesta"}
  );

  res.render('quizes/new', {quiz: quiz, errors: []});
};

// POST /quizes/create
exports.create = function(req, res) {
  req.body.quiz.userId = req.session.user.id;
	if(req.files.image) {
		req.body.quiz.image = req.files.image.name;
	}
  var quiz = models.Quiz.build( req.body.quiz );

  quiz
  .validate()
  .then(
    function(err){
      if (err) {
        res.render('quizes/new', {quiz: quiz, errors: err.errors});
      } else {
        quiz // save: guarda en DB campos pregunta y respuesta de quiz
        .save({fields: ["pregunta", "respuesta", "UserId", "image"]})
        .then( function(){ res.redirect('/quizes')}) 
      }      // res.redirect: Redirección HTTP a lista de preguntas
    }
  ).catch(function(error) {next(error)});
};

// GET /quizes/:id/edit
exports.edit = function(req, res) {
  var quiz = req.quiz;  // req.quiz: autoload de instancia de quiz

  res.render('quizes/edit', {quiz: quiz, errors: []});
};

// PUT /quizes/:id
exports.update = function(req, res) {
	if(req.files.image) {
		req.quiz.image = req.files.image.name;
	}
  req.quiz.pregunta  = req.body.quiz.pregunta;
  req.quiz.respuesta = req.body.quiz.respuesta;

  req.quiz
  .validate()
  .then(
    function(err){
      if (err) {
        res.render('quizes/edit', {quiz: req.quiz, errors: err.errors});
      } else {
        req.quiz     // save: guarda campos pregunta y respuesta en DB
        .save( {fields: ["pregunta", "respuesta", "image"]})
        .then( function(){ res.redirect('/quizes');});
      }     // Redirección HTTP a lista de preguntas (URL relativo)
    }
  ).catch(function(error) {next(error)});
};
// DELETE /quizes/:id

exports.destroy = function(req, res) {
	req.quiz.destroy().then(function(){
		res.redirect('/quizes');
	}).catch(function(error) {next(error)});
};

// GET quizes/statistics
exports.statistics = function(req, res, next){
    
    // numero de preguntas
    models.Quiz.findAll().then(function(quizes){
        var numPreg = quizes.length;
        
        // Numero de comentarios totales
        models.Comment.findAll().then(function(comments){
            var numCom = comments.length;
            
            //media
            var mediaComPreg = numCom/numPreg;
           
            // numero de preguntas sin comentarios
            var pregSinCom = 0;
            var pregConCom = 0;
            for(var i = 0; i<quizes.length; i++){   
                quizes[i].getComments().then(function(quizesComment){
                    if(quizesComment.length === 0){
                        pregSinCom++;
                        calculoEstadisticas(i, numPreg, numCom, mediaComPreg, pregSinCom, pregConCom, quizes.length-1);
                    }
                    else{
                        pregConCom++;
                        calculoEstadisticas(i, numPreg, numCom, mediaComPreg, pregSinCom, pregConCom, quizes.length-1);
                    }
                });
            }
           
            
        });
    }).catch(function(error){next(error)});
    
    function calculoEstadisticas(i, numPreg, numCom, mediaComPreg, pregSinCom, pregConCom, quizLength){
        if(pregConCom+pregSinCom === i){
            res.render('quizes/statistics', {
                numPreg:       numPreg,
                numCom:        numCom,
                mediaComPreg:  mediaComPreg,
                pregSinCom:    pregSinCom,
                pregConCom:    pregConCom,
                errors:        []
            });     
    }
	};	
};

function findQuizesIndex(req, res, user, options, searchQuizes){
  models.Quiz.findAll(options).then(function(quizes){
        var user = req.session.user;
            models.User.find({
                where: { id: Number(user.id)},
                include: [{ model: models.Quiz }]
            }).then(
                function(user){
                    user.getQuizzes().then(function(quizesFav){
                        var favs = [];
                        for(var j =0; j<quizes.length; j++){
                            for(var x = 0; x<quizesFav.length; x++){
                                if(quizes[j].id === quizesFav[x].id){
                                    favs.push(true);
                                }       
                            }
                            if(favs.length === j){
                                favs.push(false); 
                            }
                        }
                        if(searchQuizes.length === 0){
                            res.render('quizes', {quizes: quizes, errors: [], favs: favs});
                        } else {
                            res.render('quizes', {quizes: searchQuizes, errors: [], favs: favs});
                        }
                    });
                }
            )
            
        });  
};

function isFavInShow(req, res, user, quiz){
    var quizes = [quiz];
    models.User.find({
                where: { id: Number(user.id)},
                include: [{ model: models.Quiz }]
            }).then(
                function(user){
                    user.getQuizzes().then(function(quizesFav){
                        var favs = [];
                        for(var x = 0; x<quizesFav.length; x++){
                            if(quiz.id === quizesFav[x].id){
                                favs.push(true);         
                            }       
                        }
                        if(favs.length === 0){
                            favs.push(false); 
                        }
                         res.render('quizes/show', {quizes: quizes, errors: [], favs: favs});
                    });
                });
 }