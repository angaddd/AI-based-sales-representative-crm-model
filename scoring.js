// SIMPLE scoring.js
console.log('Scoring module loaded');

// Score configuration - easy to modify
const SCORE_CONFIG = {
    // Button types and their scores
    buttonScores: {
        // Purchase-related buttons
        'buy': 10,
        'purchase': 10,
        'order': 10,
        'checkout': 15,
        'add to cart': 5,
        'add': 5,
        'subscribe': 8,
        
        // Positive engagement
        'yes': 3,
        'confirm': 4,
        'agree': 3,
        'accept': 3,
        'next': 2,
        'continue': 2,
        
        // Information seeking
        'learn more': 1,
        'details': 1,
        'info': 1,
        'view': 1,
        'read': 1,
        
        // Contact/help
        'contact': 2,
        'chat': 3,
        'help': 1,
        'support': 1,
        
        // Negative actions (reduce score)
        'cancel': -3,
        'no': -2,
        'delete': -5,
        'remove': -4
    },
    
    // Additional scoring rules
    scoringRules: {
        multipleClicks: 2,        // Bonus for same button multiple times
        pageDepthBonus: 0.5,      // Bonus per page depth
        timeOnSiteBonus: 0.1,     // Bonus per second
        conversionMultiplier: 2    // Multiply score if conversion happens
    }
};

// Customer scores storage (in real app, this would be in backend)
let customerScores = {};

// Initialize or load scores
function initScores() {
    const saved = localStorage.getItem('customerScores');
    if (saved) {
        customerScores = JSON.parse(saved);
        console.log('Loaded customer scores:', customerScores);
    }
}

// Save scores to localStorage
function saveScores() {
    localStorage.setItem('customerScores', JSON.stringify(customerScores));
}

// Calculate score for a button click
function calculateClickScore(buttonText) {
    let score = 0;
    const text = buttonText.toLowerCase().trim();
    
    // Check exact matches first
    if (SCORE_CONFIG.buttonScores[text]) {
        score = SCORE_CONFIG.buttonScores[text];
    } else {
        // Check partial matches
        for (const [keyword, keywordScore] of Object.entries(SCORE_CONFIG.buttonScores)) {
            if (text.includes(keyword)) {
                score = keywordScore;
                break;
            }
        }
    }
    
    return score;
}

// Update customer score
function updateCustomerScore(customerId, buttonText, additionalData = {}) {
    if (!customerId) {
        console.warn('No customer ID provided');
        return;
    }
    
    // Initialize customer if not exists
    if (!customerScores[customerId]) {
        customerScores[customerId] = {
            totalScore: 0,
            clickCount: 0,
            lastActive: new Date().toISOString(),
            buttonHistory: [],
            details: {}
        };
    }
    
    const customer = customerScores[customerId];
    const baseScore = calculateClickScore(buttonText);
    
    // Calculate bonus for multiple clicks on same button
    let bonus = 0;
    const sameButtonCount = customer.buttonHistory.filter(
        click => click.button === buttonText
    ).length;
    
    if (sameButtonCount > 0) {
        bonus = SCORE_CONFIG.scoringRules.multipleClicks;
    }
    
    // Apply page depth bonus if provided
    let pageBonus = 0;
    if (additionalData.pageDepth) {
        pageBonus = additionalData.pageDepth * SCORE_CONFIG.scoringRules.pageDepthBonus;
    }
    
    // Calculate final score
    const finalScore = baseScore + bonus + pageBonus;
    
    // Update customer record
    customer.totalScore += finalScore;
    customer.clickCount += 1;
    customer.lastActive = new Date().toISOString();
    customer.buttonHistory.push({
        button: buttonText,
        score: finalScore,
        time: new Date().toISOString(),
        ...additionalData
    });
    
    // Keep only last 50 clicks to prevent storage bloat
    if (customer.buttonHistory.length > 50) {
        customer.buttonHistory = customer.buttonHistory.slice(-50);
    }
    
    // Save to localStorage
    saveScores();
    
    console.log(`Customer ${customerId} score updated: +${finalScore} (Total: ${customer.totalScore})`);
    
    return {
        customerId,
        baseScore,
        bonus,
        finalScore,
        totalScore: customer.totalScore,
        clickCount: customer.clickCount
    };
}

// Get customer score
function getCustomerScore(customerId) {
    if (!customerScores[customerId]) {
        return {
            totalScore: 0,
            clickCount: 0,
            lastActive: null,
            buttonHistory: [],
            interestLevel: 'Cold'
        };
    }
    
    const customer = customerScores[customerId];
    
    // Determine interest level based on score
    let interestLevel = 'Cold';
    if (customer.totalScore >= 50) interestLevel = 'Very Hot';
    else if (customer.totalScore >= 30) interestLevel = 'Hot';
    else if (customer.totalScore >= 15) interestLevel = 'Warm';
    else if (customer.totalScore >= 5) interestLevel = 'Interested';
    
    return {
        ...customer,
        interestLevel,
        averageScore: customer.clickCount > 0 ? (customer.totalScore / customer.clickCount).toFixed(2) : 0
    };
}

// Get all customers sorted by score
function getLeaderboard(limit = 10) {
    const customers = Object.entries(customerScores)
        .map(([id, data]) => ({
            id,
            ...data,
            interestLevel: getCustomerScore(id).interestLevel
        }))
        .sort((a, b) => b.totalScore - a.totalScore)
        .slice(0, limit);
    
    return customers;
}

// Record conversion (e.g., actual purchase)
function recordConversion(customerId, conversionValue = 0) {
    if (!customerScores[customerId]) return;
    
    const customer = customerScores[customerId];
    const conversionBonus = customer.totalScore * SCORE_CONFIG.scoringRules.conversionMultiplier;
    
    customer.totalScore += conversionBonus;
    customer.conversion = {
        time: new Date().toISOString(),
        value: conversionValue,
        bonus: conversionBonus
    };
    
    saveScores();
    
    console.log(`Conversion recorded for ${customerId}: +${conversionBonus} bonus`);
    return conversionBonus;
}

// Reset customer score (for testing or admin)
function resetCustomerScore(customerId) {
    if (customerScores[customerId]) {
        delete customerScores[customerId];
        saveScores();
        console.log(`Reset score for customer: ${customerId}`);
        return true;
    }
    return false;
}

// Initialize on load
initScores();

// Export functions
window.customerScoring = {
    updateCustomerScore,
    getCustomerScore,
    getLeaderboard,
    recordConversion,
    resetCustomerScore,
    calculateClickScore,
    SCORE_CONFIG
};

// Example usage in tracker.js (modify your existing tracker):
/*
// In your tracker.js, add this:
document.addEventListener('click', (e) => {
    if (e.target.tagName === 'BUTTON') {
        const customerId = getCurrentCustomerId(); // You need to implement this
        const buttonText = e.target.textContent;
        
        // Track with scoring
        const scoreResult = window.customerScoring.updateCustomerScore(customerId, buttonText, {
            pageDepth: window.location.pathname.split('/').length,
            url: window.location.href
        });
        
        // Also send to your original tracker
        fetch('/api/track', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: 'button_click',
                button: buttonText,
                customerId: customerId,
                score: scoreResult.finalScore,
                totalScore: scoreResult.totalScore,
                time: new Date().toISOString()
            })
        });
    }
});
*/

// Helper function to get customer ID (you need to implement based on your app)
function getCurrentCustomerId() {
    // Example ways to get customer ID:
    // 1. From login session
    // 2. From URL parameter
    // 3. From localStorage
    // 4. Generate a temporary ID for anonymous users
    
    return localStorage.getItem('customer_id') || 
           new URLSearchParams(window.location.search).get('customerId') ||
           'anonymous_' + Math.random().toString(36).substr(2, 9);
}

// Simple integration example:
console.log('Customer Scoring Module Ready!');
console.log('Use window.customerScoring.updateCustomerScore(customerId, buttonText)');