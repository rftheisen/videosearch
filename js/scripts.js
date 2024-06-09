async function fetchVideos() {
    const response = await fetch('videos.json');
    const videos = await response.json();
    return videos;
  }
  
  async function init() {
    const videos = await fetchVideos();
    displayVideos(videos);
  }
  
  function displayVideos(videosToDisplay) {
    const videoGallery = document.getElementById('video-gallery');
    videoGallery.innerHTML = '';
  
    videosToDisplay.forEach(video => {
      const videoDiv = document.createElement('div');
      videoDiv.classList.add('video');
  
      const iframe = document.createElement('iframe');
      iframe.width = "560";
      iframe.height = "315";
      iframe.src = video.url.replace('/watch?v=', '/embed/');
      iframe.title = video.title;
      iframe.frameBorder = "0";
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
  
  function searchVideos(query, videos) {
    const filteredVideos = videos.filter(video => {
      return video.title.toLowerCase().includes(query.toLowerCase()) ||
             video.description.toLowerCase().includes(query.toLowerCase()) ||
             video.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()));
    });
    displayVideos(filteredVideos);
  }
  
  document.getElementById('search-input').addEventListener('input', async (e) => {
    const videos = await fetchVideos();
    searchVideos(e.target.value, videos);
  });
  
  // Initial display
  init();
  
