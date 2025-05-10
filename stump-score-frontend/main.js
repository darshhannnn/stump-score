import config from './config.js'; // App configuration

// Error handling function
function handleError(error, container, message = 'An error occurred') {
    console.error('API Error:', error);
    container.innerHTML = `
        <div class="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded relative" role="alert">
            <span class="block sm:inline">${message}</span>
        </div>
    `;
}

async function fetchLiveScores() {
    const liveContainer = document.getElementById('live-matches');
    const upcomingContainer = document.getElementById('upcoming-matches');
    const recentContainer = document.getElementById('recent-matches');

    liveContainer.innerHTML = '<div class="animate-pulse text-gray-500">Loading live matches...</div>';
    upcomingContainer.innerHTML = '';
    recentContainer.innerHTML = '';

    try {
        const response = await fetch(`${config.API.BASE_URL}${config.API.ENDPOINTS.MATCHES}/live`);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        if (!data.success) {
            throw new Error(data.error || 'API request failed');
        }

        if (!data.matches || !Array.isArray(data.matches)) {
            throw new Error('Invalid data format from API');
        }

        liveContainer.innerHTML = '';
        upcomingContainer.innerHTML = '';
        recentContainer.innerHTML = '';

        data.matches.forEach(match => {
            // Determine match category
            let category = 'live';
            if (match.status && match.status.toLowerCase().includes('upcoming')) category = 'upcoming';
            else if (match.status && (match.status.toLowerCase().includes('result') || match.status.toLowerCase().includes('won') || match.status.toLowerCase().includes('draw') || match.status.toLowerCase().includes('abandoned'))) category = 'recent';

            // Build Cricbuzz-like card
            const card = document.createElement('div');
            card.className = 'bg-white rounded-xl shadow flex flex-col gap-2 p-4';

            // Status badge
            let badge = '';
            if (category === 'live') badge = '<span class="inline-block bg-green-600 text-white text-xs font-bold px-2 py-1 rounded mb-2 w-fit">LIVE</span>';
            else if (category === 'upcoming') badge = '<span class="inline-block bg-yellow-400 text-gray-900 text-xs font-bold px-2 py-1 rounded mb-2 w-fit">UPCOMING</span>';
            else badge = '<span class="inline-block bg-gray-300 text-gray-700 text-xs font-bold px-2 py-1 rounded mb-2 w-fit">RECENT</span>';

            card.innerHTML = `
              ${badge}
              <div class="flex justify-between items-center">
                <div class="text-lg font-semibold">${match.teams[0]?.name || 'Team 1'}</div>
                <div class="text-lg font-semibold">${match.teams[1]?.name || 'Team 2'}</div>
              </div>
              <div class="text-sm text-gray-600">${match.status || 'Status not available'}</div>
              <div class="text-sm text-gray-600">${match.date || 'Date not available'}</div>
            `;

            // Add match ID to card for click handling
            card.dataset.matchId = match.id;

            // Add click event listener
            card.addEventListener('click', () => {
                window.location.href = `match.html?id=${match.id}`;
            });

            // Add card to appropriate container
            if (category === 'live') liveContainer.appendChild(card);
            else if (category === 'upcoming') upcomingContainer.appendChild(card);
            else recentContainer.appendChild(card);
        });

        if (liveContainer.innerHTML === '') {
            liveContainer.innerHTML = '<div class="text-gray-400">No live matches</div>';
        }
        if (upcomingContainer.innerHTML === '') {
            upcomingContainer.innerHTML = '<div class="text-gray-400">No upcoming matches</div>';
        }
        if (recentContainer.innerHTML === '') {
            recentContainer.innerHTML = '<div class="text-gray-400">No recent matches</div>';
        }
    } catch (error) {
        handleError(error, liveContainer, 'Error fetching live scores. Please try again later.');
        upcomingContainer.innerHTML = '';
        recentContainer.innerHTML = '';
    }
}

fetchLiveScores();
setInterval(fetchLiveScores, 60000);

// Fetch and render news in the sidebar
async function fetchNews() {
    const newsList = document.getElementById('latest-news-list');
    newsList.innerHTML = '<li class="text-gray-400">Loading news...</li>';
    try {
        const response = await fetch(`${config.API.BASE_URL}${config.API.ENDPOINTS.NEWS}/latest`);
        const data = await response.json();
        if (data.success && data.articles && data.articles.length > 0) {
            newsList.innerHTML = '';
            data.articles.slice(0, 6).forEach(article => {
                const li = document.createElement('li');
                li.className = 'mb-2 pb-2 border-b border-gray-100 last:border-0';
                li.innerHTML = `
                  <a href="${article.url}" target="_blank" class="font-semibold text-blue-800 hover:underline block">${article.title}</a>
                  <span class="text-xs text-gray-400">${article.publishedAt ? new Date(article.publishedAt).toLocaleString() : ''}</span>
                `;
                newsList.appendChild(li);
            });
        } else {
            newsList.innerHTML = '<li class="text-gray-400">No news found.</li>';
        }
    } catch (error) {
        newsList.innerHTML = '<li class="text-red-500">Error loading news.</li>';
    }
}

fetchNews();

