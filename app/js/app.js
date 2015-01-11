angular.module('bookRating', ['ionic', 'firebase', 'bookRating.controllers', 'bookRating.directives', 'bookRating.services'])

.run(function ($ionicPlatform, $rootScope, $firebaseAuth, $firebase, $window, $ionicLoading) {
    $ionicPlatform.ready(function () {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        if (window.cordova && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        }
        if (window.StatusBar) {
            StatusBar.styleDefault();
        }
    });
    $rootScope.userEmail = null;
    $rootScope.baseUrl = 'https://it-books-rating.firebaseio.com/';
    var authRef = new Firebase($rootScope.baseUrl);
    $rootScope.auth = $firebaseAuth(authRef);

    $rootScope.show = function (text) {
        $rootScope.loading = $ionicLoading.show({
            content: text ? text : 'Loading..',
            animation: 'fade-in',
            showBackdrop: true,
            maxWidth: 200,
            showDelay: 0
        });
    };

    $rootScope.hide = function () {
        $ionicLoading.hide();
    };

    $rootScope.notify = function (text) {
        $rootScope.show(text);
        $window.setTimeout(function () {
            $rootScope.hide();
        }, 1999);
    };

    $rootScope.logout = function () {
        $rootScope.auth.$unauth();
        $rootScope.checkSession();
    };
    /* var auth = $rootScope.auth.$getAuth();
        if(auth){
             $rootScope.loggedIn = true;
            $rootScope.userEmail = auth.email;
         }else $rootScope.loggedIn = false;
    $rootScope.auth.$onAuth(function(auth) {
      if(auth){
             $rootScope.loggedIn = true;
         }else $rootScope.loggedIn = false;
    });*/
    $rootScope.checkSession = function () {
        console.log("Here");
        var auth = $rootScope.auth.$getAuth();
        if (auth) {
            console.log(auth);
            // user authenticated with Firebase
            $rootScope.userEmail = auth.email;
            $rootScope.userId = auth.uid;
            $rootScope.$broadcast('logged-in', true);
        } else {
            // user is logged out
            $rootScope.userEmail = null;
            $rootScope.userId = null;
            $rootScope.$broadcast('logged-in', false);
        }
    };

})

.config(function ($stateProvider, $urlRouterProvider) {
    $stateProvider
        .state('book', {
            url: "/book",
            abstract: true,
            templateUrl: "home-menu.html",
            controller: 'HomeCtrl'

        })
     .state('book.signin', {
         url: '/signin',
         views: {
             'menuContent': {
                 templateUrl: 'sign-in.html',
                 controller: 'SignInCtrl'
             }
         }
     })
        .state('book.signup', {
            url: '/signup',
            views: {
                'menuContent': {
                    templateUrl: 'sign-up.html',
                    controller: 'SignUpCtrl'
                }
            }
        })
        .state('book.list', {
            url: '/list',
            views: {
                'menuContent': {
                    templateUrl: 'search-list.html',
                    controller: 'searchListCtrl'
                }
            }
        })
         .state('book.Olist', {
             url: '/olist/:type',
             views: {
                 'menuContent': {
                     templateUrl: 'book-list.html',
                     controller: 'bookListCtrl'
                 }
             }
         })
     .state('book.single', {
         url: '/single/:bookId',
         views: {
             'menuContent': {
                 templateUrl: 'single-book.html',
                 controller: 'singleBookCtrl'
             }
         }
     });
    $urlRouterProvider.otherwise('/book/list');
});