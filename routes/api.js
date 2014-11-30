/**
 * New node file
 */

var express  = require('express');
var router = express.Router();

//API calls ================================================

/*Get username at login */
router.get('/account', ensureAuthenticated, function(req, res){
	var User = req.db;
	User.findOne({_id: req.user._id }, function(err, user){
		if(err){
			return res.send(err);
		}
		
		res.json(user.username);
	});
});

/*GET your own order's data*/
router.get('/order', ensureAuthenticated, function(req, res){
	var User = req.db;
	User.findOne({_id: req.user._id }, function(err, user){
		if(err){
			return res.send(err);
		}
		
		res.json(user.order);
	});
});

/* PUT for Update/Delete/Create a new order. */
router.put('/order', ensureAuthenticated, function(req, res){
	var User = req.db;
	User.findOne({_id: req.user._id }, function(err, user){
		if(err){
			return res.send(err);
		}
		
		user.order = params.order;
		
		user.save(function(err){
			if(err){
				return res.send(err);
			}
			
			res.json({message : "Order Updated"});
		});
	});
});


/* GET get the data for orders with a certain criteria*/
router.get('/findorder/:data', ensureAuthenticated, function(req, res){
	//incorporate criteria for limiting returned amount
	var User = req.db;
	User.find(function(err, orders){
		if(err){
			return res.send(err);
		}
		
		res.json(orders);
	});
});

/*PUT new order status for someone else's order */
router.put('/findorder/:id', ensureAuthenticated, function(req, res){
	var User = req.db;
	User.findOne({_id: req.params.id }, function(err, user){
		if(err){
			return res.send(err);
		}
		
		user.order.status = "taken";
		user.order.timeTaken = "" + new Date.getTime();
		
		user.save(function(err){
			if(err){
				return res.send(err);
			}
			
			res.json({message : "Order Taken"});
		});
	});
});


// Authentication =========================================================

//Redirect the user to Facebook for authentication.  When complete,
//Facebook will redirect the user back to the application at
///auth/facebook/callback
router.get('/auth/facebook', passport.authenticate('facebook'));

//Facebook will redirect the user to this URL after approval.  Finish the
//authentication process by attempting to obtain an access token.  If
//access was granted, the user will be logged in.  Otherwise,
//authentication has failed.
router.get('/auth/facebook/callback', 
passport.authenticate('facebook', { successRedirect: '/',
                                 failureRedirect: '#/login' }));


//ensure user authenticated, and send them to login otherwise
function ensureAuthenticated(req, res, next) {
	if (req.isAuthenticated()) { return next(); }
		res.redirect('#/login'); //TODO: possibly
}


module.exports = router;
