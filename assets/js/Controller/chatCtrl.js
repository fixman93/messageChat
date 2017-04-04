var application = angular.module('application', ['ngRoute']);

application.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
      when('/home', {
        templateUrl: 'templates/message.html',
      }).
      when('/login', {
        templateUrl: 'templates/login.html',
      }).
      when('/register', {
        templateUrl: 'templates/register.html',
      }).

      
      
      otherwise({
        redirectTo: '/home/'
      });
      }]);
application.controller('chatCtrl', function($scope, $location) {
    $scope.checkUser = function() {
	    if(localStorage.getItem("username") == undefined || localStorage.getItem("password") == undefined || localStorage.getItem("username") == null || localStorage.getItem("password") == null)
	    {
	       $location.path('/login');
	    }
    }
    $scope.logout = function()
	{   
	    localStorage.removeItem("username");
	    localStorage.removeItem("password");
	   	$location.path('/login');
	}
  $scope.fulluser = [];

var conn = null;


$scope.onConnectionStatusRegister = function(nStatus)
{   
    console.log($scope.fulluser.user);
    if(nStatus == Strophe.Status.ERROR)
    {
        alert("Unknown error occured");
    }
    else if(nStatus == Strophe.Status.REGISTER)
    {

        conn.register.fields.username = $scope.fulluser.user;
        conn.register.fields.password = $scope.fulluser.pass;
        conn.register.submit();
    }
    else if(nStatus == Strophe.Status.REGISTERED)
    {
        alert("Registration is successful");    
    }
    else if(nStatus == Strophe.Status.REGIFAIL)
    {
        alert("Registration failed. Please try again later");
    }
    else if(nStatus == Strophe.Status.CONFLICT)
    {
        alert("Try some other username and password");
    }
    else if(nStatus == Strophe.Status.NOTACCEPTABLE)
    {
        alert("Try some other username and password");
    }
    
}

$scope.register = function ()
{
    if($scope.fulluser.user == "" || $scope.fulluser.pass == "")
    {
        alert("Please enter both username and password");
        return;
    }
    
    conn = new Strophe.Connection("http://localhost:5280/http-bind");
    conn.register.connect("localhost", $scope.onConnectionStatusRegister, 60, 1);
}




var conn = null;

$scope.onConnectionStatus = function(nStatus)
{
    if(nStatus == Strophe.Status.ERROR)
    {
        alert("An error occured");
    }
    else if(nStatus == Strophe.Status.CONNECTED)
    {
        localStorage.setItem("username", $scope.fulluser.user);
        localStorage.setItem("password", $scope.fulluser.pass);
        
        window.location = "index.html#/home";
    }
    else if(nStatus == Strophe.Status.AUTHFAIL)
    {
        alert("Username and password is wrong");
    }
}

$scope.login = function ()
{
    if($scope.fulluser.user == "" || $scope.fulluser.pass == "")
    {
        alert("Please enter both username and password");
        
        return;
    }
    
    conn = new Strophe.Connection("http://localhost:5280/http-bind");
    conn.connect($scope.fulluser.user + "@localhost", $scope.fulluser.pass, $scope.onConnectionStatus);
    
}

$scope.checkUser();
});