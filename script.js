// State management
let currentDate = new Date();
let selectedDate = new Date().toISOString().split('T')[0];
let logs = [];
let currentTabs = 0;
let lockPhoneBtn;
let currentWakeTime = '';

// Fixed Lock System
let fixedLockCode = null;
let lastWakeupTime = null;
let isExtendedLock = false;

let currentVoidLevel = 0;

const scheduleItems = [
    { time: '12:30', activity: 'Wake (DELETE weakness)', category: 'critical' },
    { time: '12:45', activity: 'Morning routine (DELETE comfort)', category: 'routine' },
    { time: '13:30', activity: 'Breakfast - 30 min', category: 'routine' },
    { time: '13:45', activity: 'Preparation for work', category: 'routine' },
    { time: '14:00', activity: 'Development begins (DELETE distractions)', category: 'critical' },
    { time: '16:30', activity: 'Meal break - 30 min', category: 'routine' },
    { time: '17:00', activity: 'Continue development', category: 'critical' },
    { time: '19:30', activity: 'Scientific learning (DELETE mediocrity)', category: 'routine' },
    { time: '22:00', activity: 'Exercise', category: 'routine' },
    { time: '22:30', activity: 'Evening meal - 30 min', category: 'routine' },
    { time: '23:00', activity: 'Evening intellectual activities', category: 'routine' },
    { time: '02:30', activity: 'Review day', category: 'critical' },
    { time: '03:00', activity: 'Sleep preparation (DELETE devices)', category: 'critical' },
    { time: '03:30', activity: 'Sleep', category: 'routine' }
];

let scheduleStartTime = "12:30";

function confirmScheduleChange() {
    const input = document.getElementById('scheduleStartTime');
    const newTime = input.value;
    
    if (!newTime) return;

    // Check fixed lock status first
    const lockStatus = getFixedLockStatus();
    if (lockStatus.isLocked) {
        const errorAlert = document.createElement('div');
        errorAlert.className = 'fixed bottom-4 right-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded shadow-lg';
        errorAlert.innerHTML = `
            <p class="font-bold">Cannot change schedule</p>
            <p>${lockStatus.reason}</p>
            ${lockStatus.untilTime ? `<p>Unlocks at: ${lockStatus.untilTime}</p>` : ''}
        `;
        document.body.appendChild(errorAlert);
        setTimeout(() => errorAlert.remove(), 5000);
        
        // Reset input to current schedule time
        input.value = window.scheduleStartTime || '12:30';
        return;
    }

    // If not locked, proceed with confirmation
    document.getElementById('newTimeDisplay').textContent = newTime;
    document.getElementById('confirmScheduleModal').classList.remove('hidden');
}

function cancelScheduleChange() {
    // Hide modal
    document.getElementById('confirmScheduleModal').classList.add('hidden');
    
    // Reset input to current schedule time
    const input = document.getElementById('scheduleStartTime');
    input.value = window.scheduleStartTime || '12:30';
}

function applyScheduleChange() {
    const input = document.getElementById('scheduleStartTime');
    const newTime = input.value;
    
    try {
        // Update both localStorage and the global variable
        localStorage.setItem('scheduleStartTime', newTime);
        window.scheduleStartTime = newTime;
        
        // Reset wake tracking
        window.lastWakeupTime = null;
        window.isExtendedLock = false;
        
        const fixedLockData = JSON.parse(localStorage.getItem('fixedLockData') || '{}');
        fixedLockData.lastWakeupTime = null;
        localStorage.setItem('fixedLockData', JSON.stringify(fixedLockData));
        
        // Update UI
        updateSchedule();
        checkWakeupStatus();
        
        // Close both modals
        document.getElementById('confirmScheduleModal').classList.add('hidden');
        document.getElementById('scheduleSettingsPanel').classList.add('hidden');
        
        // Show success message
        const successAlert = document.createElement('div');
        successAlert.className = 'fixed bottom-4 right-4 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded shadow-lg';
        successAlert.textContent = 'Schedule updated successfully!';
        document.body.appendChild(successAlert);
        setTimeout(() => successAlert.remove(), 3000);
        
    } catch (error) {
        console.error('Error updating schedule:', error);
        const errorAlert = document.createElement('div');
        errorAlert.className = 'fixed bottom-4 right-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded shadow-lg';
        errorAlert.textContent = 'Error updating schedule: ' + error.message;
        document.body.appendChild(errorAlert);
        setTimeout(() => errorAlert.remove(), 3000);
    }
}


function toggleScheduleSettings() {
    const panel = document.getElementById('scheduleSettingsPanel');
    const input = document.getElementById('scheduleStartTime');
    
    if (panel.classList.contains('hidden')) {
        // When opening, set current value
        input.value = localStorage.getItem('scheduleStartTime') || '12:30';
    }
    
    panel.classList.toggle('hidden');
}

function updateSchedule() {
    const container = document.getElementById('scheduleTimeline');
    if (!container) return;

    const baseStartTime = new Date();
    const [baseHours, baseMinutes] = scheduleStartTime.split(':').map(Number);
    baseStartTime.setHours(baseHours, baseMinutes, 0, 0);

    const adjustedScheduleItems = scheduleItems.map(item => {
        const [itemHours, itemMinutes] = item.time.split(':').map(Number);
        const originalTime = new Date();
        originalTime.setHours(itemHours, itemMinutes, 0, 0);
        
        // Calculate time difference from base 12:30
        const baseTime = new Date();
        baseTime.setHours(12, 30, 0, 0);
        const timeDiff = originalTime - baseTime;
        
        // Apply difference to new start time
        const adjustedTime = new Date(baseStartTime.getTime() + timeDiff);
        
        return {
            ...item,
            time: adjustedTime.toLocaleTimeString('en-GB', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            })
        };
    });


    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes(); // Current time in minutes

    // Function to convert time string to minutes since midnight
    function timeToMinutes(timeStr) {
        const [hours, minutes] = timeStr.split(':').map(Number);
        return hours * 60 + minutes;
    }

    // Function to check if a time is the current activity
	function isCurrent(currentItemMinutes, nextItemMinutes) {
		// Handle midnight crossing for current time
		let comparableCurrentTime = currentTime;
		if (currentTime < currentItemMinutes && currentTime < 360) { // Before 6 AM
			comparableCurrentTime += 24 * 60;
		}

		// For the last item
		if (nextItemMinutes === undefined) {
			// Just check if we're exactly in this time slot
			return comparableCurrentTime >= currentItemMinutes && 
				comparableCurrentTime < currentItemMinutes + 30; // Assume 30 min duration for last item
		}

		// Handle midnight crossing for next time
		if (nextItemMinutes < currentItemMinutes) {
			nextItemMinutes += 24 * 60;
		}

		return comparableCurrentTime >= currentItemMinutes && 
			comparableCurrentTime < nextItemMinutes;
	}

    // Function to determine if a time has passed
    function isPast(timeInMinutes, nextTimeInMinutes) {
        if (isCurrent(timeInMinutes, nextTimeInMinutes)) return false;
        
        if (timeInMinutes < 360) { // Before 6 AM is considered "tomorrow"
            return currentTime >= timeInMinutes && currentTime < 360;
        } else {
            return currentTime >= timeInMinutes || currentTime < 360;
        }
    }

    container.innerHTML = `
        <div class="mb-6 p-4 bg-red-50 border-l-4 border-red-500">
            <p class="font-bold text-red-900">Critical Rules:</p>
            <ul class="mt-2 space-y-1 text-red-800">
                <li>• No devices during meals/preparation</li>
                <li>• Exact timing mandatory</li>
                <li>• Perfect focus required</li>
                <li>• Mark all in tracker</li>
            </ul>
        </div>
		${adjustedScheduleItems.map((item, index) => {
			const itemMinutes = timeToMinutes(item.time);
			const isLastItem = index === adjustedScheduleItems.length - 1;
			const nextItemMinutes = !isLastItem ? 
				timeToMinutes(adjustedScheduleItems[index + 1].time) : undefined;
			const isCurrentItem = isCurrent(itemMinutes, nextItemMinutes, isLastItem);
			const itemPassed = isPast(itemMinutes, nextItemMinutes);
            
            return `
                <div class="flex items-start space-x-4">
                    <div class="w-20 flex-shrink-0">
                        <span class="font-bold ${itemPassed && !isCurrentItem ? 'text-gray-400' : 'text-gray-900'}">
                            ${item.time}
                        </span>
                    </div>
                    <div class="flex-grow">
                        <div class="p-3 rounded-lg border ${
                            isCurrentItem 
                                ? 'bg-yellow-50 border-yellow-400 shadow-md' 
                                : itemPassed
                                    ? 'bg-gray-50 border-gray-200' 
                                    : item.category === 'critical'
                                        ? 'bg-red-50 border-red-200 shadow-sm'
                                        : 'bg-white border-gray-200 shadow-sm'
                        }">
                            <p class="${
                                isCurrentItem 
                                    ? 'text-yellow-900 font-bold'
                                    : itemPassed 
                                        ? 'text-gray-400' 
                                        : item.category === 'critical'
                                            ? 'text-red-900 font-bold tracking-wide'
                                            : 'text-gray-700'
                            }">${item.activity}</p>
                            ${!itemPassed && item.category === 'critical' ? `
                                <div class="mt-1 text-xs font-medium ${
                                    isCurrentItem ? 'text-yellow-800' : 'text-red-800'
                                }">
                                    Perfect execution required
                                </div>
                            ` : ''}
                            ${isCurrentItem ? `
                                <div class="mt-1 text-xs font-bold text-yellow-800">
                                    CURRENT TASK - EXECUTE NOW
                                </div>
                            ` : ''}
                        </div>
                    </div>
                </div>
            `;
        }).join('')}
    `;
}

// Rule violations configuration
const ruleViolations = [
	{ code: 'ai', label: 'AI used more than 3 times' },
    { code: 'news', label: 'General news' },
    { code: 'vid', label: 'Entertainment videos' },
    { code: 'inapp', label: 'Inappropriate video/imagery viewed' },
    { code: 'phone_time', label: 'Phone over 3 hours' },
    { code: 'phone_gray', label: 'Phone not in grayscale' },
    { code: 'phone_night', label: 'Phone used after learning hours' },
    { code: 'phone_work', label: 'Phone present during work' },
    { code: 'tabs', label: 'More than 5 tabs open' },
    { code: 'browse', label: 'Random browsing during development' },
    { code: 'sm', label: 'Social media' },
    { code: 'game', label: 'Gaming' }
];

// Tab counter functionality
function addTab() {
    currentTabs++;
    updateTabCounter();
}

function removeTab() {
    if (currentTabs > 0) {
        currentTabs--;
        updateTabCounter();
    }
}

function updateTabCounter() {
    const tabCount = document.getElementById('tabCount');
    const tabWarning = document.getElementById('tabWarning');
    const tabCounter = document.getElementById('tabCounter');
    
    tabCount.textContent = currentTabs;
    
    if (currentTabs > 5) {
        tabWarning.classList.remove('hidden');
        tabCounter.classList.add('warning');
        
        // Add violation automatically
        const violations = Array.from(document.querySelectorAll('.violation-checkbox'))
            .find(cb => cb.value === 'tabs');
        if (violations && !violations.checked) {
            violations.checked = true;
            updateHours();
        }
    } else {
        tabWarning.classList.add('hidden');
        tabCounter.classList.remove('warning');
    }
}

function analyzeProgress() {
    // Scientific Cognitive Performance Analysis
    const scientificAnalysis = {
        focusCapacity: {
            score: 0,
            explanation: '',
            recommendations: []
        },
        learningEfficiency: {
            score: 0,
            explanation: '',
            knowledgeGapAreas: []
        },
        mentalResistance: {
            score: 0,
            distractionVulnerabilities: [],
            recoveryPotential: 0
        },
        progressTrajectory: {
            shortTermTrend: '',
            longTermPotential: '',
            criticalInterventionPoints: []
        }
    };

    // Detailed log analysis with weighted scientific scoring
    const sortedLogs = [...logs].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Focus Capacity Calculation
    const focusMetrics = calculateFocusCapacity(sortedLogs);
    scientificAnalysis.focusCapacity = {
        score: focusMetrics.score,
        explanation: generateFocusExplanation(focusMetrics),
        recommendations: generateFocusRecommendations(focusMetrics)
    };

    // Learning Efficiency Assessment
    const learningMetrics = calculateLearningEfficiency(sortedLogs);
    scientificAnalysis.learningEfficiency = {
        score: learningMetrics.score,
        explanation: generateLearningExplanation(learningMetrics),
        knowledgeGapAreas: identifyLearningGaps(learningMetrics)
    };

    // Mental Resistance Analysis
    const resistanceMetrics = analyzeMentalResistance(sortedLogs);
    scientificAnalysis.mentalResistance = {
        score: resistanceMetrics.score,
        distractionVulnerabilities: identifyDistractionTriggers(resistanceMetrics),
        recoveryPotential: calculateRecoveryPotential(resistanceMetrics)
    };

    // Trajectory Projection
    scientificAnalysis.progressTrajectory = projectCognitiveTrajectory(sortedLogs);

    // Render advanced scientific analysis
    renderScientificAnalysis(scientificAnalysis);
}

function generateLearningExplanation(learningMetrics) {
    if (learningMetrics.score <= 10) {
        return `Critical learning deficiency. Immediate and comprehensive learning strategy reconstruction needed.`;
    } else if (learningMetrics.score < 50) {
        return `Minimal learning efficiency. Fundamental changes required in learning approach.`;
    } else if (learningMetrics.score < 75) {
        return `Developing learning capabilities with clear room for improvement.`;
    } else {
        return `Robust learning efficiency with consistent knowledge acquisition patterns.`;
    }
}

function calculateFocusCapacity(logs) {
    // Handle empty logs case
    if (!logs || logs.length === 0) {
        return {
            score: 0,
            continuousWorkSessions: { longestStreak: 0, interruptions: 0, averageStreak: 0 },
            violationImpact: 0,
            rawLogs: []
        };
    }

    const focusWindows = logs.map(log => ({
        development: log.development || 0,
        violations: log.violations || [],
        date: new Date(log.date)
    }));

    const continuousWorkSessions = calculateContinuousWorkSessions(focusWindows);
    const violationImpact = calculateViolationImpact(focusWindows);
    
    // Ensure a minimum baseline score
    const focusScore = Math.max(10, 100 - violationImpact - (continuousWorkSessions.interruptions * 10));

    return {
        score: focusScore,
        continuousWorkSessions,
        violationImpact,
        rawLogs: focusWindows
    };
}

function calculateContinuousWorkSessions(logs) {
    let longestStreak = 0;
    let currentStreak = 0;
    let interruptions = 0;

    logs.forEach(log => {
        if (log.development >= 4 && log.violations.length === 0) {
            currentStreak++;
            longestStreak = Math.max(longestStreak, currentStreak);
        } else {
            if (currentStreak > 0) interruptions++;
            currentStreak = 0;
        }
    });

    return {
        longestStreak,
        interruptions,
        averageStreak: logs.length > 0 ? longestStreak / logs.length : 0
    };
}

function calculateViolationImpact(logs) {
    const violationWeights = {
        'sm': 15,      // Social media
        'vid': 20,     // Entertainment videos
        'news': 10,    // News browsing
        'game': 25,    // Gaming
        'tabs': 5,     // Excess tabs
        'phone_work': 30, // Phone during work
        'browse': 15,  // Random browsing
        'inapp': 40    // Inappropriate content
    };

    return logs.reduce((total, log) => {
        const violationScore = log.violations.reduce((score, violation) => 
            score + (violationWeights[violation] || 10), 0);
        return total + violationScore;
    }, 0);
}

function generateFocusExplanation(metrics) {
    if (metrics.score <= 10) {
        return `Minimal cognitive focus capacity detected. Urgent intervention required to rebuild focus abilities.`;
    } else if (metrics.score < 50) {
        return `Low cognitive focus capacity. Significant improvements needed in maintaining sustained attention.`;
    } else if (metrics.score < 75) {
        return `Moderate focus capacity with potential for significant improvement.`;
    } else {
        return `Strong cognitive focus capacity demonstrating ability to maintain sustained attention.`;
    }
}

function generateFocusRecommendations(metrics) {
    const recommendations = [];
    if (metrics.score < 50) {
        recommendations.push("Implement stricter distraction blocking mechanisms");
        recommendations.push("Practice focused meditation to improve mental resilience");
    }
    if (metrics.continuousWorkSessions.interruptions > 5) {
        recommendations.push("Identify and eliminate primary distraction sources");
    }
    return recommendations;
}

function calculateLearningEfficiency(logs) {
    // Handle empty logs case
    if (!logs || logs.length === 0) {
        return {
            score: 0,
            averageDailyLearning: 0,
            totalLearningHours: 0,
            logs: []
        };
    }

    const learningLogs = logs.map(log => ({
        hours: log.learning || 0,
        date: new Date(log.date)
    }));

    const totalLearningHours = learningLogs.reduce((sum, log) => sum + log.hours, 0);
    const averageDailyLearning = totalLearningHours / logs.length;
    
    const consistencyScore = calculateLearningConsistency(learningLogs);
    const depthScore = estimateLearningDepth(averageDailyLearning);

    // Ensure a minimum baseline score
    const finalScore = Math.max(10, consistencyScore * depthScore / 100);

    return {
        score: finalScore,
        averageDailyLearning,
        totalLearningHours,
        logs: learningLogs
    };
}

function calculateLearningConsistency(logs) {
    if (logs.length === 0) return 0;
    
    const consistentDays = logs.filter(log => log.hours >= 1.5).length;
    return Math.max(10, (consistentDays / logs.length) * 100);
}

function estimateLearningDepth(averageHours) {
    // Score learning depth based on hours
    if (averageHours >= 2.5) return 100;  // Deep learning
    if (averageHours >= 1.5) return 75;   // Solid learning
    if (averageHours >= 1.0) return 50;   // Moderate learning
    if (averageHours >= 0.5) return 25;   // Minimal learning
    return 0;  // No meaningful learning
}

function identifyLearningGaps(learningMetrics) {
    const gaps = [];
    
    if (learningMetrics.averageDailyLearning < 1.0) {
        gaps.push("Insufficient daily learning time");
    }
    
    if (learningMetrics.score < 50) {
        gaps.push("Inconsistent learning pattern");
    }
    
    return gaps;
}

function analyzeMentalResistance(logs) {
    // Handle empty logs case
    if (!logs || logs.length === 0) {
        return {
            score: 50, // Neutral baseline
            violationTypes: {},
            totalViolations: 0
        };
    }

    const violationTypes = {};
    let totalViolations = 0;

    logs.forEach(log => {
        if (log.violations) {
            log.violations.forEach(violation => {
                violationTypes[violation] = (violationTypes[violation] || 0) + 1;
                totalViolations++;
            });
        }
    });

    // Calculate resistance score with baseline
    const resistanceScore = calculateResistanceScore(violationTypes, totalViolations);

    return {
        score: Math.max(10, resistanceScore),
        violationTypes,
        totalViolations
    };
}

function calculateResistanceScore(violationTypes, totalViolations) {
    const resistanceWeights = {
        'sm': 15,      // Social media
        'vid': 20,     // Entertainment videos
        'news': 10,    // News browsing
        'game': 25,    // Gaming
        'tabs': 5,     // Excess tabs
        'phone_work': 30, // Phone during work
        'browse': 15,  // Random browsing
        'inapp': 40    // Inappropriate content
    };

    // Calculate weighted violation impact
    const weightedViolations = Object.entries(violationTypes).reduce((total, [type, count]) => {
        return total + (resistanceWeights[type] || 10) * count;
    }, 0);

    // Base resistance score (100 - violation impact)
    let resistanceScore = Math.max(0, 100 - (weightedViolations / 10));

    return resistanceScore;
}

function identifyDistractionTriggers(resistanceMetrics) {
    const triggers = [];
    
    // Identify most frequent distractions
    const sortedViolations = Object.entries(resistanceMetrics.violationTypes)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3);

    sortedViolations.forEach(([type, count]) => {
        switch(type) {
            case 'sm':
                triggers.push(`High social media distraction (${count} instances)`);
                break;
            case 'vid':
                triggers.push(`Entertainment video vulnerability (${count} instances)`);
                break;
            case 'phone_work':
                triggers.push(`Workplace phone interference (${count} instances)`);
                break;
            default:
                triggers.push(`${type} distraction pattern (${count} instances)`);
        }
    });

    return triggers;
}

function calculateRecoveryPotential(resistanceMetrics) {
    // Higher score means better ability to recover from distractions
    const baseRecoveryScore = 100 - (resistanceMetrics.totalViolations * 10);
    return Math.max(0, baseRecoveryScore);
}

function projectCognitiveTrajectory(logs) {
    const sortedLogs = [...logs].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Analyze development and learning trends
    const devTrend = calculateTrend(sortedLogs.map(log => log.development || 0));
    const learningTrend = calculateTrend(sortedLogs.map(log => log.learning || 0));

    return {
        shortTermTrend: devTrend > 0 ? 'Improving' : 'Declining',
        longTermPotential: devTrend > 0 && learningTrend > 0 ? 'High' : 'Needs Intervention',
        criticalInterventionPoints: identifyCriticalPoints(sortedLogs)
    };
}

function calculateTrend(values) {
    if (values.length < 2) return 0;
    
    // Simple linear regression for trend
    const n = values.length;
    const sumX = values.reduce((sum, _, i) => sum + i, 0);
    const sumY = values.reduce((sum, val) => sum + val, 0);
    const sumXY = values.reduce((sum, val, i) => sum + i * val, 0);
    const sumXX = values.reduce((sum, _, i) => sum + i * i, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    return slope;
}

function identifyCriticalPoints(logs) {
    const criticalPoints = [];
    
    logs.forEach((log, index) => {
        // Look for significant drops in performance
        if (index > 0) {
            const prevLog = logs[index - 1];
            if ((prevLog.development >= 5 && log.development < 3) || 
                (prevLog.learning >= 1.5 && log.learning < 0.5)) {
                criticalPoints.push({
                    date: log.date,
                    type: 'Performance Drop',
                    details: `Significant decrease from ${prevLog.development}h dev to ${log.development}h dev`
                });
            }
        }
    });

    return criticalPoints;
}

function renderScientificAnalysis(analysis) {
    const container = document.getElementById('analysisContent');
    container.innerHTML = `
        <div class="grid md:grid-cols-2 gap-6">
            <div class="bg-blue-50 p-4 rounded-lg">
                <h3 class="font-bold text-blue-900 mb-3">Cognitive Focus Capacity</h3>
                <div class="bg-white p-3 rounded">
                    <p class="font-medium">Performance Score: ${analysis.focusCapacity.score.toFixed(2)}%</p>
                    <p class="text-sm text-gray-600 mt-2">${analysis.focusCapacity.explanation}</p>
                    <div class="mt-3">
                        <h4 class="font-semibold text-blue-700">Recommendations:</h4>
                        <ul class="list-disc pl-5 text-sm">
                            ${analysis.focusCapacity.recommendations.map(rec => `<li>${rec}</li>`).join('')}
                        </ul>
                    </div>
                </div>
            </div>
            
            <div class="bg-purple-50 p-4 rounded-lg">
                <h3 class="font-bold text-purple-900 mb-3">Mental Resistance Analysis</h3>
                <div class="bg-white p-3 rounded">
                    <p class="font-medium">Resistance Score: ${analysis.mentalResistance.score.toFixed(2)}</p>
                    <div class="mt-3">
                        <h4 class="font-semibold text-purple-700">Distraction Vulnerabilities:</h4>
                        <ul class="list-disc pl-5 text-sm">
                            ${analysis.mentalResistance.distractionVulnerabilities.map(v => `<li>${v}</li>`).join('') || 'No significant vulnerabilities detected'}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Add to existing event listeners
function switchTab(tabId) {
    // Existing tab switching logic
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    document.getElementById(tabId).classList.add('active');

    // If analysis tab, trigger scientific analysis
    if (tabId === 'analysis') {
        advancedProgressAnalysis();
    }
}

// Tab switching
function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    document.getElementById(tabId).classList.add('active');

    // If analysis tab, trigger analysis
    if (tabId === 'analysis') {
        analyzeProgress();
    }
}

// Add this helper function to compare wake times
function getWakeTimeStatus(wakeTime, scheduleTime) {
    if (!wakeTime || checkTimeEmpty(wakeTime)) return null;
    
    const [scheduleHours, scheduleMinutes] = scheduleTime.split(':').map(Number);
    const [wakeHours, wakeMinutes] = wakeTime.split(':').map(Number);
    
    // Convert both times to minutes for easier comparison
    const scheduleTotalMinutes = scheduleHours * 60 + scheduleMinutes;
    const wakeTotalMinutes = wakeHours * 60 + wakeMinutes;
    
    // Return status: -1 for early, 0 for on time, 1 for late
    if (Math.abs(wakeTotalMinutes - scheduleTotalMinutes) <= 5) {
        return 0; // Consider within 5 minutes as "on time"
    }
    return wakeTotalMinutes < scheduleTotalMinutes ? -1 : 1;
}

// Calendar functions
function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startingDay = firstDay.getDay();
    const totalDays = lastDay.getDate();
    const today = new Date().toISOString().split('T')[0];
    
    const calendar = document.getElementById('calendar');
    calendar.innerHTML = '';
    
    document.getElementById('currentMonth').textContent = 
        currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

    // Check if we're in deep/extended void
    const todayDev = logs.find(l => l.date === today)?.development || 0;
    const isInDeepVoid = todayDev < 2 && (
        document.documentElement.style.backgroundColor === '#600' || // Extended void
        document.documentElement.style.backgroundColor === '#930'    // Deep void
    );

    // Add empty cells for days before the first of the month
    for (let i = 0; i < startingDay; i++) {
        const emptyCell = document.createElement('div');
        emptyCell.className = 'day-cell min-h-[60px] sm:min-h-[80px] p-1';
        calendar.appendChild(emptyCell);
    }

    // Add cells for each day
    for (let day = 1; day <= totalDays; day++) {
        const cell = document.createElement('div');
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const dayLog = logs.find(log => log.date === dateStr);
        const isFriday = new Date(dateStr).getDay() === 5;
        const isFuture = dateStr > today;
        
        let status = getDayStatus(dayLog, isFriday);
        
        cell.className = `day-cell min-h-[60px] sm:min-h-[80px] p-1 border rounded 
            ${(isFuture || (isInDeepVoid && dateStr !== today)) ? 'opacity-50' : ''} 
            ${(isFuture || (isInDeepVoid && dateStr !== today)) ? 'cursor-not-allowed' : 'cursor-pointer'} 
            ${status.bgColor || 'bg-gray-50'} 
            ${isFriday ? 'bg-opacity-70 border-blue-200' : ''}
            ${dateStr === selectedDate ? 'ring-2 ring-blue-500 ring-offset-1' : ''}
            transition-all flex flex-col`;
        
        const content = document.createElement('div');
        content.className = 'flex-1 flex flex-col text-[11px] sm:text-xs';
        
        const dayNumber = document.createElement('div');
        dayNumber.className = 'font-medium';
        dayNumber.textContent = day;
        content.appendChild(dayNumber);
        
		if (dayLog) {
			const stats = document.createElement('div');
			stats.className = 'flex-1 flex flex-col justify-center gap-0.5';
			
			// Get wake time status
			const scheduleTime = localStorage.getItem('scheduleStartTime') || '12:30';
			const wakeStatus = getWakeTimeStatus(dayLog.wakeTime, scheduleTime);
			
			let wakeTimeDisplay = '';
			if (dayLog.wakeTime && !checkTimeEmpty(dayLog.wakeTime)) {
				const arrow = wakeStatus === -1 ? '↑' : 
							 wakeStatus === 1 ? '↓' : 
							 '→';
				const colorClass = wakeStatus === -1 ? 'text-green-500' : 
								  wakeStatus === 1 ? 'text-red-500' : 
								  'text-blue-500';
				wakeTimeDisplay = `<div class="${colorClass}">${arrow}</div>`;
			}
			
			stats.innerHTML = `
				${wakeTimeDisplay}
				<div class="${status.devColor}">D: ${dayLog.development}h</div>
				<div class="${status.learnColor}">L: ${dayLog.learning}h</div>
				${dayLog.violations.length ? `<div class="text-red-500">❌: ${dayLog.violations.length}</div>` : ''}
			`;
			content.appendChild(stats);
		}
        
        cell.appendChild(content);
        
        // Only add click handler if not future and not in deep void (or is today)
        if (!isFuture && (!isInDeepVoid || dateStr === today)) {
            cell.onclick = () => selectDate(dateStr);
        }
        
        calendar.appendChild(cell);
    }
}

function getDayStatus(log, isFriday) {
    if (!log) return {};

    const { development, learning, violations = [], wakeTime = '' } = log;
    
    // Filter violations - don't count certain violations on Friday
    const effectiveViolations = violations.filter(v => {
        if (!isFriday) return true;
        if (v.startsWith('phone_')) return true;
        return !['sm', 'vid', 'news', 'game'].includes(v);
    });
    
    // Calculate goals achieved
    const devGoal = development >= 5;
    const learningGoal = isFriday || learning >= 1.5;
    const noViolations = effectiveViolations.length === 0;
    const lateWake = wakeTime && new Date(`2000-01-01 ${wakeTime}`).getHours() > 14;
    
    let bgColor = 'bg-red-50'; // Failure
    
    if (development >= 5 && (isFriday || learning >= 1.5)) {
        if (noViolations) {
            if (development >= 6 || (!isFriday && learning >= 2.5)) {
                bgColor = lateWake ? 'bg-yellow-100' : 'bg-purple-100'; // Super
            } else {
                bgColor = lateWake ? 'bg-yellow-100' : 'bg-green-100'; // Success
            }
        } else {
            bgColor = 'bg-yellow-100'; // Bad
        }
    }
    
    return {
        bgColor,
        wakeTime,
        devColor: devGoal ? 'text-green-600' : 'text-red-600',
        learnColor: learningGoal ? 'text-green-600' : 'text-red-600',
        lateWake
    };
}

function changeMonth(increment) {
    currentDate.setMonth(currentDate.getMonth() + increment);
    renderCalendar();
}

function setVoidStateUI(level) {
    // Reset all UI states first
    document.body.className = '';
    document.querySelectorAll('input, button').forEach(el => {
        el.disabled = false;
        el.style.opacity = '1';
    });
    document.querySelectorAll('.day-cell').forEach(cell => {
        cell.onclick = cell.originalOnClick; // Restore original click handlers
    });

    if (level === 3) {
        // Extended void
        document.body.className = 'bg-red-900';
        // Disable all inputs except today's development hours
        document.querySelectorAll('input, button, .day-cell').forEach(el => {
            if (!el.id?.includes('devHours') && 
                !el.id?.includes('voidStateAlert')) {
                el.disabled = true;
                el.style.opacity = '0.5';
                if (el.classList.contains('day-cell')) {
                    el.originalOnClick = el.onclick; // Store original handler
                    el.onclick = null; // Remove click handler
                }
            }
        });
    } else if (level === 2) {
        // Deep void
        document.body.className = 'bg-orange-900';
    } else if (level === 1) {
        // Early void
        document.body.className = 'bg-yellow-900';
    }

    // Add transition
    document.body.style.transition = 'background-color 1s ease';
}

function setVoidBackground(voidLevel) {
    // Set both body and html background
    document.documentElement.style.backgroundColor = 
        voidLevel === 3 ? '#600' :  // Dark red
        voidLevel === 2 ? '#930' :  // Dark orange
        voidLevel === 1 ? '#975' : ''; // Dark yellow
    document.body.style.backgroundColor = 
        voidLevel === 3 ? '#600' :  // Dark red
        voidLevel === 2 ? '#930' :  // Dark orange
        voidLevel === 1 ? '#975' : '';
    document.body.style.transition = 'background-color 1s ease';
    document.documentElement.style.transition = 'background-color 1s ease';

    // Make card backgrounds more visible against dark background
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        card.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
        card.style.transition = 'background-color 1s ease';
    });

	// // Reset all UI states first
    // document.body.className = '';
    // document.querySelectorAll('input, button').forEach(el => {
    //     el.disabled = false;
    //     el.style.opacity = '1';
    // });
    // document.querySelectorAll('.day-cell').forEach(cell => {
    //     cell.onclick = cell.originalOnClick; // Restore original click handlers
    // });

    // if (voidLevel === 3) {
    //     // Extended void
    //     // Disable all inputs except today's development hours
    //     document.querySelectorAll('input, button, .day-cell').forEach(el => {
    //         if (!el.id?.includes('devHours') && 
    //             !el.id?.includes('voidStateAlert')) {
    //             el.disabled = true;
    //             el.style.opacity = '0.5';
    //             if (el.classList.contains('day-cell')) {
    //                 el.originalOnClick = el.onclick; // Store original handler
    //                 el.onclick = null; // Remove click handler
    //             }
    //         }
    //     });
    // } 
}

function checkTimeEmpty(sortedLog) {
	return (
	(new Date(`2000-01-01 ${sortedLog.wakeTime}`).getHours()) == 0 && 
	(new Date(`2000-01-01 ${sortedLog.wakeTime}`).getMinutes()) == 0 &&
	(new Date(`2000-01-01 ${sortedLog.wakeTime}`).getSeconds()) == 0);
}

function calculateHoursSinceLastLog() {
    const sortedLogs = [...logs].sort((a, b) => new Date(b.date) - new Date(a.date));
    const lastLogDate = sortedLogs[0]?.date ? new Date(sortedLogs[0].date) : null;
    return lastLogDate ? 
        (new Date() - lastLogDate) / (1000 * 60 * 60) : 48;
}

function calculateConsecutiveLowDays() {
    const sortedLogs = [...logs].sort((a, b) => new Date(b.date) - new Date(a.date));
    let count = 0;
    for (const log of sortedLogs) {
        if (!log || log.development < 2) count++;
        else break;
    }
    return count;
}

function calculateConsecutiveMissedWakes() {
    const sortedLogs = [...logs].sort((a, b) => new Date(b.date) - new Date(a.date));
    const savedStartTime = getSavedStartTime();
    const [baseHours, baseMinutes] = savedStartTime.split(':').map(Number);
    
    let count = 0;
    for (const log of sortedLogs) {
        if (!log || !log.wakeTime || checkTimeEmpty(log) ||
            new Date(`2000-01-01 ${log.wakeTime}`).getHours() > baseHours + 2 ||
            (new Date(`2000-01-01 ${log.wakeTime}`).getHours() === baseHours + 2 &&
             new Date(`2000-01-01 ${log.wakeTime}`).getMinutes() > baseMinutes)) {
            count++;
        } else break;
    }
    return count;
}

function checkMissedWakeTime() {
    const sortedLogs = [...logs].sort((a, b) => new Date(b.date) - new Date(a.date));
    const savedStartTime = getSavedStartTime();
    const [baseHours, baseMinutes] = savedStartTime.split(':').map(Number);
    
    return !sortedLogs[0] || !sortedLogs[0].wakeTime || checkTimeEmpty(sortedLogs[0]) ||
        new Date(`2000-01-01 ${sortedLogs[0].wakeTime}`).getHours() > baseHours + 2 ||
        (new Date(`2000-01-01 ${sortedLogs[0].wakeTime}`).getHours() === baseHours + 2 &&
         new Date(`2000-01-01 ${sortedLogs[0].wakeTime}`).getMinutes() > baseMinutes);
}

function applyVoidState(voidLevel) {
    // Reset all UI states first
    document.body.style.pointerEvents = 'auto';
    
    // Apply void state background styles
    document.documentElement.style.backgroundColor = 
        voidLevel === 3 ? '#600' :
        voidLevel === 2 ? '#930' :
        voidLevel === 1 ? '#975' : '';
    document.body.style.backgroundColor = document.documentElement.style.backgroundColor;

    // Show/hide void message
    const voidStateEl = document.getElementById('voidStateAlert');
    if (voidStateEl) {
        if (voidLevel > 0) {
            voidStateEl.style.display = 'block';
			if (voidLevel === 3) {
                showExtendedVoidAlert(
                    document.getElementById('devHours')?.value || 0,
                    calculateHoursSinceLastLog(),
                    calculateConsecutiveLowDays(),
                    calculateConsecutiveMissedWakes()
                );
            } else if (voidLevel === 2) {
                showDeepVoidAlert(
                    document.getElementById('devHours')?.value || 0,
                    calculateHoursSinceLastLog(),
                    calculateConsecutiveLowDays(),
                    calculateConsecutiveMissedWakes(),
                    checkMissedWakeTime()
                );
            } else {
                showEarlyVoidAlert(
                    document.getElementById('devHours')?.value || 0,
                    calculateConsecutiveLowDays(),
                    checkMissedWakeTime()
                );
            }
        } else {
            voidStateEl.style.display = 'none';
        }
    }

    if (voidLevel >= 2) {
        // Force today's date
        const today = new Date().toISOString().split('T')[0];
        if (selectedDate !== today) {
            selectedDate = today;
            selectDate(today);
        }

        // Disable elements in deep/extended void
        const elementsToDisable = [
            '#calendar',
            '#learnHours',
            '#violations',
            '.day-cell',
            '.violation-item',
            'button[onclick^="switchTab"]',
        ];

        elementsToDisable.forEach(selector => {
            document.querySelectorAll(selector).forEach(el => {
                el.style.pointerEvents = 'none';
                el.style.opacity = '0.5';
            });
        });

        // Keep critical elements accessible
        const devHours = document.getElementById('devHours');
        if (devHours) {
            devHours.classList.add('emergency-action');
            devHours.style.pointerEvents = 'auto';
            devHours.style.opacity = '1';
        }

        // Keep data button accessible
        const dataButton = document.querySelector('button[onclick="showDataModal()"]');
        if (dataButton) {
            dataButton.style.pointerEvents = 'auto';
            dataButton.style.opacity = '1';
        }
    } else {
        // Re-enable everything when not in deep/extended void
        const elementsToEnable = [
            '#calendar',
            '#learnHours',
            '#violations',
            '.day-cell',
            '.violation-item',
            'button[onclick^="switchTab"]',
        ];

        elementsToEnable.forEach(selector => {
            document.querySelectorAll(selector).forEach(el => {
                el.style.cssText = ''; // Clear all inline styles
            });
        });

        // Remove emergency styling
        document.getElementById('devHours')?.classList.remove('emergency-action');
    }
}

// Separate void level calculation from state application
function calculateVoidLevel() {
    const today = new Date().toISOString().split('T')[0];
    const todayLog = logs.find(log => log.date === today);
    const todayDev = todayLog?.development || 0;
    const savedStartTime = getSavedStartTime();
    const [baseHours, baseMinutes] = savedStartTime.split(':').map(Number);

    let voidLevel = 0;
    const sortedLogs = [...logs].sort((a, b) => new Date(b.date) - new Date(a.date));

    // Calculate hours since last log
    const lastLogDate = sortedLogs[0]?.date ? new Date(sortedLogs[0].date) : null;
    const hoursSinceLastLog = lastLogDate ? 
        (new Date() - lastLogDate) / (1000 * 60 * 60) : 48;

    // Count consecutive low development days with weight
    let weightedLowDays = 0;
    for(let i = 0; i < Math.min(sortedLogs.length, 5); i++) {
        if(!sortedLogs[i] || sortedLogs[i].development < 2) {
            weightedLowDays += (5 - i) * 0.5;
        }
    }

    // Count consecutive missed wakes with weight
    let weightedMissedWakes = 0;
    for(let i = 0; i < Math.min(sortedLogs.length, 5); i++) {
        if (!sortedLogs[i] || !sortedLogs[i].wakeTime || checkTimeEmpty(sortedLogs[i]) ||
            new Date(`2000-01-01 ${sortedLogs[i].wakeTime}`).getHours() > baseHours + 2)
        {
            weightedMissedWakes += (5 - i) * 0.5;
        }
    }

    // Determine void level based on conditions
    if (hoursSinceLastLog > 72 || weightedLowDays > 6 || weightedMissedWakes > 6) {
        voidLevel = 3; // Extended void
    } else if (hoursSinceLastLog > 48 || weightedLowDays > 4 || weightedMissedWakes > 4) {
        voidLevel = 2; // Deep void
    } else if (weightedLowDays > 2 || 
        (checkMissedWakeTime() && weightedLowDays > 1)) {
        voidLevel = 1; // Early void
    }

    // Check for void exit conditions
    if (voidLevel === 3 && todayDev >= 0.5) voidLevel = 0;
    else if (voidLevel === 2 && todayDev >= 2) voidLevel = 0;
    else if (voidLevel === 1 && todayDev >= 3) voidLevel = 0;

    return voidLevel;
}


function checkVoidState() {
    const newVoidLevel = calculateVoidLevel();
    if (newVoidLevel !== currentVoidLevel) {
        currentVoidLevel = newVoidLevel;
        if (currentVoidLevel >= 2) {
            const today = new Date().toISOString().split('T')[0];
            selectedDate = today;
            selectDate(today);
        }
        applyVoidState(currentVoidLevel);
    }
}

function showExtendedVoidAlert(todayDev, hoursSinceLastLog, consecutiveLowDays, consecutiveMissedWakes) {
    const voidStateEl = document.getElementById('voidStateAlert');
    voidStateEl.className = 'bg-red-50 p-4 rounded-lg border-2 border-red-500';
    voidStateEl.innerHTML = `
        <div class="text-2xl font-bold mb-4 text-red-700">‼️ EXTENDED VOID DETECTED ‼️</div>
	`;
	if (hoursSinceLastLog > 72) {	
		voidStateEl.innerHTML += `
        <div class="bg-red-900 text-white p-3 rounded mb-4">
			PATTERN DETECTED: ${Math.round(hoursSinceLastLog)} hours passed since last log
        </div>
	`;
	}
	if (consecutiveMissedWakes > 3) {	
		voidStateEl.innerHTML += `
        <div class="bg-red-900 text-white p-3 rounded mb-4">
			PATTERN DETECTED: ${consecutiveMissedWakes} missed wakes
        </div>
	`;
	}
	if (consecutiveLowDays > 3) {
		voidStateEl.innerHTML += `
        <div class="bg-red-900 text-white p-3 rounded mb-4">
            PATTERN DETECTED: ${consecutiveLowDays} days with low development
        </div>
	`;
	}
	voidStateEl.innerHTML += `
        <div class="space-y-4">
            <div class="bg-black text-white p-4 rounded">
                <div class="font-bold">EMERGENCY PROTOCOL:</div>
                <div>1. CLOSE ALL ENTERTAINMENT IMMEDIATELY</div>
                <div>2. GO TO DEVELOPMENT COMPUTER</div>
                <div>3. OPEN SINGLE DEVELOPMENT FILE</div>
                <div>4. START 25-MINUTE TIMER</div>
            </div>
            <div class="bg-green-700 text-white p-4 rounded">
                <div class="font-bold">TO EXIT VOID STATE:</div>
                <div>Log at least 0.5 hours of development</div>
                <div class="mt-2">Current: ${todayDev} hours</div>
                <div class="mt-2">Remaining: ${Math.max(0.5 - todayDev, 0)} hours</div>
            </div>
        </div>
    `;
    voidStateEl.style.display = 'block';
}

function showDeepVoidAlert(todayDev, hoursSinceLastLog, consecutiveLowDays, consecutiveMissedWakes, missedWakeTime) {
    const voidStateEl = document.getElementById('voidStateAlert');
    voidStateEl.className = 'p-4 rounded-lg border-4';
    voidStateEl.style.backgroundColor = '#ffebe6';  // Light red/orange background
    voidStateEl.style.borderColor = '#ff3300';      // Bright orange border
    voidStateEl.innerHTML = `
        <div class="text-xl font-bold mb-4" style="color: #cc3300;">⚠️ DEEP VOID ACTIVE ⚠️</div>
	`;
	if (hoursSinceLastLog > 48) {	
		voidStateEl.innerHTML += `
        <div style="background-color: #1a1a1a; color: white;" class="p-3 rounded mb-4">
			PATTERN DETECTED: ${Math.round(hoursSinceLastLog)} hours passed since last log
        </div>
	`;
	}
	if (consecutiveMissedWakes > 2) {	
		voidStateEl.innerHTML += `
        <div style="background-color: #1a1a1a; color: white;" class="p-3 rounded mb-4">
			PATTERN DETECTED: ${consecutiveMissedWakes} missed wakes
        </div>
	`;
	}
	if (consecutiveLowDays > 2) {
		voidStateEl.innerHTML += `
        <div style="background-color: #1a1a1a; color: white;" class="p-3 rounded mb-4">
            PATTERN DETECTED: ${consecutiveLowDays} days with low development
        </div>
	`;
	}
	if (consecutiveLowDays > 1 && missedWakeTime) {
		voidStateEl.innerHTML += `
        <div style="background-color: #1a1a1a; color: white;" class="p-3 rounded mb-4">
            PATTERN DETECTED: ${consecutiveLowDays} days with low development and a missed wake
        </div>
	`;
	}
	voidStateEl.innerHTML += `
        <div class="space-y-4">
            <div style="background-color: #1a1a1a; color: white;" class="p-4 rounded">
                <div class="font-bold">REQUIRED ACTIONS:</div>
                <div>1. Close all non-development tabs</div>
                <div>2. Move phone to different room</div>
                <div>3. Start development timer</div>
            </div>
            <div style="background-color: #006600;" class="text-white p-4 rounded">
                <div class="font-bold">TO EXIT VOID STATE:</div>
                <div>Log at least 2 hours development</div>
                <div class="mt-2">Current: ${todayDev} hours</div>
                <div class="mt-2">Remaining: ${Math.max(2 - todayDev, 0)} hours</div>
            </div>
        </div>
    `;
    voidStateEl.style.display = 'block';
}

function showEarlyVoidAlert(todayDev, consecutiveLowDays, missedWakeTime) {
    const voidStateEl = document.getElementById('voidStateAlert');
    voidStateEl.className = 'bg-yellow-50 p-4 rounded-lg border-2 border-yellow-500';
    voidStateEl.innerHTML = `
        <div class="text-lg font-bold mb-3 text-yellow-800">⚠️ VOID WARNING ⚠️</div>
	`;
	if (consecutiveLowDays >= 1) {
		voidStateEl.innerHTML += `
        <div class="bg-yellow-100 p-3 rounded mb-4">
            PATTERN DETECTED: ${consecutiveLowDays} days with low development
        </div>
	`;
	}
	if (missedWakeTime) {
		voidStateEl.innerHTML += `
        <div class="bg-yellow-100 p-3 rounded mb-4">
            PATTERN DETECTED: missed wake
        </div>
	`;
	}
    voidStateEl.innerHTML +=
	`    <div class="space-y-4">
            <div class="bg-yellow-100 p-3 rounded">
                <div class="font-bold">IMMEDIATE ACTIONS:</div>
                <div>1. Log current development hours</div>
                <div>2. Close entertainment sources</div>
                <div>3. Begin next development task</div>
            </div>
            <div class="bg-green-700 text-white p-4 rounded">
                <div class="font-bold">TO EXIT VOID STATE:</div>
                <div>Log at least 3 hours development</div>
                <div class="mt-2">Current: ${todayDev} hours</div>
                <div class="mt-2">Remaining: ${Math.max(3 - todayDev, 0)} hours</div>
            </div>
        </div>
    `;
    voidStateEl.style.display = 'block';
}

// Hours and violations management
function updateHours() {
    const development = parseFloat(document.getElementById('devHours').value) || 0;
    const learning = parseFloat(document.getElementById('learnHours').value) || 0;
    const wakeTimeInput = document.getElementById('wakeTimeInput');
    const wakeTime = wakeTimeInput ? wakeTimeInput.value : '';
    
    // Find existing log to preserve violations
    const existingLog = logs.find(l => l.date === selectedDate);
    const violations = existingLog ? existingLog.violations : [];
    
    const log = { 
        date: selectedDate, 
        development, 
        learning, 
        wakeTime,
        violations 
    };
    
    const existingIndex = logs.findIndex(l => l.date === selectedDate);
    
    if (existingIndex >= 0) {
        logs[existingIndex] = log;
    } else {
        logs.push(log);
    }
    
    saveData();
    renderCalendar();
    updateStreaks();
    renderViolations();
    checkVoidState();
}

document.getElementById('devHours').addEventListener('input', (e) => {
    updateHours();
    checkVoidState();
});

document.getElementById('learnHours').addEventListener('input', (e) => {
    updateHours();
    checkVoidState();
});


function selectDate(date) {
    selectedDate = date;
    const log = logs.find(l => l.date === date) || { 
        date, 
        development: '', 
        learning: '', 
        wakeTime: '',
        violations: [] 
    };
    
    document.getElementById('devHours').value = log.development;
    document.getElementById('learnHours').value = log.learning;
    document.getElementById('wakeTimeInput').value = log.wakeTime || '';
    
    renderCalendar();
    renderViolations();
    checkVoidState();
}

function renderViolations() {
    const container = document.getElementById('violations');
    if (!container) return;
    
    container.innerHTML = '';
    
    const today = new Date().toISOString().split('T')[0];
    const currentLog = logs.find(l => l.date === selectedDate) || { violations: [] };
    const todayDev = logs.find(l => l.date === today)?.development || 0;
    const isInVoid = todayDev < 2 && (
        document.documentElement.style.backgroundColor === '#600' || // Extended void
        document.documentElement.style.backgroundColor === '#930'    // Deep void
    );
    
    ruleViolations.forEach(rule => {
        const div = document.createElement('div');
        const isChecked = currentLog.violations.includes(rule.code);
        
        div.className = `violation-item flex items-center space-x-2 p-2 rounded cursor-pointer hover:bg-gray-100 ${
            isChecked ? 'bg-red-50' : ''
        }`;
        
        // Only apply void state styling if we're looking at today
        if (isInVoid && selectedDate === today) {
            div.style.pointerEvents = 'none';
            div.style.opacity = '0.5';
        }
        
        div.innerHTML = `
            ${isChecked 
                ? '<svg class="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>'
                : '<svg class="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>'
            }
            <span class="${isChecked ? 'text-red-500' : ''}">${rule.label}</span>
        `;
        
        div.onclick = () => {
            if (!(isInVoid && selectedDate === today)) {
                toggleViolation(rule, currentLog);
            }
        };
        
        container.appendChild(div);
    });
}

function toggleViolation(rule, currentLog) {
    const isChecked = currentLog.violations.includes(rule.code);
    let newViolations;
    
    if (isChecked) {
        newViolations = currentLog.violations.filter(v => v !== rule.code);
    } else {
        newViolations = [...currentLog.violations, rule.code];
        // Show recovery protocol when adding a violation
        const violationToRecovery = {
            'ai': 'ai',
            'sm': 'entertainment',
            'vid': 'entertainment',
            'news': 'news',
            'game': 'entertainment',
            'tabs': 'tabs',
            'phone_work': 'phone_work',
            'phone_time': 'phone_time',
            'phone_gray': 'phone_gray',
            'phone_night': 'phone_night',
            'browse': 'browse',
            'inapp': 'inapp'
        };
        switchTab('recovery');
        showRecovery(violationToRecovery[rule.code]);
    }
    
    const updatedLog = {
        ...currentLog,
        violations: newViolations
    };
    
    const logIndex = logs.findIndex(l => l.date === selectedDate);
    if (logIndex >= 0) {
        logs[logIndex] = updatedLog;
    } else {
        logs.push(updatedLog);
    }
    
    saveData();
    renderCalendar();
    renderViolations();
    updateStreaks();
}

// Provide a default start time if nothing is saved
function getSavedStartTime() {
    const savedStartTime = localStorage.getItem('scheduleStartTime');
    return savedStartTime || "12:30";
}

// Streak calculation
function calculateStreak(violationType) {
    const savedStartTime = getSavedStartTime();
    const [baseHours, baseMinutes] = savedStartTime.split(':').map(Number);
    if (!logs.length) return 0;
    
    const sortedLogs = [...logs].sort((a, b) => new Date(b.date) - new Date(a.date));
    let streak = 0;
    const today = new Date();
    
    for (const log of sortedLogs) {
        if (log.violations && log.violations.includes(violationType)) break;
        streak++;
    }
    
    return streak;
}

function updateStreaks() {
    const videoStreak = calculateStreak('vid');
    const cleanStreak = calculateStreak('inapp');
    const newsStreak = calculateStreak('news');
	const aiStreak = calculateStreak('ai');
    
	function formatStreak(days) {
		let text = days;
		if (days >= 30) text = `⚡️ ${days} ⚡️ 👑 🏆`;
		else if (days >= 14) text = `🌟 ${days} 🌟 🏆`;
		else if (days >= 7) text = `🌟 ${days} 🌟`;
		return `${text}${days === 1 ? ' day' : ' days'}`;
	}

    function getStreakClass(days) {
        if (days >= 7) return 'bg-emerald-100 text-emerald-600 font-bold';
        if (days >= 3) return 'bg-blue-100 text-blue-600';
        return 'bg-gray-100 text-gray-600';
    }
    
    ['video', 'clean', 'news', 'ai'].forEach((type, index) => {
        const days = [videoStreak, cleanStreak, newsStreak, aiStreak][index];
        const element = document.getElementById(`${type}Streak`);
        element.textContent = formatStreak(days);
        element.className = `streak-badge ${getStreakClass(days)}`;
    });
}

function renderCalendarCell(date, dayLog, isFriday) {
    const status = getDayStatus(dayLog, isFriday);
    const isSelected = date === selectedDate;
    const today = new Date().toISOString().split('T')[0];
    const isToday = date === today;
    
    let cellClass = `day-cell p-1 border rounded cursor-pointer 
        ${status.bgColor || 'bg-gray-50'}
        ${isFriday ? 'friday' : ''}
        ${isSelected ? 'ring-2 ring-blue-500 ring-offset-1' : ''}
        ${isToday ? 'border-2 border-blue-400' : ''}
        transition-all`;

    const dayNumber = new Date(date).getDate();
    
    let content = `
        <div class="h-full flex flex-col text-xs">
            <div class="font-medium">${dayNumber}</div>
    `;
    
    if (dayLog) {
		const stats = document.createElement('div');
		stats.className = 'flex-1 flex flex-col justify-center gap-0.5';
		stats.innerHTML = `
			${dayLog.wakeTime ? `<div class="${status.lateWake ? 'text-red-500' : 'text-blue-500'}">↑${dayLog.wakeTime}</div>` : ''}
			<div class="${status.devColor}">D: ${dayLog.development}h</div>
			<div class="${status.learnColor}">L: ${dayLog.learning}h</div>
			${dayLog.violations.length ? `<div class="text-red-500">❌: ${dayLog.violations.length}</div>` : ''}
		`;
		content.appendChild(stats);
	}
    
    content += '</div>';
    
    return { class: cellClass, content };
}

// Recovery system
function showRecovery(type) {
    const modal = document.getElementById('recoveryModal');
    const title = document.getElementById('recoveryTitle');
    const content = document.getElementById('recoveryContent');
    
    const recoverySteps = {
		ai: {
			title: "AI Overuse Recovery",
			consequence: "Excessive AI usage atrophies problem-solving abilities and creates dependency, making independent thinking progressively harder. Each shortcut permanently weakens your cognitive capabilities.",
			immediate: [
			  'Close all AI tools immediately',
			  'Document current problem state',
			  'Return to manual problem-solving',
			  'Write down exact trigger for overuse'
			],
			analysis: [
			  'What made you exceed the quota?',
			  'Which problems could you have solved alone?',
			  'What fundamental knowledge is missing?',
			  'How did this affect your thinking capacity?'
			],
			prevention: [
			  'Study fundamentals related to overuse areas',
			  'Create better documentation references',
			  'Build personal knowledge base',
			  'Practice similar problems manually'
			]
		},
        entertainment: {
            title: 'Entertainment/Social Media Recovery',
            consequence: "Every minute of entertainment rewires your brain against deep work, builds dopamine addiction, and makes focused work progressively harder.",
            immediate: [
                'Close all entertainment platforms immediately',
                'Clear browser history and cookies',
                'Log out of all social media accounts',
                'Document exact trigger for this violation'
            ],
            analysis: [
                'What emotional state led to seeking entertainment?',
                'Which protection measures failed?',
                'What productive alternative was available?',
                'How long before violation was caught?'
            ],
            prevention: [
                'Update blocking software settings',
                'Create new protective barriers',
                'Plan specific productive alternatives',
                'Set stricter Friday entertainment limits'
            ]
        },
        phone_work: {
            title: 'Phone During Work Recovery',
            consequence: "Phone presence during work reduces cognitive capacity even when turned off. Each glance destroys 30 minutes of accumulated focus.",
            immediate: [
                'Move phone to different room immediately',
                'Document what brought phone to workspace',
                'Clear any notifications that drew attention',
                'Reset work environment completely'
            ],
            analysis: [
                'Why was phone brought to workspace?',
                'What essential function was needed?',
                'How can this be handled differently?',
                'What triggered checking the phone?'
            ],
            prevention: [
                'Strengthen physical barriers to phone access',
                'Set up alternative solutions for needed functions',
                'Create stronger morning phone placement habits',
                'Update phone lockdown system'
            ]
        },
        phone_time: {
            title: 'Excessive Phone Time Recovery',
            consequence: "Each hour over limit fragments attention span and builds addictive usage patterns that persist for days.",
            immediate: [
                'Put phone away immediately',
                'Document current usage time',
                'Clear all active apps and notifications',
                'Plan remaining day without phone'
            ],
            analysis: [
                'What caused extended usage?',
                'Which apps consumed most time?',
                'What productive time was lost?',
                'How did limit get exceeded?'
            ],
            prevention: [
                'Set up stricter time tracking',
                'Install additional usage limiters',
                'Create alternate activities plan',
                'Remove problematic apps'
            ]
        },
        phone_gray: {
            title: 'Phone Color Mode Recovery',
            consequence: "Color screen triggers dopamine responses that make deep work feel unrewarding and build screen addiction.",
            immediate: [
                'Enable grayscale mode immediately',
                'Document how long color was enabled',
                'Reset all visual app interfaces',
                'Clear colorful notifications'
            ],
            analysis: [
                'Why was grayscale disabled?',
                'Which apps needed color?',
                'How did this affect focus?',
                'What temptations increased?'
            ],
            prevention: [
                'Make grayscale toggle harder to access',
                'Find grayscale alternatives for needed apps',
                'Set up color mode time restrictions',
                'Create reminder system for checks'
            ]
        },
        phone_night: {
            title: 'Late Phone Usage Recovery',
            consequence: "Using phone after learning disrupts knowledge consolidation and creates attention residue that carries into next day.",
            immediate: [
                'Put phone away in distant room',
                'Document time of usage',
                'Clear all engaging content',
                'Set up physical barriers'
            ],
            analysis: [
                'What triggered late usage?',
                'What could have been done instead?',
                'How will this affect tomorrow?',
                'What systems failed?'
            ],
            prevention: [
                'Create stronger evening protocols',
                'Set up physical phone boundaries',
                'Plan evening activities without phone',
                'Install stricter time blocks'
            ]
        },
        news: {
            title: 'News Browsing Recovery',
            consequence: "News creates artificial anxiety and urgency, filling mind with information you can't act on while stealing mental energy from real work.",
            immediate: [
                'Close all news sites and apps',
                'Clear news feed algorithms',
                'Reset browser suggestions',
                'Document what led to news seeking'
            ],
            analysis: [
                'What triggered news seeking?',
                'Was it genuine information need?',
                'How much time was lost?',
                'What anxiety was created?'
            ],
            prevention: [
                'Update news blocking rules',
                'Set up technical news feeds only',
                'Create clear information protocols',
                'Plan better information sources'
            ]
        },
        tabs: {
            title: 'Excess Tabs Recovery',
            consequence: "Each open tab represents mental overhead, dividing your brain's processing power and reducing cognitive capability.",
            immediate: [
                'Close all non-essential tabs immediately',
                'Document needed references',
                'Reset to five-tab limit',
                'Clear browser session'
            ],
            analysis: [
                'What led to tab multiplication?',
                'Which tabs were actually needed?',
                'How did this affect focus?',
                'What work was impacted?'
            ],
            prevention: [
                'Review tab management system',
                'Set up better bookmarking',
                'Create reference documentation',
                'Install tab limiters'
            ]
        },
        browse: {
            title: 'Random Browsing Recovery',
            consequence: "Random browsing trains your mind to seek constant novelty, making sustained focus on complex problems feel unbearable.",
            immediate: [
                'Close all non-work browser windows',
                'Clear recent history',
                'Reset to focused workspace',
                'Document time wasted'
            ],
            analysis: [
                'What triggered the browsing?',
                'Was there an underlying need?',
                'How did focus break down?',
                'What work was avoided?'
            ],
            prevention: [
                'Update browsing restrictions',
                'Create clearer work pathways',
                'Set up better break protocols',
                'Install stronger blockers'
            ]
        },
        inapp: {
            title: 'Inappropriate Content Recovery',
            consequence: "Inappropriate content creates lasting mental images that poison focus and create recurring distractions.",
            immediate: [
                'Close all media immediately',
                'Clear all history and caches',
                'Reset recommendation algorithms',
                'Document what led to this'
            ],
            analysis: [
                'What circumstances enabled this?',
                'Which protections failed?',
                'How was content encountered?',
                'What triggers were present?'
            ],
            prevention: [
                'Strengthen content blocking',
                'Update site restrictions',
                'Create better avoidance protocols',
                'Install additional protections'
            ]
        }
    };
    
    const recovery = recoverySteps[type];
    title.textContent = recovery.title;
    
    content.innerHTML = `
        <div class="space-y-4">
            <div class="bg-red-50 p-4 rounded">
                <p class="text-red-700 font-medium">${recovery.consequence}</p>
            </div>
            <div>
                <h4 class="font-medium text-blue-700 mb-2">Immediate Actions:</h4>
                <ul class="space-y-2">
                    ${recovery.immediate.map(step => `
                        <li class="flex items-center gap-2">
                            <svg class="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                            ${step}
                        </li>
                    `).join('')}
                </ul>
            </div>
            <div>
                <h4 class="font-medium text-purple-700 mb-2">Analysis Required:</h4>
                <ul class="space-y-2">
                    ${recovery.analysis.map(step => `
                        <li class="flex items-center gap-2">
                            <svg class="h-5 w-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                            ${step}
                        </li>
                    `).join('')}
                </ul>
            </div>
            <div>
                <h4 class="font-medium text-green-700 mb-2">Prevention Measures:</h4>
                <ul class="space-y-2">
                    ${recovery.prevention.map(step => `
                        <li class="flex items-center gap-2">
                            <svg class="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                            </svg>
                            ${step}
                        </li>
                    `).join('')}
                </ul>
            </div>
        </div>
    `;
    
    modal.classList.remove('hidden');
}

function closeRecovery() {
    document.getElementById('recoveryModal').classList.add('hidden');
}

// Data management
function showDataModal() {
    document.getElementById('dataModal').classList.remove('hidden');
}

function closeDataModal() {
    document.getElementById('dataModal').classList.add('hidden');
}

function exportData() {
    const data = JSON.stringify(logs);
    const textarea = document.getElementById('importData');
    textarea.value = data;
}

function importDataFromText() {
    try {
        const textarea = document.getElementById('importData');
        const data = JSON.parse(textarea.value);
        logs = Array.isArray(data) ? data : [];
        saveData();
        renderCalendar();
        updateStreaks();
        closeDataModal();
        alert('Data imported successfully!');
    } catch (error) {
        alert('Error importing data. Please check the format.');
    }
}

// Data persistence
function saveData() {
    localStorage.setItem('focusTrackerLogs', JSON.stringify(logs));
}

function loadData() {
    const savedData = localStorage.getItem('focusTrackerLogs');
    if (savedData) {
        try {
            logs = JSON.parse(savedData);
        } catch (e) {
            logs = []; // Set to empty array if parsing fails
        }
    } else {
        logs = []; // Set to empty array if no data exists
    }
    selectDate(selectedDate);
}


// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    renderCalendar();
    renderViolations();
    updateStreaks();
    checkVoidState();
    initializeFixedLock();

    // Load saved schedule start time
    const savedStartTime = localStorage.getItem('scheduleStartTime');
    if (savedStartTime) {
        scheduleStartTime = savedStartTime;
        const scheduleStartInput = document.getElementById('scheduleStartTime');
        if (scheduleStartInput) {
            scheduleStartInput.value = savedStartTime;
        }
    }
    updateSchedule();

    // Update schedule every minute
    setInterval(updateSchedule, 60000);

    // Set interval to check void state
    setInterval(checkVoidState, 60000);  // Check every minute

    // Check wake-up status every minute only if wakeupButton exists
    if (document.getElementById('wakeupButton')) {
        setInterval(checkWakeupStatus, 60000);
    }

	setInterval(() => {
        const newVoidLevel = calculateVoidLevel();
        if (newVoidLevel !== currentVoidLevel) {
            currentVoidLevel = newVoidLevel;
            applyVoidState(currentVoidLevel);
        }
    }, 30000);

    lockPhoneBtn = document.getElementById('lockPhoneBtn');
    lockPhoneBtn.addEventListener('click', handlePhoneLock);
    updateLockButtonState();

	// Force 24-hour format on time inputs
    document.querySelectorAll('input[type="time"][data-force24="true"]').forEach(input => {
        input.addEventListener('focus', function() {
            this.setAttribute('type', 'text');
            this.setAttribute('type', 'time');
        });
    });
});

function confirmNewLock() {
    if (confirm('Are you sure you want to set a new phone lock?')) {
        const timeInput = document.getElementById('unlockTimeInput');
        if (!timeInput.value) return;
        
        const code = generateLockCode(timeInput.value);
        const lockContent = document.getElementById('lockContent');
        
        lockContent.innerHTML = `
            <div class="bg-green-100 p-4 rounded">
                <p class="font-bold">Your new lock code is:</p>
                <p class="text-3xl font-bold text-center my-4">${code}</p>
                <p class="text-sm text-red-600 mb-4">
                    Write this code down and use it to lock your phone.
                    This code will not be shown again until the selected unlock time.
                </p>
                <div class="flex items-center justify-center gap-2 border-t pt-4">
                    <label class="flex items-center gap-2 cursor-pointer select-none">
                        <div class="relative">
                            <input type="checkbox" id="confirmCodeSaved" class="sr-only">
                            <div class="w-10 h-5 bg-gray-200 rounded-full"></div>
                            <div class="dot absolute left-0.5 top-0.5 bg-white w-4 h-4 rounded-full transition"></div>
                        </div>
                        <span>I have saved this code securely</span>
                    </label>
                </div>
            </div>
        `;
        
        // Enable close button only after checkbox is checked
        const checkbox = document.getElementById('confirmCodeSaved');
        checkbox.addEventListener('change', function() {
            if (this.checked) {
                setTimeout(() => {
                    if (confirm('Close the window?')) {
                        closePhoneLockModal();
                    } else {
                        this.checked = false;
                    }
                }, 100);
            }
        });
    }
}

function generateLockCode(selectedTime) {
    // Characters to use (excluding similar-looking characters)
    const charset = "23456789abcdefghjklmnpqrstuvwxyz";
    let code = '';
    
    // Generate 10 random characters
    for (let i = 0; i < 10; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        code += charset[randomIndex];
    }
    
    const now = new Date();
    const [hours, minutes] = selectedTime.split(':');
    const unlockTime = new Date(now);
    unlockTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    
    // If selected time is earlier than current time, set it for next day
    if (unlockTime <= now) {
        unlockTime.setDate(unlockTime.getDate() + 1);
    }
    
    const lockData = {
        code: btoa(code),
        unlockTime: unlockTime.getTime(),
        isLocked: true
    };
    
    localStorage.setItem('phoneLockData', JSON.stringify(lockData));
    return code;
}

function checkExtendTime() {
    const timeInput = document.getElementById('unlockTimeInput');
    const warning = document.getElementById('timeWarning');
    const extendButton = document.getElementById('extendButton');
    const lockData = JSON.parse(localStorage.getItem('phoneLockData'));
    
    if (!timeInput.value || !lockData) return;
    
    const [hours, minutes] = timeInput.value.split(':');
    let selectedTime = new Date();
    selectedTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    
    const now = new Date();
    const currentLockTime = new Date(lockData.unlockTime);

    // Create normalized times for same-day comparison
    const normalizedSelected = new Date();
    normalizedSelected.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    
    const normalizedNow = new Date();
    normalizedNow.setHours(now.getHours(), now.getMinutes(), 0, 0);
    
    const normalizedLock = new Date();
    normalizedLock.setHours(currentLockTime.getHours(), currentLockTime.getMinutes(), 0, 0);
    
    // Determine if selected time should be for tomorrow
    if (normalizedSelected <= normalizedNow) {
        // If time of day has passed
        selectedTime.setDate(selectedTime.getDate() + 1);
    } else if (normalizedSelected > normalizedLock && currentLockTime.getDate() > selectedTime.getDate()) {
        // If time is after lock but lock is tomorrow - this means over 24h
        selectedTime.setDate(selectedTime.getDate() + 1);
    } else if (normalizedSelected < normalizedLock && currentLockTime.getDate() == selectedTime.getDate()) {
        // If time is before lock, but passed now
        selectedTime.setDate(selectedTime.getDate() + 1);
    }

    // Set initial state for UI elements
    warning.classList.add('hidden');
    extendButton.disabled = false;
    extendButton.classList.remove('opacity-50');

    // Check conditions in order of priority
    const timeDiff = selectedTime.getTime() - now.getTime();
    if (timeDiff > 24 * 60 * 60 * 1000) {
        warning.textContent = "Cannot lock for more than 24 hours";
        warning.classList.remove('hidden');
        extendButton.disabled = true;
        extendButton.classList.add('opacity-50');
    } else if (selectedTime <= currentLockTime) {
        warning.textContent = "Selected time must be later than current lock time";
        warning.classList.remove('hidden');
        extendButton.disabled = true;
        extendButton.classList.add('opacity-50');
    } else if (selectedTime.getDate() > now.getDate()) {
        warning.textContent = "This time today has passed - lock will be set for tomorrow";
        warning.classList.remove('hidden');
    }
}

function extendLock() {
    const timeInput = document.getElementById('unlockTimeInput');
    const extendButton = document.getElementById('extendButton');
    
    if (!timeInput.value || extendButton.disabled) return;
    
    const lockData = JSON.parse(localStorage.getItem('phoneLockData'));
    if (!lockData) return;
    
    const [hours, minutes] = timeInput.value.split(':');
    const newUnlockTime = new Date();
    newUnlockTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    
    // If the time has already passed today, set it for tomorrow
    const now = new Date();
    if (newUnlockTime <= now) {
        newUnlockTime.setDate(newUnlockTime.getDate() + 1);
    }

    // Double check it's actually later than current lock
    if (newUnlockTime <= new Date(lockData.unlockTime)) {
        return;
    }
    
    lockData.unlockTime = newUnlockTime.getTime();
    localStorage.setItem('phoneLockData', JSON.stringify(lockData));
    handlePhoneLock();
}

function handlePhoneLock() {
    const modal = document.getElementById('phoneLockModal');
    const content = document.getElementById('lockContent');
    
    const lockStatus = getPhoneLockStatus();
    const currentTime = new Date().toLocaleTimeString('en-GB', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
    });
    const timeInput = lockStatus.isLocked ? 
        new Date(lockStatus.unlockTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) :
        currentTime;

    if (!lockStatus.isLocked) {
        content.innerHTML = `
            <div class="space-y-4">
                <div class="mb-4">
                    <label class="block text-sm font-medium mb-1">Lock until:</label>
                    <div class="flex gap-2">
                        <input type="time" id="unlockTimeInput" value="${timeInput}" class="w-full border rounded p-2" data-force24="true" step="60">
                        <button onclick="setNewLock()" class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                            Set Lock
                        </button>
                    </div>
                    <p id="timeWarning" class="text-sm text-yellow-600 mt-1 hidden"></p>
                </div>
            </div>
        `;

        const timeInputEl = document.getElementById('unlockTimeInput');
        if (timeInputEl) {
            timeInputEl.addEventListener('change', checkSetNewLockTime);
            checkSetNewLockTime(); // Check initial value
        }
    } else if (lockStatus.isLocked && !lockStatus.canUnlock) {
		content.innerHTML = `
			<div class="bg-red-50 p-4 rounded">
				<p class="font-bold text-red-800">Phone is locked</p>
				<p class="text-red-600 mb-4">Code will be revealed in: ${getTimeRemaining(lockStatus.unlockTime)}</p>
				<div>
					<label class="block text-sm font-medium mb-1">Extend lock until:</label>
					<div class="flex gap-2">
						<input type="time" id="unlockTimeInput" value="${timeInput}" class="border rounded p-2" data-force24="true" step="60">
						<button onclick="extendLock()" id="extendButton"
								class="px-3 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-opacity"
								disabled>
							Extend
						</button>
					</div>
					<p id="timeWarning" class="text-sm text-yellow-600 mt-1 hidden"></p>
				</div>
			</div>
		`;

		// Add time input listener and initial check
		const timeInputEl = document.getElementById('unlockTimeInput');
		if (timeInputEl) {
			timeInputEl.addEventListener('change', checkExtendTime);
			// Also check initial value
			checkExtendTime();
		}
	}		 else if (lockStatus.isLocked && lockStatus.canUnlock) {
		// Phone can be unlocked
		content.innerHTML = `
			<div class="bg-green-100 p-4 rounded">
				<p class="font-bold">Your unlock code is:</p>
				<p class="text-3xl font-bold text-center my-4">${lockStatus.code}</p>
				<p class="text-sm text-gray-600">You can now unlock your phone.</p>
				<div class="mt-4 text-center">
					<button onclick="resetLock()" class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
						Reset Lock
					</button>
				</div>
			</div>
		`;
    } else {
        // Generate new lock
        content.innerHTML = `
            <div class="space-y-4">
                <div class="mb-4">
                    <label class="block text-sm font-medium mb-1">Lock until:</label>
                    <div class="flex gap-2">
                        <input type="time" id="unlockTimeInput" value="${timeInput}" class="w-full border rounded p-2" data-force24="true" step="60">
                        <button onclick="setNewLock()" class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                            Set Lock
                        </button>
                    </div>
                    <p id="timeWarning" class="text-sm text-yellow-600 mt-1 hidden">
                        This time today has passed - lock will be set for tomorrow
                    </p>
                </div>
            </div>
        `;
    }
    
    // Add time input listener and initial check
	const timeInputEl = document.getElementById('unlockTimeInput');
	if (timeInputEl) {
		timeInputEl.addEventListener('change', checkExtendTime);
		// Also check initial value
		checkExtendTime();
	}
    
    modal.classList.remove('hidden');
}

function setNewLock() {
    const timeInput = document.getElementById('unlockTimeInput');
    if (!timeInput.value) return;

    // Check if the time is valid first
    const [hours, minutes] = timeInput.value.split(':');
    const selectedTime = new Date();
    selectedTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    
    const now = new Date();
    if (selectedTime <= now) {
        selectedTime.setDate(selectedTime.getDate() + 1);
    }

    // Calculate time difference
    const timeDiff = selectedTime.getTime() - now.getTime();
    if (timeDiff > 24 * 60 * 60 * 1000) {
        alert("Cannot lock for more than 24 hours");
        return;
    }

    // Format time in 24-hour system
    const timeStr = selectedTime.toLocaleTimeString('en-GB', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false
    });
    const dateStr = selectedTime.toLocaleDateString([], { 
        weekday: 'long',
        month: 'long',
        day: 'numeric'
    });

    const confirmMessage = 
        `WARNING: You are about to lock your phone until ${timeStr} on ${dateStr}\n\n` +
        `This means:\n` +
        `- You will not be able to access your phone until then\n` +
        `- The lock code will be hidden until the unlock time\n` +
        `- This action cannot be undone without the code\n\n` +
        `Are you absolutely sure you want to proceed?`;

    if (confirm(confirmMessage)) {
        // Generate and show the code
        const code = generateLockCode(timeInput.value);
        const lockContent = document.getElementById('lockContent');
        
        lockContent.innerHTML = `
            <div class="bg-green-100 p-4 rounded">
                <div class="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                    <div class="flex">
                        <div class="flex-shrink-0">
                            <svg class="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                            </svg>
                        </div>
                        <div class="ml-3">
                            <p class="text-sm text-yellow-700">
                                Write this code down immediately. It will not be shown again until ${timeStr} on ${dateStr}.
                            </p>
                        </div>
                    </div>
                </div>
                <p class="font-bold text-lg text-center">Your new lock code is:</p>
                <p class="text-3xl font-bold text-center my-4 bg-white p-4 rounded border-2 border-green-300">${code}</p>
                <div class="flex items-center justify-center gap-2 border-t pt-4 mt-4">
                    <label class="flex items-center gap-2 cursor-pointer select-none">
                        <div class="relative">
                            <input type="checkbox" id="confirmCodeSaved" class="sr-only">
                            <div class="w-10 h-5 bg-gray-200 rounded-full"></div>
                            <div class="dot absolute left-0.5 top-0.5 bg-white w-4 h-4 rounded-full transition"></div>
                        </div>
                        <span>I have written down this code securely</span>
                    </label>
                </div>
            </div>
        `;
    }
}

function checkSetNewLockTime() {
    const timeInput = document.getElementById('unlockTimeInput');
    const warning = document.getElementById('timeWarning');
    const setLockButton = document.querySelector('button');
    
    if (!timeInput.value) return;
    
    const [hours, minutes] = timeInput.value.split(':');
    let selectedTime = new Date();
    selectedTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    
    const now = new Date();
    if (selectedTime <= now) {
        selectedTime.setDate(selectedTime.getDate() + 1);
    }

    // Reset UI elements
    warning.classList.add('hidden');
    setLockButton.disabled = false;
    setLockButton.classList.remove('opacity-50');

    // Check time difference
    const timeDiff = selectedTime.getTime() - now.getTime();
    if (timeDiff > 24 * 60 * 60 * 1000) {
        warning.textContent = "Cannot lock for more than 24 hours";
        warning.classList.remove('hidden');
        setLockButton.disabled = true;
        setLockButton.classList.add('opacity-50');
    } else if (selectedTime.getDate() > now.getDate()) {
        warning.textContent = "This time today has passed - lock will be set for tomorrow";
        warning.classList.remove('hidden');
    }
}

function resetLock() {
    localStorage.removeItem('phoneLockData');
    handlePhoneLock();
}

function confirmResetLock() {
    if (confirm('Are you sure you want to reset the current lock?')) {
        resetLock();
    }
}

function getPhoneLockStatus() {
    const lockData = JSON.parse(localStorage.getItem('phoneLockData'));
    if (!lockData) return { isLocked: false };
    
    const now = new Date().getTime();
    const canUnlock = now >= lockData.unlockTime;
    
    return {
        isLocked: lockData.isLocked,
        canUnlock: canUnlock,
        unlockTime: lockData.unlockTime,
        code: canUnlock ? atob(lockData.code) : null
    };
}

function getTimeRemaining(unlockTime) {
    const now = new Date().getTime();
    const remaining = unlockTime - now;
    
    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
}

function updateLockButtonState() {
    const lockStatus = getPhoneLockStatus();
    if (lockStatus.isLocked) {
        const unlockTimeStr = new Date(lockStatus.unlockTime).toLocaleTimeString('en-GB', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
        lockPhoneBtn.textContent = lockStatus.canUnlock ? 
            'Show Unlock Code' : 
            `Locked until ${unlockTimeStr}`;
        lockPhoneBtn.classList.add('bg-gray-500');
        lockPhoneBtn.classList.remove('bg-blue-500');
    } else {
        lockPhoneBtn.textContent = 'Generate Phone Lock Code';
        lockPhoneBtn.classList.add('bg-blue-500');
        lockPhoneBtn.classList.remove('bg-gray-500');
    }
}


function closePhoneLockModal() {
    // If showing a new code, require checkbox confirmation
    const checkbox = document.getElementById('confirmCodeSaved');
    if (checkbox && !checkbox.checked) {
        alert('Please confirm that you have written down the code before closing.');
        return;
    }
    
    document.getElementById('phoneLockModal').classList.add('hidden');
}


function initializeFixedLock() {
    const fixedLockData = JSON.parse(localStorage.getItem('fixedLockData') || '{}');
    if (fixedLockData.code) {
        fixedLockCode = fixedLockData.code;
        lastWakeupTime = fixedLockData.lastWakeupTime;
    } else {
        // First time initialization
        renewFixedLock();
        // Set lastWakeupTime to now to prevent immediate lock
        lastWakeupTime = new Date().toISOString();
        isExtendedLock = false;
        
        localStorage.setItem('fixedLockData', JSON.stringify({
            code: fixedLockCode,
            lastWakeupTime,
            missedWakeTime: null
        }));
    }
    checkWakeupStatus();
}

function renewFixedLock() {
    const charset = "23456789abcdefghjklmnpqrstuvwxyz";
    let code = '';
    for (let i = 0; i < 10; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        code += charset[randomIndex];
    }
    fixedLockCode = code;
    
    localStorage.setItem('fixedLockData', JSON.stringify({
        code: fixedLockCode,
        lastWakeupTime
    }));
    
    showFixedLockModal();
}

function showFixedLockModal() {
    const modal = document.getElementById('fixedLockModal');
    const content = document.getElementById('fixedLockContent');
    const renewBtn = document.getElementById('renewFixedLockBtn');
    
    const lockStatus = getFixedLockStatus();
    
    if (lockStatus.isLocked) {
        content.innerHTML = `
            <div class="bg-red-50 p-4 rounded">
                <p class="font-bold text-red-800">Lock is active</p>
                <p class="text-red-600 mb-2">${lockStatus.reason}</p>
                ${lockStatus.untilTime ? `<p class="text-red-600">Unlock time: ${lockStatus.untilTime}</p>` : ''}
            </div>
        `;
        renewBtn.classList.add('hidden');
    } else {
        content.innerHTML = `
            <div class="bg-green-100 p-4 rounded">
                <p class="font-bold">Your fixed lock code is:</p>
                <p class="text-3xl font-bold text-center my-4">${fixedLockCode}</p>
                <p class="text-sm text-gray-600">This code remains constant until renewed.</p>
            </div>
        `;
        renewBtn.classList.remove('hidden');
    }
    
    modal.classList.remove('hidden');
}

function checkWakeupStatus() {
    const wakeupButton = document.getElementById('wakeupButton');
    if (!wakeupButton) return; // Early return if element not found

    const now = new Date();
    const savedStartTime = localStorage.getItem('scheduleStartTime') || "12:30";
    const [wakeHours, wakeMinutes] = savedStartTime.split(':').map(Number);
    
    const wakeTime = new Date(now);
    wakeTime.setHours(wakeHours, wakeMinutes, 0, 0);
    
    const wakeWindowStart = new Date(wakeTime);
    wakeWindowStart.setHours(wakeTime.getHours() - 1);
    const wakeWindowEnd = new Date(wakeTime);
    wakeWindowEnd.setHours(wakeTime.getHours() + 1);

    const fixedLockData = JSON.parse(localStorage.getItem('fixedLockData') || '{}');
    const lastWakeDate = fixedLockData.lastWakeupTime ? new Date(fixedLockData.lastWakeupTime) : null;
    const isWokenUpToday = lastWakeDate && 
        lastWakeDate.toDateString() === now.toDateString();

    if (now >= wakeWindowStart && now <= wakeWindowEnd && !isWokenUpToday) {
        wakeupButton.classList.remove('hidden');
        isExtendedLock = false;
        
        // Apply pointer-events-none to everything except the overlay
        document.querySelectorAll('body > *:not(#wakeupButton)').forEach(element => {
            element.style.pointerEvents = 'none';
        });
    } else {
        wakeupButton.classList.add('hidden');
        // Restore pointer events
        document.querySelectorAll('body > *').forEach(element => {
            element.style.pointerEvents = '';
        });
        
        if (now > wakeWindowEnd && !isWokenUpToday) {
            isExtendedLock = true;
            fixedLockData.missedWakeTime = wakeTime.toISOString();
            localStorage.setItem('fixedLockData', JSON.stringify(fixedLockData));
        }
    }
}

function getFixedLockStatus() {
    const now = new Date();
    const savedStartTime = localStorage.getItem('scheduleStartTime') || "12:30";
    const [wakeHours, wakeMinutes] = savedStartTime.split(':').map(Number);
    
    const wakeTime = new Date(now);
    wakeTime.setHours(wakeHours, wakeMinutes, 0, 0);
    
    const wakeWindowStart = new Date(wakeTime);
    wakeWindowStart.setHours(wakeTime.getHours() - 1);
    const wakeWindowEnd = new Date(wakeTime);
    wakeWindowEnd.setHours(wakeTime.getHours() + 1);

    const fixedLockData = JSON.parse(localStorage.getItem('fixedLockData') || '{}');

    // Check if in wake window
    if (now >= wakeWindowStart && now <= wakeWindowEnd) {
        const lastWakeDate = fixedLockData.lastWakeupTime ? new Date(fixedLockData.lastWakeupTime) : null;
        const isWokenUpToday = lastWakeDate && 
            lastWakeDate.toDateString() === now.toDateString();

        if (!isWokenUpToday) {
            return {
                isLocked: true,
                reason: "Wake-up confirmation required",
                untilTime: wakeWindowEnd.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', hour12: false})
            };
        }
    }

    // Check penalty period
    if (fixedLockData.missedWakeTime) {
        const penaltyEnd = new Date(new Date(fixedLockData.missedWakeTime).getTime() + (3 * 60 * 60 * 1000));
        if (now <= penaltyEnd) {
            return {
                isLocked: true,
                reason: "Penalty lock: Wake-up window missed",
                untilTime: penaltyEnd.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', hour12: false})
            };
        } else {
            fixedLockData.missedWakeTime = null;
            localStorage.setItem('fixedLockData', JSON.stringify(fixedLockData));
        }
    }

    if (now > wakeTime) {
        wakeTime.setDate(wakeTime.getDate() + 1);
    }

    const todayWakeTime = new Date(now);
    todayWakeTime.setHours(wakeHours, wakeMinutes, 0, 0);
    const sleepTime = new Date(todayWakeTime.getTime() + (15 * 60 * 60 * 1000));
    
    if ((now >= sleepTime && now.getDate() === sleepTime.getDate()) || 
        (now <= wakeTime && now.getDate() === wakeTime.getDate())) {
        return {
            isLocked: true,
            reason: "Locked during sleep hours",
            untilTime: wakeTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', hour12: false})
        };
    }
    
    return { isLocked: false };
}

function confirmWakeup() {
    const fixedLockData = JSON.parse(localStorage.getItem('fixedLockData') || '{}');
    
    lastWakeupTime = new Date().toISOString();
    isExtendedLock = false;
    
    fixedLockData.lastWakeupTime = lastWakeupTime;
    fixedLockData.missedWakeTime = null;  // Clear missed wake time
    
    localStorage.setItem('fixedLockData', JSON.stringify(fixedLockData));
    document.getElementById('wakeupButton').classList.add('hidden');

    // Restore pointer events to all body elements
    document.querySelectorAll('body > *').forEach(element => {
        element.style.pointerEvents = '';
    });

    // Additional check to ensure UI is fully unlocked
    checkWakeupStatus();
}


function closeFixedLockModal() {
    document.getElementById('fixedLockModal').classList.add('hidden');
}

setInterval(() => {
    updateLockButtonState();
}, 60000); // Update every minute
