(function () {
'use strict';

// ###########   Application declaration   ###########
// ###################################################

angular.module('NarrowItDownApp', [])
.controller('NarrowItDownController', NarrowItDownController)
.service('MenuSearchService', MenuSearchService)
.directive('itemsLoaderIndicator', ItemsLoaderIndicator)
.directive('foundItems', FoundItems);

// ###########   Injectors   ###########
// #####################################

NarrowItDownController.$inject = ['MenuSearchService'];
MenuSearchService.$inject = ['$q', '$http'];

// ###########   Directives   ###########
// ######################################

function ItemsLoaderIndicator() {
  var ddo = {
    templateUrl: 'loader/itemsloaderindicator.template.html'
  };

  return ddo;
}

function FoundItems() {
  var ddo = {
    templateUrl: 'foundItems.html',
    scope: {
      items: '<',
      onRemove: '&'
    },
    controller: FoundItemsDirectiveController,
    controllerAs: 'fivm',
    bindToController: true
  };

  return ddo;
}

// ###########   Controllers   ###########
// #######################################

function NarrowItDownController (MenuSearchService) {
  var nvm           = this;
  nvm.found         = [];
  nvm.loading       = false;
  nvm.firstSearch   = true;
  nvm.searchTerm    = "";

  // Public method
  nvm.search        = search;
  nvm.removeItem    = removeItem;

  // Private declarations

  function search() {
    nvm.firstSearch   = false;
    if (nvm.searchTerm.trim().length > 0)
    {
      nvm.loading = true;
      MenuSearchService.getMatchedMenuItems(nvm.searchTerm).then(
        function(items) {
          nvm.loading = false;
          nvm.found = items;
        },
        function(error) {
          nvm.loading = false;
          console.log("Something was wrong!");
        }
      );
    }
    else
    {
      nvm.found = [];
    }
  }

  function removeItem(itemIndex) {
    nvm.found.splice(itemIndex, 1);
  } 

}

function FoundItemsDirectiveController() {
  var fivm = this;

  fivm.nothingFound         = nothingFound;
  fivm.nothingFoundMessage  = "Nothing found";

  function nothingFound()
  {
    return (fivm.items.length == 0);
  }
}

// ###########   Services   ###########
// ####################################

function MenuSearchService($q, $http) {
  var service = this;

  // Public declarations
  service.getMatchedMenuItems = getMatchedMenuItems;

  // Methods

  function getMatchedMenuItems(searchTerm) {
    var deferred = $q.defer();
    $http({
      method:  'GET',
      url:     'https://davids-restaurant.herokuapp.com/menu_items.json'
    }).then(function successCallback(data) {
      if (!data.config) {
        console.log('Server error occured.');
      }
      deferred.resolve(matchItems(data.data.menu_items, searchTerm));
    }, function errorCallback(error) {
      deferred.reject(error);
    });

    return deferred.promise;
  }

  function matchItems(items, searchTerm) {
    var found = [];
    for (var i = 0; i < items.length; i++)
    {
      if (items[i].name.toLowerCase().indexOf(searchTerm.trim().toLowerCase()) > -1) {
        found.push(items[i]);
      }
    }
    return found;
  }

}


})();
