// ok, declaring some static stuff that is needed and won't change
const apiKey = 'bd9987dd291178d6ec1886920d9cd7c8';
const userId = '24662369@N07';

// cool, let's use those now
window.onload = () => {
  const imageList = document.getElementById('items');
  const itemsDesc = document.getElementsByClassName('items__description')[0];
  const previousBtn = document.getElementsByClassName('pagination__btn--left')[0];
  const nextBtn = document.getElementsByClassName('pagination__btn--right')[0];
  const sortForm = document.getElementById('sortBy');
  const loadingImage = "<img src='https://33.media.tumblr.com/0ba1ba128951dff1eea53c9a35d8fe0d/tumblr_n4ux8nbU3m1sjwwzso1_500.gif' class='block--center'>";

  let currentPage = 1;

  // some sort of cute placeholder
  imageList.innerHTML = loadingImage;

  // setting the api url to grab photo view count to use for sorting function
  const apiUrl = `https://api.flickr.com/services/rest/?method=flickr.people.getPublicPhotos&api_key=${apiKey}&user_id=${userId}&format=json&nojsoncallback=1&extras=views&per_page=12`;

  // reusable error message function
  let errorMsg = (e) => {
    clear();
    return `${loadingImage} <p class='text--center'>ERROR: ${e}</p>`;
  };

  let totalPages;
  let photos;
  let sortedBy;
  let nextPageResults;

  // event listeners
  sortForm.addEventListener('change', (e) => {
    sortBy(e.target.value);
  });

  // function to make the GET call to the flickr API
  let getPhotos = (p) => {
    sortForm.value = 'newest';
    previousBtn.style.display = '';

    if (p === 1) {
      previousBtn.style.display = 'none';
    }

    return fetch(`${apiUrl}&page=${p}`).then((response) => {
      let _response = response.json();
      imageList.style.minHeight = '435px';
      clear();
      return _response;
    });
  };

  let renderImages = (_images) => {
    photos = _images.photo;
    currentPage = _images.page;
    itemsDesc.innerHTML = `Page ${currentPage} of ${totalPages}`;

    mobileScroll();
    // for every photo in the returned array,
    for (let photo of photos) {
      // generate photo link (could also request flicker to send url_q value but ehh more data)
      let imageUrl = `https://farm${photo.farm}.staticflickr.com/${photo.server}/${photo.id}_${photo.secret}.jpg`;
      photo.url = imageUrl;

      // let's send it as an argument to create a list item per photo
      createListItem(photo);
    }
  };

  // for each photo from the array, a list item element is created
  const createListItem = (i) => {
    let item = document.createElement('li');
    item.classList.add('img__container');
    item.innerHTML = `<img src="${i.url}" alt="${i.title}"/>`;

    // and then, that list item is attached to
    // the unordered list to be rendered HTML file
    imageList.appendChild(item);
  };

  const byViews = (a, b) => {
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

  // sort images by views
  const sortBy = (arg) => {
    photos.sort(byViews);

    // clear previous image order for newly sorted image order
    clear();

    // run list item creation function to render sorted results
    for (let p in photos) {
      createListItem(photos[p]);
    }

    sortedBy = arg;
  };

  // function to clear values
  const clear = function() {
    imageList.style.minHeight = 0;
    imageList.innerHTML = '';
  };

  const mobileScroll = function() {
    if (window.innerWidth < 720){
      window.scrollTo(0, 0);
    }
  }

  // initial call to flickr API, get photos from first page
  function getResults(page){
    imageList.innerHTML = loadingImage;
    return getPhotos(page).then((data) => {
      photos = data;
      totalPages = data.photos.pages;
      renderImages(data.photos);
      }).then(()=> {
        nextPageResults = (next) => { return getPhotos(next); };
      }).catch((e) => {
        itemsDesc.innerHTML = errorMsg(e.toString());
      });
  };

  getResults(currentPage);

  // use current page to determine next/previous pages
  previousBtn.addEventListener('click', function() {
    if (currentPage !== 1) {
      nextPageResults(currentPage - 1).then((previous) => {
        clear();
        return renderImages(previous.photos)
      });
    }
  });

  nextBtn.addEventListener('click', function() {
    if (currentPage !== totalPages) {
      nextPageResults(currentPage + 1).then((next) => {
        clear();
        return renderImages(next.photos)
      });
    } else {
      nextBtn.style.display = 'none';
    }
  });
};
