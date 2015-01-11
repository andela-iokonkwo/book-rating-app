angular.module('bookRating.directives', []).directive('starRating', function () {
    return {
        scope: {
            rating: '=',
            average: '@',
            maxRating: '@',
            readOnly: '@',
            click: "&",
            mouseHover: "&",
            mouseLeave: "&"
        },
        restrict: 'EA',
        template:
            "<span class='badge badge-balanced' style='position:static;margin-top:10px;display:inline-block'>{{myRating}}</span> \
             <div style='margin: 0px; padding-top:10px; padding: 0px; cursor:pointer;' ng-repeat='idx in maxRatings track by $index'> \
                   <img ng-src='{{((hoverValue + _rating) <= $index) && \"img/star-empty-lg.png\" || \"img/star-fill-lg.png\"}}' \
                    ng-Click='isolatedClick($index + 1, $event)' \
                    style='height:10px;' \
                    ng-mouseenter='isolatedMouseHover($index + 1)' \
                    ng-mouseleave='isolatedMouseLeave($index + 1)'></img> \
            </div>",

        compile: function (element, attrs) {
            if (!attrs.maxRating || (Number(attrs.maxRating) <= 0)) {
                attrs.maxRating = '5';
            };
        },
        controller: function ($scope, $element, $attrs) {
            $scope.maxRatings = [];
            if ($scope.average == 'true')
                $scope.myRating = "average rating";
            else
                $scope.myRating = "rate this book";
            
            for (var i = 1; i <= $scope.maxRating; i++) {
                $scope.maxRatings.push({});
            };
                $scope._rating = 0;
            
            $scope.$watch('rating', function(val)
            {
                console.log(val);
                if (typeof val !== "undefined" && val !== null && $scope.average != 'true')
                {
                    $scope.myRating = "your rating";
                }
                if (typeof val !== "undefined" && val !== null)
                    $scope._rating = val;
            })

            $scope.isolatedClick = function (param, $event) {
                $event.stopPropagation();
                if ($scope.readOnly == 'true' || $scope.average == 'true') return;
                console.log($scope.readOnly);
                $scope.rating = $scope._rating = param;
                $scope.hoverValue = 0;
                $scope.click({
                    param: param
                });
            };

            $scope.isolatedMouseHover = function (param) {
                if ($scope.readOnly == 'true') return;

                $scope._rating = 0;
                $scope.hoverValue = param;
                $scope.mouseHover({
                    param: param
                });
            };

            $scope.isolatedMouseLeave = function (param) {
                if ($scope.readOnly == 'true') return;

                $scope._rating = $scope.rating;
                $scope.hoverValue = 0;
                $scope.mouseLeave({
                    param: param
                });
            };
        }
    };
});