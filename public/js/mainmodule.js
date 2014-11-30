/**
 * New node file
 */

var Foober = angular.module('Foober',['ngRoute']);

// configure our routes					
Foober.config(function($routeProvider)  {
	$routeProvider

	//index page
	.when('/', {
	    templateUrl : 'partials/indexPartial.html',
	    controller  : 'mainController'
	})
	
	//login page
	.when('/login', {
	    templateUrl : '/partials/login.html',
	    controller  : 'loginController'
	})
	
	// route for user's own order
	.when('/placeorder', {
	    templateUrl : './partials/placeorder.html',
	    controller  : 'placeController'
	})
	
	// route for taking an order
	.when('/findorder', {
	    templateUrl : '../partials/findorder.html',
	    controller  : 'findController'
	})
	
	.otherwise({redirectTo: '/'});
    
    //$locationProvider.html5Mode(true);
});

// Controllers ==================================================================

// Controller for index partial view
Foober.controller('mainController', function($scope, $location) {
    
    //route to other views if selected
    $scope.findOrder = function(){
    	$location.path('/findorder');
    };
    
    $scope.placeOrder = function(){
    	$location.path('/placeorder');
    };
});

// Controller for login view
Foober.controller('loginController', function($scope) {

});

// Controller for user's order
Foober.controller('placeController', function($scope, $location, $http, $interval) {
	
	//get your order information, go to login if not authenticated
	$http.get("http://localhost:3000/api/order")
    .success(function(data) {
    	$scope.order = data;
    })
    .error(function(err){
    	$location.path('/login');
    });
	
	//switch to findOrder view if chosen
    $scope.findOrder = function(){
    	$location.path('/findorder');
    };
    
    //submit an order
    $scope.submitOrder = function(){
    	var newOrder = $scope.order;
    	
    	var d = new Date();
    	d = d.getTime();
    	newOrder.status.statusNo = 3;
    	newOrder.status.time = String(d);

    	$http({
    		    url: 'http://localhost:3000/api/order',
    		    method: 'Put',
    		    data: newOrder,
    		    dataType: 'JSON'
    	}).success(function(data) {
        	$scope.order = newOrder;
        })
        .error(function(err){
        	$location.path('/login');
        });
    };
    
    //remove the current order
    $scope.cancelOrder = function(){
    	var cancelledOrder = $scope.order;
    	cancelledOrder.status.statusNo = 1;
    	cancelledOrder.status.time = "";
    	cancelledOrder.orderItems = "";
    	cancelledOrder.restaurant = "";
    	cancelledOrder.pay = "";
    	cancelledOrder.address = "";
    	cancelledOrder.details = "";
    	
    	$http({
		    url: 'http://localhost:3000/api/order',
		    method: 'Put',
		    data: cancelledOrder,
		    dataType: 'JSON'
    	}).success(function(data) {
    		$scope.order = cancelledOrder;
    	})
    	.error(function(err){
    		$location.path('/login');
    	});
    };
   
    
    //time elapsed function
    $interval(function(){
    	var now = new Date();
    	var orderTime = new Date(parseInt($scope.order.status.time));
    	var diff = Math.floor((now - orderTime)/1000);
    	
    	var limit;
    	if($scope.order.status.statusNo == 2)
    		limit = 1;
    	else 
    		limit = 2;
    	
        var hours   = Math.floor(diff / 3600);
        var minutes = Math.floor((diff - (hours * 3600)) / 60);
        var seconds = diff - (hours * 3600) - (minutes * 60);
    	
        hours = limit - 1 - hours;
        minutes = 59 - minutes;
        seconds = 59 - seconds;
        
        var elapsed = hours + ":" + minutes + ":" + seconds;
    	
        if(hours<=0 && minutes <= 0 && seconds <= 0){
        	$scope.cancelOrder(); //if timer goes to 0, cancel order TODO: have server handle this
        }
        
    	$scope.timeSince = elapsed;
    }, 1000); //repeat every second for up to date counter
    
});

//Controller for finding orders
Foober.controller('findController', function($scope, $location, $http) {
    $scope.message = 'Look! I am find order page.';
    
    $scope.placeOrder = function(){
    	$location.path('/placeorder');
    };
});

//Controller for index page, sets the display name to user
Foober.controller('pageController', function($scope, $location, $http){
	$scope.displayName = 'User';
	
	//get user data to populate displayName header, otherwise route to login
	$http.get("http://localhost:3000/api/account")
	.success(function(data) {
		data = data.replace(/\"/g, "");
		$scope.displayName = data;
	})
	.error(function(err){
		$location.path('/login');
	});
});
