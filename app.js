var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var session = require('express-session');
GLOBAL.passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;

var routes = require('./routes/index');
var api = require('./routes/api');
var app = express();

//DB setup
mongoose.connect("mongodb://normaluse:pencil1@ds053380.mongolab.com:53380/foober", function(err) {
	if (err) {
		   console.log(err);
		} else {
		   console.log('Connected to the Users DB');
		}
});

var usersSchema = mongoose.Schema({
	 username: String,
	 facebook_id: String,
	 order: {
		 orderItems : String,
		 restaurant : String,
		 pay : { type: Number, min: 0 },
		 address : String,
		 details : String,
		 status : {
     		statusNo :  { type: Number, min: 1, max: 3 },
    		time : String
    	 }
	 }
});

User = mongoose.model('User', usersSchema, 'User');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({ secret: 'somewhereovertherainbow' })); // session secret
app.use(passport.initialize());
app.use(passport.session());


//Facebook passport setup
passport.use(new FacebookStrategy({
	  clientID: "292198040988523",
	  clientSecret: "b8cd20a265a3cfcf25a399cbd71c8e6d",
	  callbackURL: "http://localhost:3000/api/auth/facebook/callback"
	},

	function(accessToken, refreshToken, profile, done) {
		console.log('Now Check User');
		User.findOne({
	        facebook_id: profile.id
	    }, function(err, doc) {
	        if (err) {
	        	console.log(err);
	            console.log('theres a mistake!');
	            return done(err);
	        }
	        if (!doc) {
	            var user = new User({
	                username: profile.displayName,
	                facebook_id: profile.id,
	                order: {
	                	orderItems : "",
	                	restaurant : "",
	                	pay : 0,
	                	address : "",
	                	details : "",
	                	status : {
	                		statusNo : 1,
	                		time : ""
	                	}
	        	 }
	            });
	            user.save(function(err) {
	                if (err) {
	                    console.log(err);
	                } else {
	                    console.log('Saved');
	                }
	                return done(err, user);
	            });
	        } else {
	            //found user. Return
	            console.log('user is alredy registered!');
	            return done(err, doc);
	        }
	    });
	}
));

//make db accessible to requests
app.use(function(req,res,next){
    req.db = User;
    next();
});

app.use('/', routes);
app.use('/api', api);







//user serialization
passport.serializeUser(function(user, done) {
	done(null, user);
});

passport.deserializeUser(function(obj, done) {
	done(null, obj);
});









// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
