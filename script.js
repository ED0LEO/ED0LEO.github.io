// State management
let currentDate = new Date();
let selectedDate = new Date().toISOString().split('T')[0];
let logs = [];
let currentTabs = 0;
let lockPhoneBtn;

const scheduleItems = [
    { time: '12:30', activity: 'Wake (DELETE weakness)', category: 'critical' },
    { time: '12:45', activity: 'Morning routine (DELETE comfort)', category: 'routine' },
    { time: '13:30', activity: 'Breakfast - 30 min', category: 'routine' },
    { time: '13:45', activity: 'Preparation for work', category: 'routine' },
    { time: '14:00', activity: 'Development begins (DELETE distractions)', category: 'critical' },
    { time: '16:30', activity: 'Meal break - 30 min', category: 'routine' },
    { time: '17:00', activity: 'Continue development', category: 'critical' },
    { time: '19:30', activity: 'Scientific learning', category: 'routine' },
    { time: '22:00', activity: 'Exercise', category: 'routine' },
    { time: '22:30', activity: 'Evening meal - 30 min', category: 'routine' },
    { time: '23:00', activity: 'Evening intellectual activities', category: 'routine' },
    { time: '02:30', activity: 'Review day', category: 'critical' },
    { time: '03:00', activity: 'Sleep preparation (DELETE devices)', category: 'critical' },
    { time: '03:30', activity: 'Sleep', category: 'routine' }
];

let scheduleStartTime = "12:30";

function toggleScheduleSettings() {
    const panel = document.getElementById('scheduleSettingsPanel');
    panel.classList.toggle('hidden');
}

function updateScheduleStartTime() {
    const input = document.getElementById('scheduleStartTime');
    const newStartTime = input.value;
    
    // Save to localStorage
    localStorage.setItem('scheduleStartTime', newStartTime);
    scheduleStartTime = newStartTime;
    
    // Update schedule
    updateSchedule();
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

// Tab switching
function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    document.getElementById(tabId).classList.add('active');
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
            ${isFuture ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} 
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
            stats.innerHTML = `
                <div class="${status.devColor}">D: ${dayLog.development}h</div>
                <div class="${status.learnColor}">L: ${dayLog.learning}h</div>
                ${dayLog.violations.length ? `<div class="text-red-500">❌: ${dayLog.violations.length}</div>` : ''}
            `;
            content.appendChild(stats);
        }
        
        cell.appendChild(content);
        if (!isFuture) {
            cell.onclick = () => selectDate(dateStr);
        }
        calendar.appendChild(cell);
    }
}

function getDayStatus(log, isFriday) {
    if (!log) return {};

    const { development, learning, violations = [] } = log;
    
    // Filter violations - don't count certain violations on Friday
    const effectiveViolations = violations.filter(v => {
        if (!isFriday) return true;
        // Phone violations always count, even on Friday
        if (v.startsWith('phone_')) return true;
        return !['sm', 'vid', 'news', 'game'].includes(v);
    });
    
    // Calculate goals achieved
    const devGoal = development >= 5;
    const learningGoal = isFriday || learning >= 1.5;
    const noViolations = effectiveViolations.length === 0;
    
    let bgColor = 'bg-red-50'; // Failure
    
    if (development >= 5 && (isFriday || learning >= 1.5)) {
        if (noViolations) {
            if (development >= 6 || (!isFriday && learning >= 2.5)) {
                bgColor = 'bg-purple-100'; // Super
            } else {
                bgColor = 'bg-green-100'; // Success
            }
        } else {
            bgColor = 'bg-yellow-100'; // Bad
        }
    }
    
    return {
        bgColor,
        devColor: devGoal ? 'text-green-600' : 'text-red-600',
        learnColor: learningGoal ? 'text-green-600' : 'text-red-600'
    };
}

function changeMonth(increment) {
    currentDate.setMonth(currentDate.getMonth() + increment);
    renderCalendar();
}

// Hours and violations management
function updateHours() {
    const development = parseFloat(document.getElementById('devHours').value) || 0;
    const learning = parseFloat(document.getElementById('learnHours').value) || 0;
    
    // Find existing log to preserve violations
    const existingLog = logs.find(l => l.date === selectedDate);
    const violations = existingLog ? existingLog.violations : [];
    
    const log = { date: selectedDate, development, learning, violations };
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
}

function selectDate(date) {
    selectedDate = date;
    const log = logs.find(l => l.date === date) || { 
        date, 
        development: '', 
        learning: '', 
        violations: [] 
    };
    
    document.getElementById('devHours').value = log.development;
    document.getElementById('learnHours').value = log.learning;
    
    renderCalendar();
    renderViolations();  // Make sure violations are updated for the selected date
}

function renderViolations() {
    const container = document.getElementById('violations');
    container.innerHTML = '';
    
    // Use selectedDate instead of today's date
    const currentLog = logs.find(l => l.date === selectedDate) || { violations: [] };
    
    ruleViolations.forEach(rule => {
        const div = document.createElement('div');
        const isChecked = currentLog.violations.includes(rule.code);
        
        div.className = `flex items-center space-x-2 p-2 rounded cursor-pointer hover:bg-gray-100 ${
            isChecked ? 'bg-red-50' : ''
        }`;
        
        div.innerHTML = `
            ${isChecked 
                ? '<svg class="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>'
                : '<svg class="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>'
            }
            <span class="${isChecked ? 'text-red-500' : ''}">${rule.label}</span>
        `;
        
        div.onclick = () => {
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
                date: selectedDate,
                development: parseFloat(document.getElementById('devHours').value) || 0,
                learning: parseFloat(document.getElementById('learnHours').value) || 0,
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
        };
        
        container.appendChild(div);
    });
}

// Streak calculation
function calculateStreak(violationType) {
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
        content += `
            <div class="flex-1 flex flex-col justify-center">
                <div class="${status.devColor}">D: ${dayLog.development}h</div>
                <div class="${status.learnColor}">L: ${dayLog.learning}h</div>
                ${dayLog.violations.length ? 
                    `<div class="text-red-500">❌: ${dayLog.violations.length}</div>` : 
                    ''}
            </div>
        `;
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
        logs = JSON.parse(savedData);
        selectDate(selectedDate);
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    renderCalendar();
    renderViolations();
    updateStreaks();

	// Load saved schedule start time
    const savedStartTime = localStorage.getItem('scheduleStartTime');
    if (savedStartTime) {
        scheduleStartTime = savedStartTime;
        document.getElementById('scheduleStartTime').value = savedStartTime;
    }
    updateSchedule();

    // Update schedule every minute
    setInterval(updateSchedule, 60000);

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
    const code = Math.random().toString().substring(2, 8);
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

setInterval(() => {
    updateLockButtonState();
}, 60000); // Update every minute
