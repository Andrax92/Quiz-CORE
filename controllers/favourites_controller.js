var models = require('../models/models.js');

// get favourites
exports.index = function(req, res, next){

    var favs = [];
    models.User.find({
        where: { id: Number(req.user.id)},
        include: [{ model: models.Quiz }]
    }).then(
        function(user){
            user.getQuizzes().then(function(quizes){
                for(var i = 0; i<quizes.length; i++){
                    favs.push(true);
                }
                res.render('quizes', {quizes: quizes, errors: [], favs: favs});
            });
        }
    ).catch(function(error){next(error);});
    
};

// put favourites
exports.add = function(req, res, next){
    
     models.User.find({
        where: { id: Number(req.user.id)},
        include: [{ model: models.Quiz }]
    }).then(
        function(user){
            user.addQuiz(req.params.quizId).then(function(){
                redirect(true);
            });
        }
    ).catch(function(error){next(error);});
    
    function redirect(test){
        if(test){
            res.redirect(req.session.redir); 
        }
    };
    
};

// delete 
exports.remove = function(req, res, next){
    
     models.User.find({
        where: { id: Number(req.user.id)},
        include: [{ model: models.Quiz }]
    }).then(
        function(user){
            user.removeQuiz(req.params.quizId).then(function(){
                res.redirect(req.session.redir);
            });
        }
    ).catch(function(error){next(error);});
    
};

function findMyFavs(req, res, user, quizes){
    
};