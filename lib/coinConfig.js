export const getCoinsEarned = (amount) => {
    if (amount > 300) {
        return 15;
    } else if (amount > 200) {
        return 10;
    }
    return 0;
};
