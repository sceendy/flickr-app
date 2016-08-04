'use strict';

// ok, declaring some static stuff that is needed and won't change
var apiKey = 'bd9987dd291178d6ec1886920d9cd7c8';
var userId = '24662369@N07';

// cool, let's use those now
window.onload = function () {
  var imageList = document.getElementById('items');
  var itemsDesc = document.getElementsByClassName('items__description')[0];
  var previousBtn = document.getElementsByClassName('pagination__btn--left')[0];
  var nextBtn = document.getElementsByClassName('pagination__btn--right')[0];
  var sortForm = document.getElementById('sortBy');
  var loadingImage = "<img src='https://33.media.tumblr.com/0ba1ba128951dff1eea53c9a35d8fe0d/tumblr_n4ux8nbU3m1sjwwzso1_500.gif' class='block--center'>";

  var currentPage = 1;

  // some sort of cute placeholder
  imageList.innerHTML = loadingImage;

  // setting the api url to grab photo view count to use for sorting function
  var apiUrl = 'https://api.flickr.com/services/rest/?method=flickr.people.getPublicPhotos&api_key=' + apiKey + '&user_id=' + userId + '&format=json&nojsoncallback=1&extras=views&per_page=12';

  // reusable error message function
  var errorMsg = function errorMsg(e) {
    clear();
    return loadingImage + ' <p class=\'text--center\'>ERROR: ' + e + '</p>';
  };

  var totalPages = void 0;
  var photos = void 0;
  var sortedBy = void 0;
  var nextPageResults = void 0;

  // event listeners
  sortForm.addEventListener('change', function (e) {
    sortBy(e.target.value);
  });

  // function to make the GET call to the flickr API
  var getPhotos = function getPhotos(p) {
    sortForm.value = 'newest';
    previousBtn.style.display = '';

    if (p === 1) {
      previousBtn.style.display = 'none';
    }

    return fetch(apiUrl + '&page=' + p).then(function (response) {
      var _response = response.json();
      imageList.style.minHeight = '435px';
      clear();
      return _response;
    });
  };

  var renderImages = function renderImages(_images) {
    photos = _images.photo;
    currentPage = _images.page;
    itemsDesc.innerHTML = 'Page ' + currentPage + ' of ' + totalPages;

    mobileScroll();
    // for every photo in the returned array,
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = photos[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var photo = _step.value;

        // generate photo link (could also request flicker to send url_q value but ehh more data)
        var imageUrl = 'https://farm' + photo.farm + '.staticflickr.com/' + photo.server + '/' + photo.id + '_' + photo.secret + '.jpg';
        photo.url = imageUrl;

        // let's send it as an argument to create a list item per photo
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
    item.innerHTML = '<img src="' + i.url + '" alt="' + i.title + '"/>';

    // and then, that list item is attached to
    // the unordered list to be rendered HTML file
    imageList.appendChild(item);
  };

  var byViews = function byViews(a, b) {
    // check photo view count to compare and resort the photos
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
    photos.sort(byViews);

    // clear previous image order for newly sorted image order
    clear();

    // run list item creation function to render sorted results
    for (var p in photos) {
      createListItem(photos[p]);
    }

    sortedBy = arg;
  };

  // function to clear values
  var clear = function clear() {
    imageList.style.minHeight = 0;
    imageList.innerHTML = '';
  };

  var mobileScroll = function mobileScroll() {
    if (window.innerWidth < 720) {
      window.scrollTo(0, 0);
    }
  };

  // initial call to flickr API, get photos from first page
  function getResults(page) {
    imageList.innerHTML = loadingImage;
    return getPhotos(page).then(function (data) {
      photos = data;
      totalPages = data.photos.pages;
      renderImages(data.photos);
    }).then(function () {
      nextPageResults = function nextPageResults(next) {
        return getPhotos(next);
      };
    }).catch(function (e) {
      itemsDesc.innerHTML = errorMsg(e.toString());
    });
  };

  getResults(currentPage);

  // use current page to determine next/previous pages
  previousBtn.addEventListener('click', function () {
    if (currentPage !== 1) {
      nextPageResults(currentPage - 1).then(function (previous) {
        clear();
        return renderImages(previous.photos);
      });
    }
  });

  nextBtn.addEventListener('click', function () {
    if (currentPage !== totalPages) {
      nextPageResults(currentPage + 1).then(function (next) {
        clear();
        return renderImages(next.photos);
      });
    } else {
      nextBtn.style.display = 'none';
    }
  });
};