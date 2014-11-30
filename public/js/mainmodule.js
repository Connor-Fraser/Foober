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
Foober.controller('placeController', function($scope, $location, $http) {
    
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
		data = data.replace(/\"/g, "")//('"', '');//( '"', '', data);
		$scope.displayName = data;
	})
	.error(function(err){
		$location.path('/login');
	});
});
