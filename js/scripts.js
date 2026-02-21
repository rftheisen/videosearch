const PAGE_SIZE = 24;
let currentVideos = [];
let currentPage = 0;
let allVideos = [];

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
  allVideos = await fetchVideos();
  currentVideos = allVideos;
  currentPage = 0;
  renderPage(true);
  updateCount(allVideos.length, allVideos.length);
  setupSearch(allVideos);
  setupDarkModeToggle();
  setupScrollToTop();
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

function getPopularTags(videos, n = 10) {
  const counts = {};
  videos.forEach(v => v.tags.forEach(t => { counts[t] = (counts[t] || 0) + 1; }));
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([tag]) => tag);
}

function showEmptyState(query) {
  const gallery = document.getElementById('video-gallery');
  const loadMoreBtn = document.getElementById('load-more');
  if (loadMoreBtn) loadMoreBtn.style.display = 'none';

  const popularTags = getPopularTags(allVideos);

  const tagPills = popularTags.map(tag =>
    `<button class="tag-pill" onclick="applyTag('${tag}')">${tag}</button>`
  ).join('');

  gallery.innerHTML = `
    <div class="empty-state">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="48" height="48">
        <circle cx="11" cy="11" r="8"/>
        <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        <line x1="8" y1="8" x2="14" y2="14"/>
        <line x1="14" y1="8" x2="8" y2="14"/>
      </svg>
      <p class="empty-title">No videos found for "<strong>${query}</strong>"</p>
      <p class="empty-subtitle">Try one of these popular topics:</p>
      <div class="tag-pills">${tagPills}</div>
    </div>
  `;
}

function applyTag(tag) {
  const searchInput = document.getElementById('search-input');
  searchInput.value = tag;
  searchInput.dispatchEvent(new Event('input'));
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

function displayVideos(videosToDisplay, query = '') {
  currentVideos = videosToDisplay;
  if (videosToDisplay.length === 0 && query) {
    showEmptyState(query);
  } else {
    renderPage(true);
  }
}

function updateCount(shown, total) {
  const countEl = document.getElementById('video-count');
  if (!countEl) return;
  if (shown === total) {
    countEl.textContent = `${total} videos`;
  } else if (shown === 0) {
    countEl.textContent = '';
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
    displayVideos(filtered, query);
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

function setupScrollToTop() {
  const btn = document.getElementById('scroll-top');
  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

document.getElementById('load-more').addEventListener('click', () => renderPage(false));

init();
