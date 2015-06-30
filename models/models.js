var path = require('path');

// Postgres DATABASE_URL = postgres://user:pass@host:port:database
// SQLite   DATABASE_URL = sqlite://:@:/
var url = process.env.DATABASE_URL.match(/(.*)\:\/\/(.*?)\:(.*)@(.*)\:(.*)\/(.*)/);
var DB_name  = (url[6] || null);
var user     = (url[2] || null);
var pwd      = (url[3] || null);
var protocol = (url[1] || null);
var dialect  = (url[1] || null);
var port     = (url[5] || null);
var host     = (url[4] || null);
var storage  = process.env.DATABASE_STORAGE;

// Cargar modelo ORM 
var Sequelize = require('sequelize');

// Usar BBDD SQLite 
var sequelize = new Sequelize(DB_name, user, pwd,
            {dialect:  protocol,
			 protocol: protocol,
			 port:     port,
			 host:     host,
			 storage:  storage, // solo SQLite (.env)
			 omitNull: true		// Solo postgres
			}
);

// Importar la definición de la tabla Quiz
var quiz_path = path.join(__dirname, 'quiz');
var Quiz = sequelize.import(quiz_path);

// Importar definición de la tabla comment

var comment_path = path.join(__dirname, 'comment');
var Comment = sequelize.import(comment_path);

// Importar definición de tabla user
var user_path = path.join(__dirname, 'user');
var User = sequelize.import(user_path);

//Relación quizes-comments
Comment.belongsTo(Quiz);
Quiz.hasMany(Comment);

// Relación quizes-user
Quiz.belongsTo(User);
User.hasMany(Quiz);

//Tabla favoritos
User.belongsToMany(Quiz, {through: 'Favourites'});
Quiz.belongsToMany(User, {through: 'Favourites'});

exports.Quiz = Quiz; // exporta tabla quiz

exports.Comment = Comment;
exports.User = User;

// sequelize.sync() crea e inicializa tabla de preguntas en DB
sequelize.sync().then(function () {
    // then(..) ejecuta el manejador una vez creada la tabla
    User.count().then(function (count) {
        if (count === 0) {
			User.bulkCreate(
			[{username: 'admin', password: '1234', isAdmin: true},
			{username: 'andrax', password:'andrax'}
			]).then(function() {
				console.log('Base de datos (tabla user) inicializada');
				Quiz.count().then(function (count) {
					if (count === 0) {
					Quiz.bulkCreate([
				{ pregunta: 'Capital de Italia', respuesta: 'Roma', UserId: 1, categoria: 'Humanidades'},
			    { pregunta: 'Capital de Portugal', respuesta: 'Lisboa', UserId: 2, categoria: 'Humanidades'}
			]
						   ).then(function () {console.log('Base de datos (tabla Quiz) inicializada')});
						};
				});
			});
        };
    });
});