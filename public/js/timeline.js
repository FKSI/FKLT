var app = angular.module('timelineApp', []);


app.controller('timelineCtrl', ['$scope', '$http', function ($scope, $http) {

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
			console.log("data.length", data.length);
			$scope.catNormalData = data;
			console.log("catNormalData", $scope.catNormalData);
			$scope.$apply();
			$(function () {
				$().timelinr({
					arrowKeys: 'true'
				})
			});
		});
	});

}]);