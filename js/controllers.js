angular.module('bookRating.controllers', [])
    .controller('SignInCtrl', [
        '$scope', '$rootScope', '$firebaseAuth', '$window',
        function ($scope, $rootScope, $firebaseAuth, $window) {
            // check session
            $scope.user = {
                email: "",
                password: ""
            };
            $scope.validateUser = function () {
                $rootScope.show('Please wait.. Authenticating');
                var email = this.user.email;
                var password = this.user.password;
                if (!email || !password) {
                    $rootScope.notify("Please enter valid credentials");
                    return false;
                }

                $rootScope.auth.$authWithPassword({
                    email: email,
                    password: password
                }).then(function (user) {
                    $rootScope.hide();
                    $rootScope.userId = user.uid;
                    console.log(user);
                    $rootScope.checkSession();
                    $window.location.href = ('#/book/list');

                }, function (error) {
                    $rootScope.hide();
                    if (error.code == 'INVALID_EMAIL') {
                        $rootScope.notify('Invalid Email Address');
                    } else if (error.code == 'INVALID_PASSWORD') {
                        $rootScope.notify('Invalid Password');
                    } else if (error.code == 'INVALID_USER') {
                        $rootScope.notify('Invalid User');
                    } else {
                        $rootScope.notify('Oops something went wrong. Please try again later');
                    }
                });
            }
        }
    ])

.controller('SignUpCtrl', [
    '$scope', '$rootScope', '$firebaseAuth', '$window',
    function ($scope, $rootScope, $firebaseAuth, $window) {

        $scope.user = {
            email: "",
            password: ""
        };
        $scope.createUser = function () {
            var email = this.user.email;
            var password = this.user.password;
            if (!email || !password) {
                $rootScope.notify("Please enter valid credentials");
                return false;
            }
            $rootScope.show('Please wait.. Registering');

            $rootScope.auth.$createUser(email, password, function (error, user) {
                if (!error) {
                    $rootScope.hide();
                    $rootScope.userEmail = user.email;
                    $window.location.href = ('#/book/list');
                } else {
                    $rootScope.hide();
                    if (error.code == 'INVALID_EMAIL') {
                        $rootScope.notify('Invalid Email Address');
                    } else if (error.code == 'EMAIL_TAKEN') {
                        $rootScope.notify('Email Address already taken');
                    } else {
                        $rootScope.notify('Oops something went wrong. Please try again later');
                    }
                }
            });
        }
    }
])
 .controller('HomeCtrl', function ($scope, $rootScope, $ionicPopup, $timeout, $ionicSideMenuDelegate, $window, $state) {

     $rootScope.$on('logged-in', function (event, status) {
         $scope.loggedIn = status;
         console.log(status);
     });

     var checkSession = function () {
         console.log("Here");
         var auth = $rootScope.auth.$getAuth();
         if (auth) {
             console.log(auth);
             // user authenticated with Firebase
             $rootScope.userEmail = auth.email;
             $scope.loggedIn = true;
         } else {
             // user is logged out
             $scope.userEmail = null;
             $scope.loggedIn = false;
         }
     };
     $rootScope.checkSession();
     $scope.toggleLeft = function () {
         $ionicSideMenuDelegate.toggleLeft();
     };
     $scope.showPopup = function () {
         $scope.data = {}

         $ionicPopup.show({
             content: 'Hi There.<br> Would you like to Log in',
             title: 'Login Required',
             subTitle: 'create account or login',
             scope: $scope,
             buttons: [
                 { text: 'No', onTap: function (e) { return true; } },
                 {
                     text: '<b>YES</b>',
                     type: 'button-positive',
                     onTap: function (e) {
                         $state.go('book.signin');
                         return true;
                     }
                 },
             ]
         }).then(function (res) {
             console.log('Tapped!', res);
         }, function (err) {
             console.log('Err:', err);
         }, function (msg) {
             console.log('message:', msg);
         });


     };

     $scope.read = function () {
         if ($scope.loggedIn)
             $window.location.href = ('#/book/olist/have-read');
         else $scope.showPopup();
     }

     $scope.reading = function () {
         if ($scope.loggedIn)
             $window.location.href = ('#/book/olist/reading');
         else $scope.showPopup();
     }
     $scope.plantoread = function () {
         if ($scope.loggedIn)
             $window.location.href = ('#/book/olist/plan-to-read');
         else $scope.showPopup();
     }

     $scope.downloadlater = function () {
         if ($scope.loggedIn)
             $window.location.href = ('#/book/olist/download-later');
         else $scope.showPopup();
     }
     $scope.signOut = function () {
         $rootScope.auth.$unauth();
         $rootScope.checkSession();
         $rootScope.notify('You Have Successfully Logged Out.');
     }
 })
.controller('searchListCtrl', function ($rootScope, $scope, $window, $ionicModal, $firebase, $http, $ionicActionSheet, book, $stateParams) {
    $scope.TotalBooks = 0;
    var type = $stateParams.type
    $scope.Books = [];
    $scope.searchTerm = "node.js";
    var NextPage = 0;

    $scope.search = function () {
        $rootScope.show("Please wait... Searching");
        $scope.Books = [];
        NextPage = 1;
        $http.get('http://it-ebooks-api.info/v1/search/' + $scope.searchTerm + '/page/' + NextPage)
        .success(function (result) {
            $scope.TotalBooks = result.Total;
            for (var key in result.Books) {
                result.Books[key].Rating = $firebase(new Firebase($rootScope.baseUrl + '/books:' + result.Books[key].ID + '/rating/' + $rootScope.userId)).$asObject();
            }
            Array.prototype.push.apply($scope.Books, result.Books);
            $rootScope.hide();
        }).error(function (err) {
            $rootScope.notify("Error Searching");
        });
    };
    var end = false;
    $scope.fetchMore = function () {
        if (end) return;
        NextPage += 1;
        console.log(NextPage);
        $http.get('http://it-ebooks-api.info/v1/search/' + $scope.searchTerm + '/page/' + NextPage)
         .success(function (items) {
             $scope.TotalBooks = items.Total;
             if (items.Books.length) {
                 for (var key in items.Books) {
                     var r = $firebase(new Firebase($rootScope.baseUrl + '/books:' + items.Books[key].ID + '/rating/' + $rootScope.userId)).$asObject();
                     items.Books[key].Rating = r;
                 }
                 Array.prototype.push.apply($scope.Books, items.Books);
                 if (items.Books.length < 10) end = true;
             }
             else end = true;
         }).error(function (err) {
             $rootScope.notify("Failed to download list books");
             end = true;
         }).finally(function () {
             console.log("completed");
             $scope.$broadcast('scroll.infiniteScrollComplete');
             //$rootScope.$broadcast("scroll.infiniteScrollComplete");
         });
    };
    $scope.updateRating = function (bookId, newRate) {
        book.updateRating(bookId, newRate);

    };

    $scope.show = function (bookObject) {

        // Show the action sheet
        var hideSheet = $ionicActionSheet.show({
            buttons: [
              { text: 'View Book' },
              { text: 'Download Later' },
               { text: 'I am Reading' },
                { text: 'I plan to read' },
                 { text: 'I have read' }
            ],
            titleText: bookObject.Description,
            cancelText: 'Cancel',
            cancel: function () {
                // add cancel code..
            },
            buttonClicked: function (index) {
                if (index == 0)
                    $window.location.href = ('#/book/single/' + bookObject.ID);
                else if (index == 1)
                    book.downloadLater(bookObject);
                else if (index == 2)
                    book.reading(bookObject);
                else if (index == 3)
                    book.planToRead(bookObject);
                else if (index == 4)
                    book.haveRead(bookObject);
                return true;
            }
        });
    };
})
.controller('singleBookCtrl', function ($rootScope, $scope, $window, $ionicModal, $firebase, $http, $ionicActionSheet, $stateParams, book) {
    var id = $stateParams.bookId;
    $scope.book = {};
    $http.get('http://it-ebooks-api.info/v1/book/' + id)
        .success(function (result) {
            $scope.book = result
            $scope.book.Rating = $firebase(new Firebase($rootScope.baseUrl + '/books:' + result.ID + '/rating/' + $rootScope.userId)).$asObject();
            findAverage(result.ID);
        }).error(function (err) {
            $rootScope.notify("Failed to download book");
            end = true;
        }).finally(function () {
            console.log("completed");
        });
    var findAverage = function (bookId) {
        var bookRatingRef = new Firebase($rootScope.baseUrl + '/books:' + bookId + '/rating');
        bookRatingRef.on('value', function (snapshot) {
            var data = snapshot.val();
            var total = 0;
            var count = 0;
            for (var key in data) {
                if (data.hasOwnProperty(key)) {
                    total += data[key];
                    count += 1;
                }
            }
            console.log(count);
            $scope.book.AverageRating = total / count;
        });
    }

    $scope.updateRating = function (bookId, newRate) {
        book.updateRating(bookId, newRate);
    };
    $scope.DownloadLater = function (bookObject) {
        book.downloadLater(ReduceBook(bookObject));

    }
    $scope.Reading = function (bookObject) {
        book.reading(ReduceBook(bookObject));

    }
    $scope.PlanToRead = function (bookObject) {
        book.planToRead(ReduceBook(bookObject));
    }
    $scope.HaveRead = function (bookObject) {
        book.haveRead(ReduceBook(bookObject));
    }

    var ReduceBook = function (bookObject) {
        var thisBook = {};
        thisBook.ID = bookObject.ID;
        thisBook.Title = bookObject.Title;
        thisBook.Description = bookObject.Description;
        thisBook.Image = bookObject.Image;
        return thisBook;
    }
}).controller('bookListCtrl', function ($rootScope, $scope, $window, $ionicModal, $firebase, $http, $ionicActionSheet, book, $stateParams) {
    $scope.searchTerm = "node.js";
    $rootScope.show("Please wait... getting records");
    var type = $stateParams.type;
    $scope.Books = [];
    var url = $rootScope.baseUrl + $rootScope.userId;
    if (type == "download-later") {
        url += "/book:download:later";
        $scope.Title = "Books - Download Later";
    }
    if (type == "reading") {
        $scope.Title = "Books - Reading";
        url += "/book:reading";
    }
    if (type == "plan-to-read") {
        $scope.Title = "Books - I Plan to Read";
        url += "/book:plan:to:read";
    }
    if (type == "have-read") {
        $scope.Title = "Books - I Have Read";
        url += "/book:have:read";
    }
    var bookRef = new Firebase(url);
    bookRef.on('value', function (snapshot) {
        var result = snapshot.val();
        $scope.Books = [];

        for (var key in result) {
            result[key].Rating = $firebase(new Firebase($rootScope.baseUrl + '/books:' + result[key].ID + '/rating/' + $rootScope.userId)).$asObject();
            $scope.Books.push(result[key]);
        }
        //Array.prototype.push.apply($scope.Books, result);
        $rootScope.hide();
    }, function (err) {
        $rootScope.notify("Error Getting Records");
    });
    //$firebase(bookRef).$asArray().$loaded(function (result) {
    // for (var key in result) {
    //     result[key].Rating = $firebase(new Firebase($rootScope.baseUrl + '/books:' + result[key].ID + '/rating/' + $rootScope.userId)).$asObject();
    // }
    // Array.prototype.push.apply($scope.Books, result);
    // $rootScope.hide();
    //}, function (err) {
    //    $rootScope.notify("Error Getting Records");
    //});

    $scope.updateRating = function (bookId, newRate) {
        book.updateRating(bookId, newRate);

    };

    $scope.show = function (bookObject, index) {
        delete bookObject.$id;
        delete bookObject.$priority;
        // Show the action sheet
        var hideSheet = $ionicActionSheet.show({
            buttons: [
              { text: 'View Book' },
              { text: 'Download Later' },
               { text: 'I am Reading' },
                { text: 'I plan to read' },
                 { text: 'I have read' }
            ],
            titleText: bookObject.Description,
            destructiveText: "Delete",
            cancelText: 'Cancel',
            cancel: function () {
                // add cancel code..
            },
            destructiveButtonClicked: function () {
                    $rootScope.show("Please wait... Deleting from List");
                    var itemRef = new Firebase(url);
                    itemRef.child(bookObject.ID).remove(function(error) {
                        if (error) {
                            $rootScope.hide();
                            $rootScope.notify('Oops! something went wrong. Try again later');
                        } else {
                            $rootScope.hide();
                            console.log(index);
                            // $scope.Books.splice(index, 1);
                            $rootScope.notify('Successfully deleted');
                        }
                    });
                    return true;
            },
            buttonClicked: function (index) {
                if (index == 0)
                    $window.location.href = ('#/book/single/' + bookObject.ID);
                else if (index == 1)
                    book.downloadLater(bookObject);
                else if (index == 2)
                    book.reading(bookObject);
                else if (index == 3)
                    book.planToRead(bookObject);
                else if (index == 4)
                    book.haveRead(bookObject);
                return true;
            }
        });
    };
})
