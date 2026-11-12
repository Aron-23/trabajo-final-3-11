const STORAGE_KEY = 'gamezone_favorites';
const USER_KEY = 'gamezone_user';

export const StorageManager = {
    getFavorites() {
        const favs = localStorage.getItem(STORAGE_KEY);
        return favs ? JSON.parse(favs) : [];
    },

    addFavorite(gameId) {
        const favs = this.getFavorites();
        if (!favs.includes(gameId)) {
            favs.push(gameId);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(favs));
            return true;
        }
        return false;
    },

    removeFavorite(gameId) {
        let favs = this.getFavorites();
        favs = favs.filter(id => id !== gameId);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(favs));
        return true;
    },

    isFavorite(gameId) {
        return this.getFavorites().includes(gameId);
    },

    getUserProfile() {
        const user = localStorage.getItem(USER_KEY);
        return user ? JSON.parse(user) : {
            name: "Guest Gamer",
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=GameZone",
            bio: "Just a passionate gamer exploring new worlds.",
            stats: {
                gamesPlayed: 124,
                hoursOnline: 1500,
                trophies: 42
            }
        };
    },

    setUserProfile(profile) {
        localStorage.setItem(USER_KEY, JSON.stringify(profile));
    }
};
