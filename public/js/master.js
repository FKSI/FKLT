var app = angular.module('masterApp', []);

app.controller('masterCtrl', ['$scope', function ($scope) {
	var socket = io.connect();
	var MSG_TYPE = {
		0: "image",
		1: "medias",
		2: "text"
	};
	var MSG_CAT = {
		0: "normal",
		1: "photoHunt"
	};

	var NB_MSG = 4;

	$scope.normalMessages = [];
	$scope.photoHuntMessages = [];
	$scope.normalMsg = {
		_category: '',
		_type: '',
		_txtContent: '',
		_imgContent: '',
		_nickName: '',
		_isImg: false,
		_isEmpty: true,
		_imgOrientation : ''
	};

	$scope.photoHuntMsg = {
		_category: '',
		_type: '',
		_txtContent: '',
		_imgContent: '',
		_nickName: '',
		_isImg: false,
		_isEmpty: true,
		_imgOrientation : ''
	};


	function displayMsgBuilder(data, msgCategoryObject, output) {
		msgCategoryObject._nickName = data.nick;
		switch (data.type) {
		case MSG_TYPE[0]:
			if (msgCategoryObject._txtContent != '') {
				msgCategoryObject._txtContent = '';
			}
			msgCategoryObject._imgContent = data.imgContent;
			msgCategoryObject._isImg = true;
			break;
		case MSG_TYPE[1]:
			msgCategoryObject._txtContent = data.txtContent;
			msgCategoryObject._imgContent = data.imgContent;
			msgCategoryObject._isImg = true;
			console.log("imgO", data)
			break;
		case MSG_TYPE[2]:
			if (msgCategoryObject._imgContent != '') {
				msgCategoryObject._imgContent = '';
				msgCategoryObject._isImg = false;
			}
			msgCategoryObject._txtContent = data.txtContent;
			break;
		}
		msgCategoryObject._isEmpty = false;

		if (output.length == NB_MSG) {
			output.shift();
		}
		output.push(msgCategoryObject);
	}

	socket.on('message', function (data) {
		if (data.category == MSG_CAT[0]) {
			var clonedNormalMsg = jQuery.extend(true, {}, $scope.normalMsg)
			clonedNormalMsg._category = data.category;
			displayMsgBuilder(data, clonedNormalMsg, $scope.normalMessages);
			Materialize.fadeInImage('#normalMsgCol');
		} else if (data.category == MSG_CAT[1]) {
			var clonedPhotoHuntMsg = jQuery.extend(true, {}, $scope.photoHuntMsg)
			clonedPhotoHuntMsg._category = data.category;
			displayMsgBuilder(data, clonedPhotoHuntMsg, $scope.photoHuntMessages);
			Materialize.fadeInImage('#photoHuntMsgCol');
		}
		$scope.$apply();
	});

}]);