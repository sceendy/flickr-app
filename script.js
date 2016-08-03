/* NOTE for javascript
    Page load times and performance
    Sorting and or filter options available to user
*/

// ok, declaring some static stuff that is needed and won't change
const apiKey = 'bd9987dd291178d6ec1886920d9cd7c8';
const userId = '24662369@N07';

// cool, let's use it now
window.onload = () => {
  const imageList = document.getElementById('items');
  const previousBtn = document.getElementsByClassName('pagination__btn--left')[0];
  const nextBtn = document.getElementsByClassName('pagination__btn--right')[0];
  const itemsDesc = document.getElementsByClassName('items__description')[0];

  let loadingImage = "<img src='https://33.media.tumblr.com/0ba1ba128951dff1eea53c9a35d8fe0d/tumblr_n4ux8nbU3m1sjwwzso1_500.gif'>";
  let apiUrl = 'https://api.flickr.com/services/rest/?method=flickr.people.getPublicPhotos' +
                '&api_key=' + apiKey +  '&user_id=' + userId + '&format=json&nojsoncallback=1' +
                '&extras=views%2C+url_q&per_page=15';
  let errorMsg = loadingImage + "<p class='text--center'>Some error occurred.</p>";
  let httpRequest = new XMLHttpRequest();
  let totalPages;
  let currentPage;
  let photos;
  let sortedBy;

  // some sort of cute placeholder
  imageList.innerHTML = loadingImage;

  // function to make the GET call to the flickr API
  getPhotos = (page) => {
    if (page === 1) {
      previousBtn.style.display = 'none';
    } else {
      previousBtn.style.display = 'inline-block';
    }

    httpRequest.open('GET', apiUrl + '&page=' + page, true);

    httpRequest.onload = () => {
      if (httpRequest.status >= 200 && httpRequest.status < 400) {
        clear();
        data = JSON.parse(httpRequest.responseText).photos;
        photos = data.photo;
        totalPages = data.pages;
        currentPage = data.page;

        // for every photo in the returned array,
        for (let p in photos) {
          // let's send it as an argument to create a list item per photo
          createListItem(photos[p]);
        }

      } else {
        // render error message for user
        itemsDesc.innerHTML = errroMsg;
      }
    };

    httpRequest.onerror = () => {
      // render error message for user
      itemsDesc.innerHTML = errroMsg;
    };

    httpRequest.send();
  };

  // initial call to flickr API
  getPhotos(1);

  // for each photo from the array, a list item element is created
  createListItem = (i) => {
    let item = document.createElement('li');
    item.innerHTML = "<img src='" + i.url_q +  "' alt='" + i.title + "'/>";

    // and then, that list item is attached to
    // the unordered list to be rendered HTML file
    imageList.appendChild(item);
  };

  // use current page to determine what the next page is
  nextPage = () => {
    // if the current page matches the numbers of pages, stop.
    if (currentPage !== totalPages) {
      getPhotos(currentPage + 1);
    } else {
      nextBtn.style.display = 'none';
    }
  };

  // use current page to determine what the previous page was
  previousPage = () => {
    if (currentPage !== 1) {
      getPhotos(currentPage - 1);
    }
  };

  byViews = (a, b) => {
    let first = Number(a.views);
    let next = Number(b.views);
    if (sortedBy == 'mostViews') {
      return ((first > next) ? -1 : ((first < next) ? 1 : 0));
    } else {
      return ((next > first) ? -1 : ((next < first) ? 1 : 0));
    }
  };

  document.getElementById('sortBy').addEventListener('change', (e) => {
    sortBy(e.target.value);
  });

  // sorter method
  sortBy = (arg) => {
    sortedBy = arg;

    // sort images by most views
    photos.sort(byViews);

    // then clear imageList for sorted results
    clear();

    // run list item creation method to render sorted results
    for (let p in photos) {
      createListItem(photos[p]);
    }
  };

  clear = () => {
    imageList.innerHTML = '';
    itemsDesc.innerHTML = '';
  };
};
