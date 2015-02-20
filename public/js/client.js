var app = angular.module('clientApp', ['ngCookies']);

app.controller('clientCtrl', ['$scope','$filter','$cookieStore', function ($scope,$filter,$cookieStore) {
	/********** Variables init **********/
	var socket = io.connect();
	var _msg = {
		_type: '',
		_txtContent: '',
		_imgContent: ''
	}
	var MSG_TYPE = {
		0: "image",
		1: "medias",
		2: "text"
	}
	$scope.user = {
		login: ''
	}
	$scope.isLogin = true;
	$scope.isLoadImageFinish = false;
	$scope.msg = {
		_type: '',
		_txtContent: '',
		_imgContent: ''
	}
	$scope.msg._txtContent = '';
	$scope.previewImage = '';
	
	if($cookieStore.get('cookedNickname') != ''){
		$scope.user.login = $cookieStore.get('cookedNickname');
	}else{
		$scope.user.login = '';
	}
	
	
	/**
	*
	* Save the uploaded image to an AngularJS scope variable
	* Load the uploaded image as a source of the preview image DOM element
	* Update the UI accordingly
	*
	**/
	function previewFile() {
		if (window.File && window.FileReader && window.FileList && window.Blob) {
			// Get the img DOM element
			var preview = document.getElementById("imgPreview");
			// Get the input[type=file] DOM element
			var file = document.getElementById("filesToUpload").files[0];
			var reader = new FileReader();

			reader.onloadend = function () {
				$('#imgPreview').show();
				// Set the image preview source to the upload image
				preview.src = reader.result;
				// Save the uploaded image to an AngularJS scope variable
				$scope.previewImage = reader.result;
				// Notify AngularJS scope that an image is ready to be send
				$scope.isLoadImageFinish = true;
				$scope.$apply();
			}
			if (file) {
				reader.readAsDataURL(file);
			} else {
				preview.src = "";
			}
		} else {
			//TOOD Display in the UI and prevent image upload
			alert('The File APIs are not fully supported in this browser.');
		}
	};

	$("#filesToUpload").on("change", previewFile);


	/**
	*
	* Handle the login form
	*
	**/
	$scope.validateLoginForm = function () {
		var nick = $scope.user.login;
		if (nick != undefined && nick != '') {
			$cookieStore.put('cookedNickname', nick);
			socket.emit('choose nickname', $filter('uppercase')($scope.user.login), function (err) {
				if (err) {
					//TODO Display in the UI
					console.log("Login error %O", err);
					$scope.isLogin = true;
				} else {
					console.log("Login success");
					$scope.isLogin = false;
				}
				$scope.$digest();
			});

		}
	}
	
	/**
	*
	* Wrapper to hide ugly input[type=file] native button
	*
	**/
	$scope.uploadFile = function () {
		$('#filesToUpload').click();
	}
	
	
	/**
	*
	* Handle the message sending process
	* At the end sends the correct defined object
	* 
	* Set the type of the message according to the content
	*
	**/
	$scope.sendMessage = function () {
		var txtContent = '';
		var imgContent = '';
		txtContent = $scope.msg._txtContent;
		imgContent = $scope.previewImage;

		var temp = jQuery.extend(true, {}, _msg);

		if (txtContent == "" && (imgContent != undefined || imgContent != "")) {
			// Image only type message
			temp._type = MSG_TYPE[0];
			temp._imgContent = imgContent;
		} else if (txtContent != "" && (imgContent == undefined || imgContent == "")) {
			// Text only type message
			temp._type = MSG_TYPE[2];
			temp._txtContent = txtContent;
		} else {
			// Image & text type message
			temp._type = MSG_TYPE[1];
			temp._txtContent = txtContent;
			temp._imgContent = imgContent;
		}
		
		// Send the message
		socket.emit('message', temp);

		// Clear the form
		$('#imgPreview').hide();
		$scope.msg._txtContent = '';
		$scope.previewImage = '';
		$('#foo').val('');

	}

}]);