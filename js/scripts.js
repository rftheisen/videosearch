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

function getVideoId(url) {
  return url.split('/embed/')[1]?.split('?')[0];
}

function createThumbnail(video) {
  const videoId = getVideoId(video.url);
  const wrapper = document.createElement('div');
  wrapper.classList.add('thumbnail-wrapper');

  const img = document.createElement('img');
  img.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
  img.alt = video.title;
  img.loading = 'lazy';

  const playBtn = document.createElement('div');
  playBtn.classList.add('play-btn');
  playBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="white" width="48" height="48"><path d="M8 5v14l11-7z"/></svg>`;

  wrapper.appendChild(img);
  wrapper.appendChild(playBtn);

  wrapper.addEventListener('click', () => {
    const iframe = document.createElement('iframe');
    iframe.src = `${video.url}?autoplay=1`;
    iframe.title = video.title;
    iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
    iframe.allowFullscreen = true;
    wrapper.replaceWith(iframe);
  });

  return wrapper;
}

function displayVideos(videosToDisplay) {
  const videoGallery = document.getElementById('video-gallery');
  videoGallery.innerHTML = '';

  videosToDisplay.forEach(video => {
    const videoDiv = document.createElement('div');
    videoDiv.classList.add('video');

    const title = document.createElement('h3');
    title.innerText = video.title;

    const description = document.createElement('p');
    description.innerText = video.description;

    videoDiv.appendChild(title);
    videoDiv.appendChild(createThumbnail(video));
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
