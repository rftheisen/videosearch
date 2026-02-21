async function fetchVideos() {
  try {
    const response = await fetch('videos.json');
    const videos = await response.json();
    return videos;
  } catch (error) {
    console.error('Error fetching videos:', error);
    return [];
  }
}

async function init() {
  const videos = await fetchVideos();
  displayVideos(videos);
  updateCount(videos.length, videos.length);
  setupSearch(videos);
  setupDarkModeToggle();
}

function displayVideos(videosToDisplay) {
  const videoGallery = document.getElementById('video-gallery');
  videoGallery.innerHTML = '';

  videosToDisplay.forEach(video => {
    const videoDiv = document.createElement('div');
    videoDiv.classList.add('video');

    const iframe = document.createElement('iframe');
    iframe.src = video.url;
    iframe.title = video.title;
    iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
    iframe.allowFullscreen = true;

    const title = document.createElement('h3');
    title.innerText = video.title;

    const description = document.createElement('p');
    description.innerText = video.description;

    videoDiv.appendChild(title);
    videoDiv.appendChild(iframe);
    videoDiv.appendChild(description);
    videoGallery.appendChild(videoDiv);
  });
}

function updateCount(shown, total) {
  const countEl = document.getElementById('video-count');
  if (!countEl) return;
  if (shown === total) {
    countEl.textContent = `${total} videos`;
  } else {
    countEl.textContent = `${shown} of ${total} videos`;
  }
}

function searchVideos(query, videos) {
  const filtered = videos.filter(video => {
    return video.title.toLowerCase().includes(query.toLowerCase()) ||
           video.description.toLowerCase().includes(query.toLowerCase()) ||
           video.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()));
  });
  return filtered;
}

function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

function setupSearch(videos) {
  const searchInput = document.getElementById('search-input');
  const handleSearch = debounce((query) => {
    const filteredVideos = searchVideos(query, videos);
    displayVideos(filteredVideos);
    updateCount(filteredVideos.length, videos.length);
  }, 150);

  searchInput.addEventListener('input', () => {
    handleSearch(searchInput.value);
  });
}

function setupDarkModeToggle() {
  const toggle = document.getElementById('dark-mode-toggle');

  // Restore saved preference
  if (localStorage.getItem('darkMode') === 'true') {
    document.body.classList.add('dark-mode');
    toggle.checked = true;
  }

  toggle.addEventListener('change', () => {
    const isDark = toggle.checked;
    document.body.classList.toggle('dark-mode', isDark);
    localStorage.setItem('darkMode', isDark);
  });
}

init();
