// This script loads the news article details from localStorage (set by news.js)
document.addEventListener('DOMContentLoaded', function() {
    const article = JSON.parse(localStorage.getItem('selectedNewsArticle'));
    if (!article) {
        document.getElementById('news-title').textContent = 'No article found.';
        document.getElementById('news-content').textContent = '';
        document.getElementById('news-meta').textContent = '';
        document.getElementById('news-source').style.display = 'none';
        return;
    }
    document.getElementById('news-title').textContent = article.title;
    document.getElementById('news-meta').textContent = `${article.source.name || ''} • ${new Date(article.publishedAt).toLocaleString()}`;
    if (article.urlToImage) {
        const img = document.getElementById('news-image');
        img.src = article.urlToImage;
        img.classList.remove('hidden');
    }
    document.getElementById('news-content').textContent = article.description || '';
    document.getElementById('news-source').href = article.url;
});
