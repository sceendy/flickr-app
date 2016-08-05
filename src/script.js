// ok, declaring some static stuff that is needed and won't change
const apiKey = 'bd9987dd291178d6ec1886920d9cd7c8';
const userId = '24662369@N07';

// cool, let's use those now
window.onload = () => {
  const imageList = document.getElementById('items');
  const toggle = document.getElementById('toggleBtn');
  const snackBar = document.getElementsByClassName('snackbar__text')[0];
  const itemsDesc = document.getElementsByClassName('items__description')[0];
  const sortForm = document.getElementById('sortBy');

  let currentPage = 1;
  let paused = false;
  toggle.innerHTML = 'stop';

  // setting the api url to grab photo view count to use for sorting function
  const apiUrl = `https://api.flickr.com/services/rest/?method=flickr.people.getPublicPhotos&api_key=${apiKey}&user_id=${userId}&format=json&nojsoncallback=1&extras=views&per_page=16`;

  // reusable error message function
  let errorMsg = (e) => {
    return `<p class='text--center'>ERROR: ${e}</p>`;
  };

  let totalPages;
  let photos;
  let allPhotos = [];
  let sortedBy;

  // event listeners
  sortForm.addEventListener('change', (e) => {
    sortBy(e.target.value);
  });

  toggle.addEventListener('click', (e) => {
    paused = !paused;
    toggle.innerHTML = paused ?  'continue' : 'stop';
  });

  // function to make the GET call to the flickr API
  let getPhotos = (p) => {
    sortForm.value = '';

    return fetch(`${apiUrl}&page=${p}`).then((response) => {
      let _response = response.json();
      imageList.style.minHeight = '435px';
      return _response;
    });
  };

  let renderImages = (_images) => {
    photos = _images.photo;

    snackBar.innerHTML = `Showing ${currentPage} of ${totalPages} pages`;

    for (let photo of photos) {
      let imageUrl = `https://farm${photo.farm}.staticflickr.com/${photo.server}/${photo.id}_${photo.secret}.jpg`;
      photo.url = imageUrl;
      allPhotos.push(photo);
      // send it as an argument to create a list item per photo
      createListItem(photo);
    }
  };

  // for each photo from the array, a list item element is created
  const createListItem = (i) => {
    let item = document.createElement('li');
    item.classList.add('img__container');
    item.innerHTML = `<img src="${i.url}" alt="${i.title}" title="${i.title}"/><span>${i.views}</span>`;

    // attach each item to the list to be rendered HTML file
    imageList.appendChild(item);
  };

  const byViews = (a, b) => {
    // view count
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
    sortedBy = arg;
    allPhotos.sort(byViews);
    imageList.innerHTML = "<img src='https://go.proofpilot.it/images/spinner.gif'/>";

    // run list item creation function to render sorted results
    window.setTimeout(function() {
      imageList.innerHTML = '';
      for (let p of allPhotos) { createListItem(p); }
    }, 200);
  };

  // initial call to flickr API, get photos from first page
  function getResults(page){
    currentPage = page;
    return getPhotos(page).then((data) => {
      totalPages = data.photos.pages;
      renderImages(data.photos);
    }).catch((e) => {
        itemsDesc.innerHTML = errorMsg(e.toString());
      });
  };

  // initial load
  getResults(currentPage);

  // load more when user scrolled to the bottom
  window.addEventListener('scroll', function(e) {
    if ((!paused && window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
      return getResults(currentPage + 1);
    }
  });
};
