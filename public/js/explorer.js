var app = angular.module('explorerApp', []);



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


	$scope.initMaterialBoxed = function () {
		$('.materialboxed').materialbox();
	}


	$scope.getPicturesFromDB = function () {
		var _download_cart = JSON.stringify($scope.downloadCart);
		if ($scope.downloadCart.length != 0) {
			console.log("my ajax param : ", _download_cart);
			$http({
				url: window.location.origin + "/userRequestedPictures",
				method: "GET",
				params: {
					download_cart: _download_cart
				}
			}).
			success(function (data, status, headers, config) {
				console.log('data', data);
				//$('#dlRequestedPicsModal').openModal();
				//$('#dlRequestedPicsModal').closeModal();
				//location.href = data.replace("public/", "");
				window.open(
					data.replace("public/", ""),
					'_blank' // <- This is what makes it open in a new window.
				);
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

	$scope.addToDownloadCart = function addToDownloadCart(pictureID,pictureCAT) {
		var idx = $scope.downloadCart.indexOf(pictureID);
		var picToDownload = {"ID":"","CAT":""};
		// is currently selected
		if (idx > -1) {
			$scope.downloadCart.splice(idx, 1);
		}

		// is newly selected
		else {
			picToDownload.ID = pictureID;
			picToDownload.CAT = pictureCAT;
			$scope.downloadCart.push(picToDownload);
		}
	};


}]);