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
		
		user.order = req.body;
		
		user.save(function(err){
			if(err){
				return res.send(err);
			}
			
			res.json({message : "Order Updated"});
		});
	});
});

//TODO: limit returned orders based on req location
//TODO: make it so whole user is not returned, and just order instead (currently _id is used as orderid)
/* GET get the data for orders that are currently up*/
router.get('/findorder', ensureAuthenticated, function(req, res){
	
	var User = req.db;
	User.find({'order.status.statusNo' : 2 }, function(err, orders){ 
		
		if(err){
			console.log(err);
			return res.send(err);
		}
		res.json(orders);
	});
});

/*PUT new order status for someone else's order */
router.put('/takeorder', ensureAuthenticated, function(req, res){
	console.log("in take order");
	console.log(req.body);
	console.log(req.body._id);
	
	var User = req.db;
	User.findOne({_id: req.body._id }, function(err, user){
		if(err){
			return res.send(err);
		}
		
		user.order.status.statusNo = 3;
		var d = new Date;
		d = d.getTime();
		user.order.status.time = String(d);
		
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
