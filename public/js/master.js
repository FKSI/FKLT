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

	$scope.normalMsg = {
		_category: '',
		_type: '',
		_txtContent: '',
		_imgContent: '',
		_nickName: '',
		_isImg: false,
		_isEmpty: true
	};

	$scope.photoHuntMsg = {
		_category: '',
		_type: '',
		_txtContent: '',
		_imgContent: '',
		_nickName: '',
		_isImg: false,
		_isEmpty: true
	};

	function displayMsg(data, msgCategoryObject) {
		msgCategoryObject._nickName = data.nick;
		switch (data.type) {
		case MSG_TYPE[0]:
			msgCategoryObject._imgContent = data.imgContent;
			msgCategoryObject._isImg = true;
			break;
		case MSG_TYPE[1]:
			msgCategoryObject._txtContent = data.txtContent;
			msgCategoryObject._imgContent = data.imgContent;
			msgCategoryObject._isImg = true;
			break;
		case MSG_TYPE[2]:
			if (msgCategoryObject._imgContent != '') {
				msgCategoryObject._imgContent = ''
				msgCategoryObject._isImg = false;
			}
			msgCategoryObject._txtContent = data.txtContent;
			break;
		}
		msgCategoryObject._isEmpty = false;
		$scope.$digest();
	}

	socket.on('message', function (data) {
		if (data.category == MSG_CAT[0]) {
			displayMsg(data, $scope.normalMsg);
		} else if (data.category == MSG_CAT[1]) {
			displayMsg(data, $scope.photoHuntMsg);
		}
	});

}]);