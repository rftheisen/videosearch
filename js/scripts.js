const PAGE_SIZE = 24;
let currentVideos = [];
let currentPage = 0;

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
  currentVideos = videos;
  currentPage = 0;
  renderPage(true);
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
  img.src = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
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

function createVideoCard(video) {
  const videoDiv = document.createElement('div');
  videoDiv.classList.add('video');

  const title = document.createElement('h3');
  title.innerText = video.title;

  const description = document.createElement('p');
  description.innerText = video.description;

  videoDiv.appendChild(title);
  videoDiv.appendChild(createThumbnail(video));
  videoDiv.appendChild(description);
  return videoDiv;
}

function renderPage(reset = false) {
  const gallery = document.getElementById('video-gallery');
  const loadMoreBtn = document.getElementById('load-more');

  if (reset) {
    gallery.innerHTML = '';
    currentPage = 0;
  }

  const start = currentPage * PAGE_SIZE;
  const slice = currentVideos.slice(start, start + PAGE_SIZE);

  slice.forEach(video => gallery.appendChild(createVideoCard(video)));
  currentPage++;

  const totalShown = Math.min(currentPage * PAGE_SIZE, currentVideos.length);
  const hasMore = totalShown < currentVideos.length;

  if (loadMoreBtn) {
    loadMoreBtn.style.display = hasMore ? 'block' : 'none';
    if (hasMore) {
      const remaining = currentVideos.length - totalShown;
      loadMoreBtn.textContent = `Load more (${remaining} remaining)`;
    }
  }
}

function displayVideos(videosToDisplay) {
  currentVideos = videosToDisplay;
  renderPage(true);
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
  return videos.filter(video =>
    video.title.toLowerCase().includes(query.toLowerCase()) ||
    video.description.toLowerCase().includes(query.toLowerCase()) ||
    video.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
  );
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
    const filtered = searchVideos(query, videos);
    displayVideos(filtered);
    updateCount(filtered.length, videos.length);
  }, 150);

  searchInput.addEventListener('input', () => handleSearch(searchInput.value));
}

function setupDarkModeToggle() {
  const toggle = document.getElementById('dark-mode-toggle');

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

document.getElementById('load-more').addEventListener('click', () => renderPage(false));

init();
