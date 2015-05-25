var express = require('express');
var multer = require('multer');
var router = express.Router();

var quizController = require('../controllers/quiz_controller');
var commentController = require('../controllers/comment_controller');
var sessionController = require('../controllers/session_controller');
var userController = require('../controllers/user_controller');
var favouritesController = require('../controllers/favourites_controller');

// Página de entrada (home page)
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Quiz', errors: []});
});

// Autoload de comandos con :quizId
router.param('quizId', quizController.load);  // autoload :quizId
router.param('commentId', commentController.load);
router.param('userId', userController.load);

// Definición de rutas de sesión
router.get('/login',  sessionController.autoLogout, sessionController.new);
router.post('/login', sessionController.autoLogout, sessionController.create);
router.get('/logout', sessionController.autoLogout, sessionController.destroy);

// Definición de rutas de /quizes
router.get('/quizes',                      sessionController.autoLogout, quizController.index);
router.get('/quizes/:quizId(\\d+)',        sessionController.autoLogout, quizController.show);
router.get('/quizes/:quizId(\\d+)/answer', sessionController.autoLogout, quizController.answer);

//Crear preguntas
router.get('/quizes/new',                  sessionController.autoLogout, sessionController.loginRequired, quizController.new);
router.post('/quizes/create',              sessionController.autoLogout, sessionController.loginRequired, multer({ dest: './public/media'}), quizController.create);
//Editar preguntas
router.get('/quizes/:quizId(\\d+)/edit',   sessionController.autoLogout, quizController.ownershipRequired, sessionController.loginRequired, quizController.edit);
router.put('/quizes/:quizId(\\d+)',        sessionController.autoLogout, quizController.ownershipRequired, sessionController.loginRequired, multer({ dest: './public/media'}), quizController.update);
router.delete('/quizes/:quizId(\\d+)',     sessionController.autoLogout, quizController.ownershipRequired, sessionController.loginRequired, quizController.destroy);

// Comentarios
router.get('/quizes/:quizId(\\d+)/comments/new', sessionController.autoLogout, commentController.new);
router.post('/quizes/:quizId(\\d+)/comments',    sessionController.autoLogout, commentController.create);
router.get('/quizes/:quizId(\\d+)/comments/:commentId(\\d+)/publish',    
		   								sessionController.autoLogout, commentController.ownershipRequired, sessionController.loginRequired, commentController.publish);

// Autologout:
router.get('/quizes/statistics', sessionController.autoLogout, quizController.statistics);

// Definición de rutas de cuenta
router.get('/user', 					userController.new);
router.post('/user', 					userController.create);
router.get('/user/:userId(\\d+)/edit',  sessionController.autoLogout, sessionController.loginRequired, userController.ownershipRequired, userController.edit);
router.put('/user/:userId(\\d+)', 		sessionController.loginRequired, userController.ownershipRequired, userController.update);
router.delete('/user/:userId(\\d+)', 	sessionController.loginRequired, userController.ownershipRequired, userController.destroy);
router.get('/user/:userId(\\d+)/quizes', quizController.index);
//Favoritos
router.get('/user/:userId(\\d+)/favourites', sessionController.autoLogout, sessionController.loginRequired, favouritesController.index);
router.delete('/user/:userId(\\d+)/favourites/quizId(\\d+)', sessionController.autoLogout, sessionController.loginRequired, favouritesController.remove);
router.put('/user/:userId(\\d+)/favourites/quizId(\\d+)', sessionController.autoLogout, sessionController.loginRequired, favouritesController.add);

/*GET /author */
router.get('/author', function(req, res, next) {
    res.render('author', { title: 'Créditos', errors: [] });
});

module.exports = router;
