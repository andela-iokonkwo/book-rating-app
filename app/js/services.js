angular.module('bookRating.services', [])
.factory('book', ['$http', '$rootScope', '$firebase', function ($http, $rootScope, $firebase) {
    var ExecuteAction = function (index, book) {

        var url = $rootScope.baseUrl + $rootScope.userId;
        if (index == 1)
            url += "/book:download:later/" + book.ID;
        if (index == 2)
            url += "/book:reading/" + book.ID;
        if (index == 3)
            url += "/book:plan:to:read/" + book.ID;
        if (index == 4)
            url += "/book:have:read/" + book.ID;
        delete book.Rating;
        delete book.$$hashKey;
      
        console.log(book);
        var bookRef = new Firebase(url);
        bookRef.update(book, function (error) {
            if (error) {
                $rootScope.hide();
                $rootScope.notify('Oops! something went wrong. Try again later');
            } else {
                $rootScope.hide();
                $rootScope.notify('Successfully updated');
            }
        });
    }

    var _updateRating = function (bookId, newRate) {
        console.log(bookId + ' ' + newRate);

        $rootScope.show("Please wait... Updating List");
        var itemRef = new Firebase($rootScope.baseUrl + '/books:' + bookId + '/rating');
        var bookRate = {};
        bookRate[$rootScope.userId] = newRate;
        console.log(bookRate);
        itemRef.update(bookRate, function (error) {
            if (error) {
                $rootScope.hide();
                $rootScope.notify('Oops! something went wrong. Try again later');
            } else {
                $rootScope.hide();
                $rootScope.notify('Successfully updated');
            }
        });
    };
    return {
        updateRating: function (bookId, newRate) {
            _updateRating(bookId, newRate);
        },
        downloadLater: function (book) {
            ExecuteAction(1, book);
        },
        reading: function (book) {
            ExecuteAction(2, book);
        },
        planToRead: function (book) {
            ExecuteAction(3, book);
        },
        haveRead: function (book) {
            ExecuteAction(4, book);
        }
    }
}]);