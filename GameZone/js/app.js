import GAMES_DATA from './games.js';
import { StorageManager } from './storage.js';

const NEWS_DATA = [
    {
        id: 1,
        title: "Cyberpunk 2077 Sequel 'Project Orion' Enters Full Production",
        date: "Nov 12, 2026",
        summary: "CD Projekt Red confirms development is ramping up with veteran developers joining the studio in Boston.",
        image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=800"
    },
    {
        id: 2,
        title: "Unreal Engine 6 Announced with Revolutionary Real-Time Global Illumination",
        date: "Nov 10, 2026",
        summary: "Epic Games showcases next-gen rendering capabilities promising photorealistic fidelity for indie and AAA developers alike.",
        image: "https://images.unsplash.com/photo-1614680376593-902f74cf0d41?auto=format&fit=crop&q=80&w=800"
    },
    {
        id: 3,
        title: "The Evolution of Esports: What to Expect in the 2027 World Championships",
        date: "Nov 08, 2026",
        summary: "Major tournament organizers announce hybrid VR spectator modes and increased prize pools across tactical shooters.",
        image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=800"
    }
];

class GameZoneApp {
    constructor() {
        this.currentSearch = '';
        this.currentGenre = 'all';
        this.currentSort = 'rating-desc';
        this.init();
    }

    init() {
        this.setupNavigation();
        this.setupFilters();
        this.setupModals();
        this.renderAll();
        this.updateFavBadge();
    }

    renderAll() {
        this.renderPopularGames();
        this.renderLatestGames();
        this.renderCatalogGames();
        this.renderNews();
        this.renderProfile();
        this.renderFavorites();
    }

    setupNavigation() {
        const navLinks = document.querySelectorAll('.nav-link, .logo, [data-target], [data-action="go-explore"], [data-action="go-news"]');
        const sections = document.querySelectorAll('.content-section');
        const hamburger = document.getElementById('hamburger');
        const navMenu = document.getElementById('navMenu');

        if (hamburger && navMenu) {
            hamburger.addEventListener('click', () => {
                navMenu.classList.toggle('active');
            });
        }

        document.body.addEventListener('click', (e) => {
            const targetEl = e.target.closest('[data-target], [data-action]');
            if (!targetEl) return;

            const targetSection = targetEl.getAttribute('data-target');
            const action = targetEl.getAttribute('data-action');

            if (targetSection) {
                e.preventDefault();
                this.switchSection(targetSection);
                if (navMenu) navMenu.classList.remove('active');
            } else if (action === 'go-explore') {
                e.preventDefault();
                this.switchSection('explore');
            } else if (action === 'go-news') {
                e.preventDefault();
                this.switchSection('news');
            }
        });
    }

    switchSection(sectionId) {
        const sections = document.querySelectorAll('.content-section');
        const navLinks = document.querySelectorAll('.nav-link');

        sections.forEach(sec => {
            sec.classList.remove('active');
            if (sec.id === `${sectionId}-section`) {
                sec.classList.add('active');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('data-target') === sectionId) {
                link.classList.add('active');
            }
        });

        window.scrollTo({ top: 0, behavior: 'smooth' });
        if (sectionId === 'profile') this.renderProfile();
        if (sectionId === 'favorites') this.renderFavorites();
    }

    setupFilters() {
        const searchInput = document.getElementById('game-search-input');
        const genreFilter = document.getElementById('genre-filter');
        const sortFilter = document.getElementById('sort-filter');

        // Populate genres
        if (genreFilter) {
            const genres = [...new Set(GAMES_DATA.map(g => g.genre))];
            genres.forEach(genre => {
                const opt = document.createElement('option');
                opt.value = genre;
                opt.textContent = genre;
                genreFilter.appendChild(opt);
            });

            genreFilter.addEventListener('change', (e) => {
                this.currentGenre = e.target.value;
                this.renderCatalogGames();
            });
        }

        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.currentSearch = e.target.value.toLowerCase().trim();
                this.renderCatalogGames();
            });
        }

        if (sortFilter) {
            sortFilter.addEventListener('change', (e) => {
                this.currentSort = e.target.value;
                this.renderCatalogGames();
            });
        }
    }

    createGameCardHTML(game) {
        const isFav = StorageManager.isFavorite(game.id);
        return `
            <div class="game-card" data-game-id="${game.id}">
                <div class="game-card-img-wrap" style="cursor: pointer;" data-open-modal="${game.id}">
                    <img src="${game.image}" alt="${game.title}" loading="lazy">
                    <span class="game-genre-badge">${game.genre}</span>
                    <button class="game-fav-btn ${isFav ? 'active' : ''}" data-fav-id="${game.id}" title="${isFav ? 'Quitar de Favoritos' : 'Añadir a Favoritos'}">
                        <i class="fa-${isFav ? 'solid' : 'regular'} fa-heart"></i>
                    </button>
                </div>
                <div class="game-card-body">
                    <div class="game-meta">
                        <span class="game-rating"><i class="fa-solid fa-star"></i> ${game.rating.toFixed(1)}</span>
                        <span class="game-date">${new Date(game.releaseDate).getFullYear()}</span>
                    </div>
                    <h3 style="cursor: pointer;" data-open-modal="${game.id}">${game.title}</h3>
                    <p>${game.description}</p>
                    <button class="btn btn-secondary" style="width: 100%;" data-open-modal="${game.id}">
                        <i class="fa-solid fa-circle-info"></i> Ver Detalles
                    </button>
                </div>
            </div>
        `;
    }

    renderPopularGames() {
        const grid = document.getElementById('popular-games-grid');
        if (!grid) return;

        const popular = [...GAMES_DATA].sort((a, b) => b.rating - a.rating).slice(0, 4);
        grid.innerHTML = popular.map(game => this.createGameCardHTML(game)).join('');
        this.attachCardEvents(grid);
    }

    renderLatestGames() {
        const grid = document.getElementById('latest-games-grid');
        if (!grid) return;

        const latest = [...GAMES_DATA].sort((a, b) => new Date(b.releaseDate) - new Date(a.releaseDate)).slice(0, 4);
        grid.innerHTML = latest.map(game => this.createGameCardHTML(game)).join('');
        this.attachCardEvents(grid);
    }

    renderCatalogGames() {
        const grid = document.getElementById('catalog-games-grid');
        const noResults = document.getElementById('no-results');
        if (!grid) return;

        let filtered = GAMES_DATA.filter(game => {
            const matchesSearch = game.title.toLowerCase().includes(this.currentSearch) ||
                                  game.description.toLowerCase().includes(this.currentSearch) ||
                                  game.genre.toLowerCase().includes(this.currentSearch);
            const matchesGenre = this.currentGenre === 'all' || game.genre === this.currentGenre;
            return matchesSearch && matchesGenre;
        });

        // Sorting
        filtered.sort((a, b) => {
            if (this.currentSort === 'rating-desc') return b.rating - a.rating;
            if (this.currentSort === 'name-asc') return a.title.localeCompare(b.title);
            if (this.currentSort === 'name-desc') return b.title.localeCompare(a.title);
            if (this.currentSort === 'date-desc') return new Date(b.releaseDate) - new Date(a.releaseDate);
            return 0;
        });

        if (filtered.length === 0) {
            grid.innerHTML = '';
            if (noResults) noResults.classList.remove('hidden');
        } else {
            if (noResults) noResults.classList.add('hidden');
            grid.innerHTML = filtered.map(game => this.createGameCardHTML(game)).join('');
            this.attachCardEvents(grid);
        }
    }

    renderNews() {
        const homeGrid = document.getElementById('home-news-grid');
        const fullGrid = document.getElementById('full-news-grid');

        const newsHTML = NEWS_DATA.map(news => `
            <div class="news-card">
                <div class="news-img">
                    <img src="${news.image}" alt="${news.title}" loading="lazy">
                </div>
                <div class="news-content">
                    <span class="news-date-tag"><i class="fa-solid fa-calendar-days"></i> ${news.date}</span>
                    <h3>${news.title}</h3>
                    <p>${news.summary}</p>
                    <button class="btn btn-secondary" onclick="alert('Leyendo artículo completo...')"><i class="fa-solid fa-book-open"></i> Leer más</button>
                </div>
            </div>
        `).join('');

        if (homeGrid) homeGrid.innerHTML = newsHTML;
        if (fullGrid) fullGrid.innerHTML = newsHTML;
    }

    renderProfile() {
        const user = StorageManager.getUserProfile();
        const usernameEl = document.getElementById('profile-username');
        const bioEl = document.getElementById('profile-bio');
        const avatarImg = document.getElementById('profile-avatar-img');
        const statFavsCount = document.getElementById('stat-favs-count');
        const profileFavsGrid = document.getElementById('profile-favs-grid');

        if (usernameEl) usernameEl.textContent = user.name;
        if (bioEl) bioEl.textContent = user.bio;
        if (avatarImg) avatarImg.src = user.avatar;

        const favs = StorageManager.getFavorites();
        if (statFavsCount) statFavsCount.textContent = favs.length;

        if (profileFavsGrid) {
            const favGames = GAMES_DATA.filter(g => favs.includes(g.id));
            if (favGames.length === 0) {
                profileFavsGrid.innerHTML = `<p style="color: var(--text-muted); grid-column: 1/-1;">No tienes juegos favoritos guardados en tu perfil todavía.</p>`;
            } else {
                profileFavsGrid.innerHTML = favGames.map(game => this.createGameCardHTML(game)).join('');
                this.attachCardEvents(profileFavsGrid);
            }
        }
    }

    renderFavorites() {
        const favoritesGrid = document.getElementById('favorites-games-grid');
        const noFavorites = document.getElementById('no-favorites');
        const favs = StorageManager.getFavorites();

        if (!favoritesGrid) return;

        const favGames = GAMES_DATA.filter(g => favs.includes(g.id));

        if (favGames.length === 0) {
            favoritesGrid.innerHTML = '';
            if (noFavorites) noFavorites.classList.remove('hidden');
        } else {
            if (noFavorites) noFavorites.classList.add('hidden');
            favoritesGrid.innerHTML = favGames.map(game => this.createGameCardHTML(game)).join('');
            this.attachCardEvents(favoritesGrid);
        }
        this.updateFavBadge();
    }

    updateFavBadge() {
        const badge = document.getElementById('fav-badge');
        if (badge) {
            const count = StorageManager.getFavorites().length;
            badge.textContent = count;
        }
    }

    attachCardEvents(container) {
        // Favorite buttons
        container.querySelectorAll('.game-fav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const gameId = parseInt(btn.getAttribute('data-fav-id'));
                const isFav = StorageManager.isFavorite(gameId);

                if (isFav) {
                    StorageManager.removeFavorite(gameId);
                    this.showToast('Juego eliminado de favoritos', 'heart-crack');
                } else {
                    StorageManager.addFavorite(gameId);
                    this.showToast('¡Juego añadido a favoritos!', 'heart');
                }

                this.renderAll();
            });
        });

        // Open modal on card click or info button
        container.querySelectorAll('[data-open-modal]').forEach(el => {
            el.addEventListener('click', () => {
                const gameId = parseInt(el.getAttribute('data-open-modal'));
                const game = GAMES_DATA.find(g => g.id === gameId);
                if (game) this.openGameModal(game);
            });
        });
    }

    openGameModal(game) {
        const modal = document.getElementById('game-modal');
        const modalBody = document.getElementById('modal-body-content');
        const isFav = StorageManager.isFavorite(game.id);

        if (!modal || !modalBody) return;

        modalBody.innerHTML = `
            <div class="modal-game-detail">
                <div class="modal-game-img">
                    <img src="${game.image}" alt="${game.title}">
                </div>
                <div class="modal-game-info">
                    <span class="game-genre-badge" style="position: static; display: inline-block; margin-bottom: 0.75rem;">${game.genre}</span>
                    <h2>${game.title}</h2>
                    <div class="modal-game-meta">
                        <span class="game-rating"><i class="fa-solid fa-star"></i> ${game.rating.toFixed(1)} / 5.0</span>
                        <span class="game-date"><i class="fa-solid fa-calendar"></i> Lanzamiento: ${game.releaseDate}</span>
                    </div>
                    <p class="modal-game-desc">${game.description}</p>
                    <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
                        <button class="btn btn-primary" id="modal-fav-toggle-btn">
                            <i class="fa-${isFav ? 'solid' : 'regular'} fa-heart"></i> ${isFav ? 'Quitar de Favoritos' : 'Añadir a Favoritos'}
                        </button>
                        <button class="btn btn-secondary" onclick="alert('Iniciando descarga / launcher de GameZone...')">
                            <i class="fa-solid fa-download"></i> Jugar / Descargar
                        </button>
                    </div>
                </div>
            </div>
        `;

        const favToggleBtn = modalBody.querySelector('#modal-fav-toggle-btn');
        if (favToggleBtn) {
            favToggleBtn.addEventListener('click', () => {
                if (StorageManager.isFavorite(game.id)) {
                    StorageManager.removeFavorite(game.id);
                    this.showToast('Juego eliminado de favoritos', 'heart-crack');
                } else {
                    StorageManager.addFavorite(game.id);
                    this.showToast('¡Juego añadido a favoritos!', 'heart');
                }
                this.openGameModal(game); // refresh modal state
                this.renderAll();
            });
        }

        modal.classList.add('active');
    }

    setupModals() {
        const gameModal = document.getElementById('game-modal');
        const modalCloseBtn = document.getElementById('modal-close-btn');
        const profileModal = document.getElementById('profile-modal');
        const profileModalClose = document.getElementById('profile-modal-close');
        const editProfileBtn = document.getElementById('edit-profile-btn');
        const editAvatarBtn = document.getElementById('edit-avatar-btn');
        const profileForm = document.getElementById('profile-form');

        // Close game modal
        if (modalCloseBtn && gameModal) {
            modalCloseBtn.addEventListener('click', () => gameModal.classList.remove('active'));
            gameModal.addEventListener('click', (e) => {
                if (e.target === gameModal) gameModal.classList.remove('active');
            });
        }

        // Profile Modal
        if (editProfileBtn && profileModal) {
            editProfileBtn.addEventListener('click', () => {
                const user = StorageManager.getUserProfile();
                document.getElementById('input-username').value = user.name;
                document.getElementById('input-avatar').value = user.avatar;
                document.getElementById('input-bio').value = user.bio;
                profileModal.classList.add('active');
            });
        }

        if (editAvatarBtn && profileModal) {
            editAvatarBtn.addEventListener('click', () => {
                const user = StorageManager.getUserProfile();
                document.getElementById('input-username').value = user.name;
                document.getElementById('input-avatar').value = user.avatar;
                document.getElementById('input-bio').value = user.bio;
                profileModal.classList.add('active');
            });
        }

        if (profileModalClose && profileModal) {
            profileModalClose.addEventListener('click', () => profileModal.classList.remove('active'));
            profileModal.addEventListener('click', (e) => {
                if (e.target === profileModal) profileModal.classList.remove('active');
            });
        }

        if (profileForm) {
            profileForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const name = document.getElementById('input-username').value.trim();
                const avatar = document.getElementById('input-avatar').value.trim();
                const bio = document.getElementById('input-bio').value.trim();

                const currentUser = StorageManager.getUserProfile();
                currentUser.name = name;
                currentUser.avatar = avatar;
                currentUser.bio = bio;

                StorageManager.setUserProfile(currentUser);
                profileModal.classList.remove('active');
                this.renderProfile();
                this.showToast('¡Perfil actualizado con éxito!', 'user-check');
            });
        }

        // ESC key to close modals
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (gameModal) gameModal.classList.remove('active');
                if (profileModal) profileModal.classList.remove('active');
            }
        });
    }

    showToast(message, iconName = 'circle-check') {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerHTML = `<i class="fa-solid fa-${iconName}"></i> <span>${message}</span>`;
        container.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(50px)';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
}

// Initialize App on DOM Content Loaded
document.addEventListener('DOMContentLoaded', () => {
    new GameZoneApp();
});
