'use strict';

/* NOTE for javascript
    Browser compatibility on current release, current release-1 versions of browsers
    Page load times and performance
    Sorting and or filter options available to user
*/

// ok, declaring some static stuff that is needed and won't change
var apiKey = 'bd9987dd291178d6ec1886920d9cd7c8';
var userId = '24662369@N07';

// cool, let's use those now
window.onload = function () {
  // things that won't change
  var imageList = document.getElementById('items');
  var itemsDesc = document.getElementsByClassName('items__description')[0];
  var previousBtn = document.getElementsByClassName('pagination__btn--left')[0];
  var nextBtn = document.getElementsByClassName('pagination__btn--right')[0];
  var sortForm = document.getElementById('sortBy');
  var loadingImage = "<img src='https://33.media.tumblr.com/0ba1ba128951dff1eea53c9a35d8fe0d/tumblr_n4ux8nbU3m1sjwwzso1_500.gif' class='block--center'>";

  // setting the api url to grab photo view count to use for sorting function
  // and only requesting 15 photos per page.
  var apiUrl = 'https://api.flickr.com/services/rest/?method=flickr.people.getPublicPhotos' + '&api_key=' + apiKey + '&user_id=' + userId + '&format=json&nojsoncallback=1' + '&extras=views&per_page=12';
  var errorMsg = function errorMsg(e) {
    return loadingImage + "<p class='text--center'>ERROR: " + e + " </p>";
  };
  var totalPages = void 0;
  var currentPage = void 0;
  var photos = void 0;
  var sortedBy = void 0;

  // some sort of cute placeholder
  imageList.innerHTML = loadingImage;

  // event listeners
  sortForm.addEventListener('change', function (e) {
    sortBy(e.target.value);
  });

  previousBtn.addEventListener('click', function () {
    previousPage();
  });

  nextBtn.addEventListener('click', function () {
    nextPage();
  });

  // function to make the GET call to the flickr API
  var getPhotos = function getPhotos(page) {
    sortForm.value = 'newest';
    previousBtn.style.display = page === 1 ? 'none' : 'inline-block';

    return new Promise(function (resolve, reject) {
      var httpRequest = new XMLHttpRequest();
      httpRequest.open('GET', apiUrl + '&page=' + page, true);
      imageList.innerHTML = loadingImage;

      httpRequest.onload = function () {
        if (httpRequest.status >= 200 && httpRequest.status < 400) {
          clear();
          totalPages = JSON.parse(httpRequest.response).photos.pages;
          resolve(httpRequest.response);
        }
      };

      httpRequest.onerror = function () {
        itemsDesc.innerHTML = errorMsg('http request error');
      };

      // let's do this
      httpRequest.send();
    });
  };

  // initial call to flickr API, get photos from first page
  getPhotos(1).then(function (photosData) {
    renderImages(photosData.photos);
  }).catch(function () {
    itemsDesc.innerHTML = errorMsg('get photos error');
  });

  var renderImages = function renderImages(_images) {
    photos = _images.photo;
    currentPage = _images.page;

    itemsDesc.innerHTML = 'Page ' + currentPage + ' of ' + totalPages;

    // for every photo in the returned array,
    for (var p in photos) {
      // generate photo link (could also request flicker to send url_q value but ehh more data)
      var imageUrl = 'https://farm' + _images[p].farm + '.staticflickr.com/' + _images[p].server + '/' + _images[p].id + '_' + _images[p].secret + '.jpg';
      _images[p].url = imageUrl;

      // let's send it as an argument to create a list item per photo
      createListItem(_images[p]);
    }
  };

  // for each photo from the array, a list item element is created
  var createListItem = function createListItem(i) {
    var item = document.createElement('li');
    item.classList.add('img__container');
    item.innerHTML = "<img src='" + i.url + "' alt='" + i.title + "'/>";

    // and then, that list item is attached to
    // the unordered list to be rendered HTML file
    imageList.appendChild(item);
  };

  // use current page to determine what the next page is
  var nextPage = function nextPage() {
    // if the current page matches the numbers of pages, stop.
    if (currentPage !== totalPages) {
      getPhotos(currentPage + 1);
    } else {
      nextBtn.style.display = 'none';
    }

    if (window.innerWidth < 720) {
      window.scrollTo(0, 0);
    }
  };

  // use current page to determine what the previous page was
  var previousPage = function previousPage() {
    if (currentPage !== 1) {
      getPhotos(currentPage - 1);
    }
    if (window.innerWidth < 720) {
      window.scrollTo(0, 0);
    }
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
    sortedBy = arg;

    photos.sort(byViews);

    // clear previous image order for newly sorted image order
    clear();

    // run list item creation function to render sorted results
    for (var p in photos) {
      createListItem(photos[p]);
    }
  };

  // function to clear values
  var clear = function clear() {
    imageList.innerHTML = '';
    itemsDesc.innerHTML = '';
  };
};