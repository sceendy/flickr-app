/* NOTE for javascript
    Browser compatibility on current release, current release-1 versions of browsers
    Page load times and performance
    Sorting and or filter options available to user
*/

// ok, declaring some static stuff that is needed and won't change
const apiKey = 'bd9987dd291178d6ec1886920d9cd7c8';
const userId = '24662369@N07';

// cool, let's use those now
window.onload = () => {
  // things that won't change
  const imageList = document.getElementById('items');
  const itemsDesc = document.getElementsByClassName('items__description')[0];
  const previousBtn = document.getElementsByClassName('pagination__btn--left')[0];
  const nextBtn = document.getElementsByClassName('pagination__btn--right')[0];
  const sortForm = document.getElementById('sortBy');
  const loadingImage = "<img src='https://33.media.tumblr.com/0ba1ba128951dff1eea53c9a35d8fe0d/tumblr_n4ux8nbU3m1sjwwzso1_500.gif' class='block--center'>";

  // setting the api url to grab photo view count to use for sorting function
  // and only requesting 15 photos per page.
  let apiUrl = 'https://api.flickr.com/services/rest/?method=flickr.people.getPublicPhotos' +
                '&api_key=' + apiKey +  '&user_id=' + userId + '&format=json&nojsoncallback=1' +
                '&extras=views&per_page=12';
  let errorMsg = loadingImage + "<p class='text--center'>Some error occurred.</p>";
  let httpRequest = new XMLHttpRequest();
  let totalPages;
  let currentPage;
  let photos;
  let sortedBy;

  // some sort of cute placeholder
  imageList.innerHTML = loadingImage;

  // event listeners
  sortForm.addEventListener('change', (e) => {
    sortBy(e.target.value);
  });

  // switched to eventListeners for Babel/Safari9
  previousBtn.addEventListener('click', () => {
    previousPage();
  });

  nextBtn.addEventListener('click', () => {
    nextPage();
  });

  // function to make the GET call to the flickr API
  let getPhotos = (page) => {
    sortForm.value = 'newest';

    if (page === 1) {
      previousBtn.style.display = 'none';
    } else {
      previousBtn.style.display = 'inline-block';
    }

    httpRequest.open('GET', apiUrl + '&page=' + page, true);

    httpRequest.onload = () => {
      if (httpRequest.status >= 200 && httpRequest.status < 400) {
        clear();
        let data = JSON.parse(httpRequest.responseText).photos;
        photos = data.photo;
        totalPages = data.pages;
        currentPage = data.page;

        itemsDesc.innerHTML = 'Page ' + currentPage + ' of ' + totalPages;

        // for every photo in the returned array,
        for (let p in photos) {
          // generate photo link (could also request flicker to send url_q value but ehh more data)
          let imageUrl = 'https://farm' + photos[p].farm + '.staticflickr.com/' + photos[p].server +
                          '/' + photos[p].id + '_' + photos[p].secret + '.jpg';
          photos[p].url = imageUrl;

          // let's send it as an argument to create a list item per photo
          createListItem(photos[p]);
        }
      } else {
        // render error message for user
        itemsDesc.innerHTML = errorMsg;
      }
    };

    httpRequest.onerror = () => {
      // render error message for user
      itemsDesc.innerHTML = errorMsg;
    };

    // let's do this
    httpRequest.send();
  };

  // initial call to flickr API, get photos from first page
  getPhotos(1);

  // for each photo from the array, a list item element is created
  let createListItem = (i) => {
    let item = document.createElement('li');
    item.classList.add('img__container');
    item.innerHTML = "<img src='" + i.url +  "' alt='" + i.title + "'/>";

    // and then, that list item is attached to
    // the unordered list to be rendered HTML file
    imageList.appendChild(item);
  };

  // use current page to determine what the next page is
  let nextPage = () => {
    // if the current page matches the numbers of pages, stop.
    if (currentPage !== totalPages) {
      getPhotos(currentPage + 1);
    } else {
      nextBtn.style.display = 'none';
    }

    window.scrollTo(0, 0);
  };

  // use current page to determine what the previous page was
  let previousPage = () => {
    if (currentPage !== 1) {
      getPhotos(currentPage - 1);
    }

    window.scrollTo(0, 0);
  };

  let byViews = (a, b) => {
    // check photo view count to compare and resort the photos
    let first = Number(a.views);
    let next = Number(b.views);

    switch (sortedBy) {
      case "mostViews":
        return ((first > next) ? -1 : ((first < next) ? 1 : 0));
        break;
      case "leastViews":
        return ((next > first) ? -1 : ((next < first) ? 1 : 0));
        break;
    }
  };

  // sorter function
  let sortBy = (arg) => {
    sortedBy = arg;

    // sort images by views
    photos.sort(byViews);

    // clear previous image order for newly sorted image order
    clear();

    // run list item creation function to render sorted results
    for (let p in photos) {
      createListItem(photos[p]);
    }
  };

  // function to clear values
  let clear = () => {
    imageList.innerHTML = '';
    itemsDesc.innerHTML = '';
  };
};
