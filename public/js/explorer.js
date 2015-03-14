var app = angular.module('explorerApp', ['akoenig.deckgrid']);



app.controller('explorerCtrl', ['$scope', '$http', function ($scope, $http) {
	var socket = io.connect();
	var NUM_COL = 12;

	$scope.downloadCart = [];
	$scope.isGettingAllPics = true;
	angular.element(document).ready(function () {
		if (!window.location.origin) {
			window.location.origin = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ':' + window.location.port : '');
		}
		$http({
			url: window.location.origin + "/allPictures",
			method: "GET",
			async: false,
			params: {
				_category: "normal"
			}
		}).success(function (data, status, headers, config) {
			//			console.log('data', data);
			console.log("data.length", data.length);
			$scope.isGettingAllPics = false;
			$scope.rows = data.chunk(NUM_COL);
		});
		$scope.$apply();
	});


	$scope.foo = function () {
		$('.materialboxed').materialbox();
	}
	$scope.getPicturesFromDB = function () {
		var _download_cart = JSON.stringify($scope.downloadCart);
		if ($scope.downloadCart.length != 0) {
			//$('#dlRequestedPicsModal').openModal();
			console.log("my ajax param : ", _download_cart);
			$http({
				url: window.location.origin + "/userRequestedPictures",
				method: "GET",
				params: {
					download_cart: _download_cart
				}
			}).
			success(function (data, status, headers, config) {
				//				console.log('data', data);
				//$('#dlRequestedPicsModal').closeModal();
				location.href = data;
			});
		}
		// TODO Handle when no item is selected
	};

	Array.prototype.chunk = function (chunkSize) {
		var R = [];
		for (var i = 0; i < this.length; i += chunkSize)
			R.push(this.slice(i, i + chunkSize));
		return R;
	};

	$scope.addToDownloadCart = function addToDownloadCart(pictureID) {
		var idx = $scope.downloadCart.indexOf(pictureID);

		// is currently selected
		if (idx > -1) {
			$scope.downloadCart.splice(idx, 1);
		}

		// is newly selected
		else {
			$scope.downloadCart.push(pictureID);
		}
	};


}]);