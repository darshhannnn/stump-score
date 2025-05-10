// News API endpoint
const NEWS_API_URL = 'http://localhost:5000/api/news/latest';

async function updateCricketNews() {
    const newsList = document.getElementById('latest-news-list');
    if (!newsList) return;
    newsList.innerHTML = '<li>Loading news...</li>';
    try {
        const response = await fetch(NEWS_API_URL);
        const data = await response.json();
        if (data.success && data.articles && data.articles.length > 0) {
            newsList.innerHTML = '';
            data.articles.slice(0, 6).forEach(article => {
                const li = document.createElement('li');
                li.className = 'mb-2';
                li.innerHTML = `<a href="#" class="font-semibold hover:underline news-link">${article.title}</a><br>
                    <span class="text-xs text-gray-400">${new Date(article.publishedAt).toLocaleString()}</span>`;
                li.querySelector('.news-link').addEventListener('click', function(e) {
                    e.preventDefault();
                    localStorage.setItem('selectedNewsArticle', JSON.stringify(article));
                    window.location.href = 'news.html';
                });
                newsList.appendChild(li);
            });
        } else {
            newsList.innerHTML = '<li>No news found.</li>';
        }
    } catch (e) {
        newsList.innerHTML = '<li>Error loading news.</li>';
    }
}
updateCricketNews();
setInterval(updateCricketNews, 60000); // Refresh every 60 seconds
