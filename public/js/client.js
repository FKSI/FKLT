var app = angular.module('clientApp', ['ngCookies']);

app.controller('clientCtrl', ['$scope', '$filter', '$cookieStore', function ($scope, $filter, $cookieStore) {
	/********** Variables init **********/
	var socket = io.connect();
	var _msg = {
		_category: '',
		_type: '',
		_txtContent: '',
		_imgContent: '',
		_imgOrientation: ''
	};
	var MSG_TYPE = {
		0: "image",
		1: "medias",
		2: "text"
	};
	var MSG_CAT = {
		0: "normal",
		1: "photoHunt"
	};
	$scope.user = {
		login: ''
	}
	$scope.isLogin = true;
	$scope.isLoadImageFinish = false;
	$scope.msg = {
		_category: '',
		_type: '',
		_txtContent: '',
		_imgContent: '',
		_imgOrientation: ''
	}
	$scope.msg._txtContent = '';
	$scope.previewImage = '';
	$scope.isPH = false;

	if ($cookieStore.get('cookedNickname') != '') {
		$scope.user.login = $cookieStore.get('cookedNickname');
	}

	var _previewContainer = $("#previewContainer");
	/**
	 *
	 * Save the uploaded image to an AngularJS scope variable
	 * Load the uploaded image as a source of the preview image DOM element
	 * Update the UI accordingly
	 *
	 **/
	/*
			function previewFile() {
				if (window.File && window.FileReader && window.FileList && window.Blob) {
					// Get the img DOM element
					var preview = document.getElementById("imgPreview");
					// Get the input[type=file] DOM element
					var file = document.getElementById("filesToUpload").files[0];
					var reader = new FileReader();

					reader.onloadend = function () {
						$('#imgPreview').show();
						console.debug("LO>SLD2");
						// Set the image preview source to the upload image
						preview.src = reader.result;
						// Save the uploaded image to an AngularJS scope variable
						$scope.previewImage = reader.result;
						// Notify AngularJS scope that an image is ready to be send
						$scope.isLoadImageFinish = true;
						$scope.$apply();
					}
					if (file) {
						var d = reader.readAsDataURL(file);
						window.URL.revokeObjectURL(d);
					} else {
						preview.src = "";
					}
				} else {
					//TODO Display in the UI and prevent image upload
					alert('The File APIs are not fully supported in this browser.');
				}
			};
	*/

	//	$("#filesToUpload").on("change", previewFile);

	document.getElementById('filesToUpload').onchange = function (e) {
		
		_previewContainer.empty();
		var file = e.target.files[0];

		var reader = new FileReader();

		reader.onloadend = function () {
			$scope.previewImage = reader.result;
		}
		reader.readAsDataURL(file);
		loadImage.parseMetaData(file, function (data) {
			var options = {
				maxWidth: 120,
				maxHeight: 160,
				canvas: true
			}
			if (data.exif) {
				options.orientation = data.exif.get('Orientation');
				$scope.msg._imgOrientation = data.exif.get('Orientation');
				thumb = data.exif.get('Thumbnail');
				loadImage(
					thumb,
					function (img) {
						_previewContainer.append(img);
					}, options
				);
			} else {
				$scope.msg._imgOrientation = '';
				loadImage(
					file,
					function (img) {
						_previewContainer.append(img);
					}, options
				);
			}
			$scope.isLoadImageFinish = true;
			$scope.$apply();

		});
	};


	/**
	 *
	 * Handle the login form
	 *
	 **/
	$scope.validateLoginForm = function () {
		var nick = $filter('uppercase')($scope.user.login);
		if (nick != undefined && nick != '') {
			$cookieStore.put('cookedNickname', nick);
			socket.emit('choose nickname', nick, function (err) {
				if (err) {
					toast('<span class=red-text>Ce pseudo est déjà pris :(</span>', 2000);
					$scope.isLogin = true;
				} else {
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

		// Clone _msg structure to a temporary variable
		var temp = jQuery.extend(true, {}, _msg);

		if (!$scope.isPH) {
			temp._category = MSG_CAT[0];
		} else {
			temp._category = MSG_CAT[1];
		}
		if (txtContent == "" && (imgContent != undefined || imgContent != "")) {
			// Image only type message
			temp._type = MSG_TYPE[0];
			temp._imgContent = imgContent;
			temp._imgOrientation = $scope.msg._imgOrientation;
		} else if (txtContent != "" && (imgContent == undefined || imgContent == "")) {
			// Text only type message
			temp._type = MSG_TYPE[2];
			temp._txtContent = txtContent;
		} else {
			// Image & text type message
			temp._type = MSG_TYPE[1];
			temp._txtContent = txtContent;
			temp._imgContent = imgContent;
			temp._imgOrientation = $scope.msg._imgOrientation;
		}

		// Send the message
		socket.emit('message', temp, function (cb) {
			console.log("cb : ", cb);
			if (cb) {
				toast('Message envoyé !<a class="btn-flat blue-text" href="#">OK<a>', 2000);
			} else {
				toast('Oups, ça n\'a pas fonctionné !<a class="btn-flat blue-text" href="#">OK<a>', 2000);
			}
		});

		// Clear the form
		_previewContainer.empty();
		$scope.msg._txtContent = '';
		$scope.previewImage = '';
		$scope.isLoadImageFinish = false;

	}

}]);