var models = require('../models/models.js');

// 
exports.favourites = function(req, res) {
	var quiz = req.quiz;
	
	res.render('quizes/favourites', {quiz: quiz, errors: []});
}