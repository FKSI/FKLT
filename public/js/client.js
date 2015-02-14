var app = angular.module('StarterApp', []);

app.controller('AppCtrl', ['$scope', function($scope){
	/********** Variables init **********/
	var socket = io.connect();
	var _msg = { _type:'', _txtContent:'', _imgContent:'' }
	var MSG_TYPE = {0:"image", 1:"medias", 2:"text"}
	$scope.user = {login:''}
	$scope.isLogin = true;
	$scope.isLoadImageFinish = false;
	$scope.msg = { _type:'', _txtContent:'', _imgContent:'' }
	$scope.msg._txtContent = '';
	$scope.previewImage ='';
	
	resetInputFile();
	
	/********** Native JS functions **********/
	function resetInputFile(){
		/*document.getElementById("sendMessageForm").reset();*/
	}
	
	function previewFile () {
		if (window.File && window.FileReader && window.FileList && window.Blob) {
			var preview = document.getElementById("imgPreview");
			var file    = document.getElementById("filesToUpload").files[0];
			var reader  = new FileReader();

			reader.onloadend = function () {
				$('#imgPreview').show();
				preview.src = reader.result;
				$scope.previewImage = reader.result;
				$scope.isLoadImageFinish = true;
				$scope.$apply();
			}
			if (file) {
				reader.readAsDataURL(file);
			} else {
				preview.src = "";
			}
		}else{
			alert('The File APIs are not fully supported in this browser.');
		}
	};
	
	$("#filesToUpload").on("change",previewFile);
	
	
	
	$scope.validateLoginForm = function(){
		var nick = $scope.user.login;
		console.log("nick ", nick);	
		if(nick != undefined && nick != ''){
			console.log("nick ", nick);	
			socket.emit('choose nickname', nick, function(err){
				if (err) {
					//TODO Display in the UI
					console.log("Login error %O", err);
					$scope.isLogin = true;
				} else {
					console.log("login success");
					$scope.isLogin = false;
				}
				$scope.$digest();
			});
			
		}
	}
	
	/********** AngularJS functions **********/
	$scope.uploadFile = function(){
		$('#filesToUpload').click();
	}
	
	$scope.sendMessage = function(){
		var txtContent = '';
		var imgContent ='';
		txtContent = $scope.msg._txtContent;
		imgContent = $scope.previewImage;		

		var temp = jQuery.extend(true, {}, _msg); 
		
		if(txtContent == "" && (imgContent != undefined || imgContent != "")){
			temp._type = MSG_TYPE[0];
			temp._imgContent = imgContent;
		}else if(txtContent != "" && (imgContent == undefined || imgContent == "")){
			temp._type = MSG_TYPE[2];
			temp._txtContent = txtContent;
		}else{
			temp._type = MSG_TYPE[1];
			temp._txtContent = txtContent;
			temp._imgContent = imgContent;
		}
		
		console.log("Emitting temp %O", temp);
		socket.emit('message', temp);
		
		$('#imgPreview').hide();
		console.log('ezf',$scope.msg._txtContent);
		$scope.msg._txtContent = '';
		$scope.previewImage ='';
		$('#foo').val('');
		resetInputFile();
		
	}
	
	/********** socket.io listenners **********/
/*    socket.on('message', function(data){
		console.log("data back from server", data);
//    	displayMsg(data)
    });

    socket.on('load old msgs', function(docs){
    	for (var i = docs.length-1; i >= 0; i--) {
    		displayMsg(docs[i]);
    	}
    });
	
	socket.on('names', function(users) {
		displayUsers(users);
	});

	socket.on('new user', function(user) {
		displayUsers([user]);
	});
	
	socket.on('user disconnect', function(id){
		console.log(id);
		$('#user'+id).remove();
	});*/

 
}]);
