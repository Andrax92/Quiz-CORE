var express = require('express');
var router = express.Router();

var quizController = require('../controllers/quiz_controller');
var commentController = require('../controllers/comment_controller');
var sessionController = require('../controllers/session_controller');
var userController = require('../controllers/user_controller');

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
router.post('/quizes/create',              sessionController.autoLogout, sessionController.loginRequired, quizController.create);
//Editar preguntas
router.get('/quizes/:quizId(\\d+)/edit',   sessionController.autoLogout, sessionController.loginRequired, quizController.edit);
router.put('/quizes/:quizId(\\d+)',        sessionController.autoLogout, sessionController.loginRequired, quizController.update);
router.delete('/quizes/:quizId(\\d+)',     sessionController.autoLogout, sessionController.loginRequired, quizController.destroy);
// Comentarios
router.get('/quizes/:quizId(\\d+)/comments/new', sessionController.autoLogout, commentController.new);
router.post('/quizes/:quizId(\\d+)/comments',    sessionController.autoLogout, commentController.create);
router.get('/quizes/:quizId(\\d+)/comments/:commentId(\\d+)/publish',    
		   								sessionController.autoLogout, sessionController.loginRequired, commentController.publish);

// Autologout:
router.get('/quizes/statistics', sessionController.autoLogout, quizController.statistics);

// Definición de rutas de cuenta
router.get('/user', 					userController.new);
router.post('/user', 					userController.create);
router.get('/user/:userId(\\d+)/edit',  sessionController.loginRequired, userController.edit);
router.put('/user/:userId(\\d+)', 		sessionController.loginRequired, userController.update);
router.delete('/user/:userId(\\d+)', 	sessionController.loginRequired, userController.destroy);


/*GET /author */
router.get('/author', function(req, res, next) {
    res.render('author', { title: 'Créditos', errors: [] });
});

module.exports = router;
