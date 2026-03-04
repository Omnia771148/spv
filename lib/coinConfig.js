export const getCoinsEarned = (amount, isFirstOrder = false) => {
    if (isFirstOrder) {
        return 30; // Flat 30 coins for the first order regardless of amount
    }

    // For returning customers, no coins if amount is strictly below 200
    if (amount < 200) {
        return 0;
    }

    // 5 coins for every 100 rupees
    return Math.floor(amount / 100) * 5;
};
