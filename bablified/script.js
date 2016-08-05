'use strict';

// ok, declaring some static stuff that is needed and won't change
var apiKey = 'bd9987dd291178d6ec1886920d9cd7c8';
var userId = '24662369@N07';

// cool, let's use those now
window.onload = function () {
  var imageList = document.getElementById('items');
  var toggle = document.getElementById('toggleBtn');
  var snackBar = document.getElementsByClassName('snackbar__text')[0];
  var itemsDesc = document.getElementsByClassName('items__description')[0];
  var sortForm = document.getElementById('sortBy');

  var currentPage = 1;
  var paused = false;
  toggle.innerHTML = 'stop';

  // setting the api url to grab photo view count to use for sorting function
  var apiUrl = 'https://api.flickr.com/services/rest/?method=flickr.people.getPublicPhotos&api_key=' + apiKey + '&user_id=' + userId + '&format=json&nojsoncallback=1&extras=views&per_page=16';

  // reusable error message function
  var errorMsg = function errorMsg(e) {
    return '<p class=\'text--center\'>ERROR: ' + e + '</p>';
  };

  var totalPages = void 0;
  var photos = void 0;
  var allPhotos = [];
  var sortedBy = void 0;

  // event listeners
  sortForm.addEventListener('change', function (e) {
    sortBy(e.target.value);
  });

  toggle.addEventListener('click', function (e) {
    paused = !paused;
    toggle.innerHTML = paused ? 'continue' : 'stop';
  });

  // function to make the GET call to the flickr API
  var getPhotos = function getPhotos(p) {
    sortForm.value = '';

    return fetch(apiUrl + '&page=' + p).then(function (response) {
      var _response = response.json();
      imageList.style.minHeight = '435px';
      return _response;
    });
  };

  var renderImages = function renderImages(_images) {
    photos = _images.photo;

    snackBar.innerHTML = 'Showing ' + currentPage + ' of ' + totalPages + ' pages';

    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = photos[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var photo = _step.value;

        var imageUrl = 'https://farm' + photo.farm + '.staticflickr.com/' + photo.server + '/' + photo.id + '_' + photo.secret + '.jpg';
        photo.url = imageUrl;
        allPhotos.push(photo);
        // send it as an argument to create a list item per photo
        createListItem(photo);
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator.return) {
          _iterator.return();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }
  };

  // for each photo from the array, a list item element is created
  var createListItem = function createListItem(i) {
    var item = document.createElement('li');
    item.classList.add('img__container');
    item.innerHTML = '<img src="' + i.url + '" alt="' + i.title + '" title="' + i.title + '"/><span>' + i.views + '</span>';

    // attach each item to the list to be rendered HTML file
    imageList.appendChild(item);
  };

  var byViews = function byViews(a, b) {
    // view count
    var first = Number(a.views);
    var next = Number(b.views);

    switch (sortedBy) {
      case "mostViews":
        return first > next ? -1 : first < next ? 1 : 0;
        break;
      case "leastViews":
        return next > first ? -1 : next < first ? 1 : 0;
        break;
    }
  };

  // sort images by views
  var sortBy = function sortBy(arg) {
    sortedBy = arg;
    allPhotos.sort(byViews);
    imageList.innerHTML = "<img src='https://go.proofpilot.it/images/spinner.gif'/>";

    // run list item creation function to render sorted results
    window.setTimeout(function () {
      imageList.innerHTML = '';
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = allPhotos[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var p = _step2.value;
          createListItem(p);
        }
      } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion2 && _iterator2.return) {
            _iterator2.return();
          }
        } finally {
          if (_didIteratorError2) {
            throw _iteratorError2;
          }
        }
      }
    }, 200);
  };

  // initial call to flickr API, get photos from first page
  function getResults(page) {
    currentPage = page;
    return getPhotos(page).then(function (data) {
      totalPages = data.photos.pages;
      renderImages(data.photos);
    }).catch(function (e) {
      itemsDesc.innerHTML = errorMsg(e.toString());
    });
  };

  // initial load
  getResults(currentPage);

  // load more when user scrolled to the bottom
  window.addEventListener('scroll', function (e) {
    if ((!paused && window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
      return getResults(currentPage + 1);
    }
  });
};