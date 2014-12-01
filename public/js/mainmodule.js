/**
 * New node file
 */

var Foober = angular.module('Foober',['ngRoute']);
var siteUrl = 'http://localhost:3000';
//var siteUrl = 'http://104.131.178.87';

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

//Controller for index page, sets the display name to user
Foober.controller('pageController', function($scope, $location, $http){
	$scope.displayName = 'User';
	
	//get user data to populate displayName header, otherwise route to login
	$http.get(siteUrl + '/api/account')
	.success(function(data) {
		data = data.replace(/\"/g, "");
		$scope.displayName = data;
	})
	.error(function(err){
		$location.path('/login');
	});
	
	
	//navigate back to index partial if 'Foober' is clicked
	$scope.index = function(){
    	$location.path('/');
    };
});

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
	$http.get(siteUrl + '/api/order')
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
    	var addressString = newOrder.address + " " + newOrder.city + " " + newOrder.country;
    	
    	var d = new Date();
    	d = d.getTime();
    	newOrder.status.statusNo = 2;
    	newOrder.status.time = String(d);
    	
    	geocoder = new google.maps.Geocoder();
    	geocoder.geocode( { 'address': addressString}, function(results, status) {
    	    if (status == google.maps.GeocoderStatus.OK) {
    	    	newOrder.addressGeo.lat = results[0].geometry.location.lat();
    	    	newOrder.addressGeo.lng = results[0].geometry.location.lng();
    	    	
    	    	$http({
        		    url: siteUrl+'/api/order',
        		    method: 'Put',
        		    data: newOrder,
        		    dataType: 'JSON'
    	    	}).success(function(data) {
    	    		$scope.order = newOrder;
    	    	})
    	    	.error(function(err){
    	    		$location.path('/login');
    	    	});
    	    	
    	    } else {
    	      alert('Your address was not accepted: Please check fields for accuracy. Reason:' + status);
    	    }
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
    	cancelledOrder.details = "";
    	cancelledOrder.addressGeo.lat = 0;
    	cancelledOrder.addressGeo.lng = 0;
    	
    	
    	$http({
		    url: siteUrl + '/api/order',
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
  
    //TODO: update page with current order data on interval
    
});

//Controller for finding orders
Foober.controller('findController', function($scope, $location, $http) {
	
	//navigate to placeOrder page if selected
    $scope.placeOrder = function(){
    	$location.path('/placeorder');
    };
    
    $scope.takeOrder = function(index){
    	
    	var order = $scope.ordersToTake[index];
    	alert(order._id);
    	
    	$http({
		    url: siteUrl + '/api/takeorder',
		    method: 'Put',
		    data: {_id : order._id},
		    dataType: 'JSON'
    	}).success(function(data) {
    		$scope.loadMap();
    	})
    	.error(function(err){
    		$location.path('/login');
    	});
    };

    //initialize orderRadius value
	$scope.orderRadius = 1000;
	
	//load the map on radius submit
	$scope.loadMap = function(){
		//order to take array for selecting orders
		$scope.ordersToTake = [];
		
		//map loading initalization
		var siberia = new google.maps.LatLng(60, 105);
		var initialLocation = new google.maps.LatLng(30,50);
		var browserSupportFlag =  new Boolean();
		
		var mapOptions = {
			center: siberia,
			zoom: 14
		};
			
		var map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
		
		// Try W3C Geolocation (Preferred)
		if(navigator.geolocation) {
			browserSupportFlag = true;
			navigator.geolocation.getCurrentPosition(function(position) {
				
//Map Generation ==========================================================================
				
				//get user location and center the map on it
				initialLocation = new google.maps.LatLng(position.coords.latitude,position.coords.longitude);
				map.setCenter(initialLocation);
				
				//place marker of user's location
				//TODO: uncomment when distinct marker is prepared
				/*marker = new google.maps.Marker({
					draggable:false,
					map: map,
					title: "You!",
					animation: google.maps.Animation.DROP,
					position: initialLocation
				});			
				marker.setMap(map);*/
				
				//get the current radius size and limit it to 10km if necessary
				$scope.orderRadius = parseInt($scope.orderRadius);
				if($scope.orderRadius > 5000)
					$scope.orderRadius = 5000;
				
				//draw the "order bubble" given the user's input
			    var circleOptions = {
			    	strokeColor: '#0000FF',
			        strokeOpacity: 0.8,
			        strokeWeight: 2,
			        map: map,
			        fillColor: '#0000FF',
			        fillOpacity: 0.35,
			        center: initialLocation,
			    	radius: $scope.orderRadius
			    };
			    
			    var orderCircle = new google.maps.Circle(circleOptions);
			   
			    //get list of available orders
			    $http.get(siteUrl + '/api/findorder')
			    .success(function(data) {
			    	
			    	$scope.openOrders = data;
			    	
			    	var bounds = orderCircle.getBounds();
			    	var infowindow = new google.maps.InfoWindow();
			    	var marker;
			    	var displayNum = 0;
			    	
			    	for (i = 0; i < $scope.openOrders.length; i++) { 
			    		
			    		//place coordinates of returned orders
			    		//TODO: alter this when api returns less data
			    		var orderLat = $scope.openOrders[i].order.addressGeo.lat; 
			    		var orderLng = $scope.openOrders[i].order.addressGeo.lng;
			    		var orderPosition = new google.maps.LatLng(orderLat, orderLng); 		
			    		
			    		if(bounds.contains(orderPosition)){ 
			    			
			    			marker = new google.maps.Marker({
								draggable:false,
								map: map,
								title: "Order " + displayNum,
								animation: google.maps.Animation.DROP,
								position: orderPosition
							});			
			    			//TODO: Blegh
							marker.setMap(map);
							displayNum++;
							
							//content of each order's info window
				    		var contentString = '<div id="content">'+
				    	      '<div id="siteNotice">'+
				    	      '</div>'+
				    	      '<h1 id="firstHeading" class="firstHeading">Order '+i+'</h1>'+
				    	      '<div id="bodyContent">'+
				    	      '<p> Restaurant: ' + $scope.openOrders[i].order.restaurant + '</p>' +
				    	      '<p> Order: ' + $scope.openOrders[i].order.orderItems + '</p>' +
				    	      '<p> Pay: ' + $scope.openOrders[i].order.pay + '</p>' +
				    	      '<p> Address: ' + $scope.openOrders[i].order.address + '</p>' +
				    	      '<p> Additional Details: ' + $scope.openOrders[i].order.details + '</p>' +
				    	      '</div>'+
				    	      '</div>';
							
							google.maps.event.addListener(marker, 'click', function() {
								   infowindow.open(map,marker);
								   infowindow.setContent(contentString);
							});
							
							$scope.ordersToTake.push($scope.openOrders[i]);
							
			    		}		    		
			    	}
			    })
			    .error(function(err){
			    	$location.path('/login');
			    });
				
				
			//in case of error	
			}, function() {
				handleNoGeolocation(browserSupportFlag);
			});
		}
		// Browser doesn't support Geolocation
		else {
			  browserSupportFlag = false;
			  handleNoGeolocation(browserSupportFlag);
		}

		function handleNoGeolocation(errorFlag) {
			if (errorFlag == true) {
				alert("Geolocation service failed. We're placing you in Siberia");
				initialLocation = siberia;
			} else {
				alert("Your browser doesn't support geolocation. We've placed you in Siberia.");
				initialLocation = siberia;
			}
		    
			//place the map in Siberia
			map.setCenter(initialLocation);
			marker = new google.maps.Marker({
				draggable:false,
				title: "You!",
				animation: google.maps.Animation.DROP,
				position: initialLocation
			});
			
			marker.setMap(map);
		};
	};
    
// End Map generation =======================================================================================
});