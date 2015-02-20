var app = angular.module('masterApp', []);

app.controller('masterCtrl', ['$scope', function($scope){
	var socket = io.connect();
	var MSG_TYPE = {0:"image", 1:"medias", 2:"text"};
	$scope.msg = {
		_type: '',
		_txtContent: '',
		_imgContent: '',
		_nickName:''
	};
	$scope.displayNormalMsg = false;
	$scope.displayNormalImg = false;

	
	function displayMsg(data){
		$scope.msg._nickName = data.nick;
		switch(data.type){
			case MSG_TYPE[0]:
				$scope.msg._imgContent = data.imgContent;
				console.log($scope.msg._imgContent)
				$scope.displayNormalImg = true;
				break;
			case MSG_TYPE[1]:
						
				$scope.msg._txtContent = data.txtContent;
				$scope.msg._imgContent = data.imgContent;
				console.log($scope.msg._imgContent)
				$scope.displayNormalImg = true;
				break;
			case MSG_TYPE[2]:
				$scope.msg._txtContent = data.txtContent;
				break;
		}
    }
	
	
	socket.on('message', function(data){
    	displayMsg(data);
		$scope.displayNormalMsg = true;
		$scope.$digest();
    });

}]);

