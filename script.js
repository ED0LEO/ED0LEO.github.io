// State management
let currentDate = new Date();
let selectedDate = new Date().toISOString().split('T')[0];
let logs = [];
let currentTabs = 0;
let lockPhoneBtn;

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
    const violations = Array.from(document.querySelectorAll('.violation-checkbox:checked'))
        .map(cb => cb.value);
    
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

	// Initialize phone lock button
    lockPhoneBtn = document.getElementById('lockPhoneBtn');
    lockPhoneBtn.addEventListener('click', handlePhoneLock);
    updateLockButtonState();
});

function convertOldData(oldFormat) {
    return oldFormat.split(';').map(entry => {
        const [dateStr, devStr, learnStr, violsStr] = entry.split('|');
        
        // Convert date from YYMMDD to YYYY-MM-DD
        const year = '20' + dateStr.substring(0, 2);
        const month = dateStr.substring(2, 4);
        const day = dateStr.substring(4, 6);
        const date = `${year}-${month}-${day}`;
        
        // Convert hours (divide by 10 since they were multiplied by 10 in old format)
        const development = parseInt(devStr) / 10;
        const learning = parseInt(learnStr) / 10;
        
        // Parse violations (if any)
        const violations = violsStr ? violsStr.split(',') : [];
        
        return {
            date,
            development,
            learning,
            violations
        };
    });
}

// const oldData = "241107|50|20|news,vid;241108|50|0|news;241109|50|20|news;241110|50|20|news,vid;241111|50|10|news,vid;241112|50|20|news;241113|50|0|inapp,news;241114|50|0;241115|50|0;241116|50|20;241117|50|20;241118|50|10;241119|30|20|inapp;241120|50|20|vid;241121|50|20|inapp,vid;241122|50|15;241123|60|15;241124|60|0|tabs,browse,inapp;241125|40|0|news,vid,inapp;241126|20|0";

// const newFormat = convertOldData(oldData);
// console.log(JSON.stringify(newFormat, null, 2));


function handlePhoneLock() {
    const modal = document.getElementById('phoneLockModal');
    const content = document.getElementById('lockContent');
    
    const lockStatus = getPhoneLockStatus();
    
    if (lockStatus.isLocked && !lockStatus.canUnlock) {
        // Phone is locked and can't be unlocked yet
        const timeRemaining = getTimeRemaining(lockStatus.unlockTime);
        content.innerHTML = `
            <div class="bg-red-50 p-4 rounded">
                <p class="font-bold text-red-800">Phone is locked</p>
                <p class="text-red-600">Code will be revealed in: ${timeRemaining}</p>
            </div>
        `;
    } else if (lockStatus.isLocked && lockStatus.canUnlock) {
        // Phone can be unlocked
        content.innerHTML = `
            <div class="bg-green-100 p-4 rounded">
                <p class="font-bold">Your unlock code is:</p>
                <p class="text-3xl font-bold text-center my-4">${lockStatus.code}</p>
                <p class="text-sm text-gray-600">You can now unlock your phone.</p>
            </div>
            <button onclick="resetLock()" class="mt-4 w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
                Reset Lock
            </button>
        `;
    } else {
        // Generate new lock
        const code = generateLockCode();
        content.innerHTML = `
            <div class="bg-blue-100 p-4 rounded">
                <p class="font-bold">Your new lock code is:</p>
                <p class="text-3xl font-bold text-center my-4">${code}</p>
                <p class="text-sm text-red-600">
                    Write this code down and use it to lock your phone.
                    This code will not be shown again until 7 AM tomorrow.
                </p>
            </div>
        `;
    }
    
    modal.classList.remove('hidden');
    updateLockButtonState();
}

function generateLockCode() {
    const code = Math.random().toString().substring(2, 8);
    const unlockTime = new Date();
    unlockTime.setHours(7, 0, 0, 0); // Set to 7 AM next day
    if (unlockTime <= new Date()) {
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
        lockPhoneBtn.textContent = lockStatus.canUnlock ? 'Show Unlock Code' : 'Check Lock Status';
        lockPhoneBtn.classList.add('bg-gray-500');
        lockPhoneBtn.classList.remove('bg-blue-500');
    } else {
        lockPhoneBtn.textContent = 'Generate Phone Lock Code';
        lockPhoneBtn.classList.add('bg-blue-500');
        lockPhoneBtn.classList.remove('bg-gray-500');
    }
}

function resetLock() {
    localStorage.removeItem('phoneLockData');
    updateLockButtonState();
    closePhoneLockModal();
}

function closePhoneLockModal() {
    document.getElementById('phoneLockModal').classList.add('hidden');
}

setInterval(() => {
    updateLockButtonState();
}, 60000); // Update every minute
