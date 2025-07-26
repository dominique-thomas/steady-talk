/**
 * Project: Steady Talk
 * Description: Core logic for the Steady Talk app, including navigation, event handling, interview session flow, and progress tracking.
 * Author: Dominique Thomas (github.com/dominique-thomas)
 * License: Shared publicly for demonstration purposes only. Reuse or redistribution not permitted without permission.
 */
//----------------------------------
//  Global Variables
//----------------------------------
const DEV_MODE = false;
const toggleBtn = document.getElementById("menu-toggle");
const sidebar = document.getElementById("app-sidebar");
const overlay = document.getElementById("sidebar-overlay");
const usernameBadge = document.querySelector(".user-badge");
const progressKey = "unlockedSections";
const hasSpeech = "SpeechRecognition" in window || "webkitSpeechRecognition" in window;
const hasMedia = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
const industryOptions = [{
        id: "healthcare",
        title: "Healthcare"
    },
    {
        id: "it",
        title: "Information Technology"
    },
    {
        id: "industrial",
        title: "Industrial",
    }
];
const interviewIconMap = [{
        title: "Company Profile",
        iconClass: "fa-briefcase"
    },
    {
        title: "Prescreen Interview",
        iconClass: "fa-phone"
    },
    {
        title: "Hiring Manager Interview",
        iconClass: "fa-user-tie"
    },
    {
        title: "Team Fit Interview",
        iconClass: "fa-users"
    }
];
const companyNames = {
    healthcare: "Vitalscope",
    industrial: "Summit Freight",
    it: "Flow Labs"
};
const sectionMap = {
    "companyOverview": 0,
    "prescreen": 1,
    "hiringManager": 2,
    "teamFit": 3
};
const MAX_MEDIA_DURATION = 180000; //3 minutes
const baseDelay = 500;
const delayPerChunk = 1600;
const defaultProgress = [0, 0, 0, 0];
const defaultComplete = [0, 0, 0, 0];
const didNotAnswer = "Did not answer question.";
let lastResultIndex = 0;
let isAudioCaptureActive = false;
let currentInterviewQuestions = [];
let recordedAudioChunks = [];
let recordedVideoChunks = [];
let headTrackingResults = [];
let lastActiveSidebarTitle = "Mentor Tips";
let userIndustry = "it";
let username = "Alex Doe";
let firstName = "";
let lastName = "";
let audioTranscript = "";
let currentQuestionIndex = 0;
let mentorQueueActive = false;
let videoTimeout = null;
let audioTimeout = null;
let currentInterviewInfo = null;
let currentInterviewType = "";
let webcamStream = null;
let speechRecognition = null;
let activeModalContext = null;
let audioMediaRecorder = null;
let audioRecordingStartTime = 0;
let videoMediaRecorder = null;
let faceDetectorModel = null;
let headTrackingInterval = null;
let headTrackingActive = false;
let isDesktop = !/Mobi|Android/i.test(navigator.userAgent);

//----------------------------------
// Initial check for Webcam and Speech speechRecognition
//----------------------------------
if (!hasSpeech || !hasMedia) {
    document.getElementById("speech-warning").classList.remove("hidden");
} else {
    document.getElementById("app")?.classList.remove("hidden");
    init();
}

//----------------------------------
// App Initalization Handlers
//----------------------------------
// Entry point to the app
function init() {
    document.getElementById("startIntroBtn").addEventListener("click", () => {

        const name = localStorage.getItem("username");
        const hasName = !!name;
        const hasIndustry = !!localStorage.getItem("userIndustry");
        const interviewTypes = ["prescreen", "hiringManager", "teamFit"];

        // Initialize progress and storage keys are missing
        if (!localStorage.getItem(progressKey)) {
            localStorage.setItem(progressKey, JSON.stringify([0, 0, 0, 0]));
        }

        if (!localStorage.getItem("completedSections")) {
            localStorage.setItem("completedSections", JSON.stringify([0, 0, 0, 0]));
        }

        if (!localStorage.getItem("interviewResponsesLog")) {
            localStorage.setItem("interviewResponsesLog", JSON.stringify([]));
        }

        interviewTypes.forEach(type => {
            const key = `interviewSummary-${type}`;
            if (!localStorage.getItem(key)) {
                localStorage.setItem(key, JSON.stringify({}));
            }
        });

        // Show main app
        if (hasName && hasIndustry) {
            updateUserBadge(name);
            setUsername(name);

            document.getElementById("app-shell").classList.remove("hidden");
            document.getElementById("intro-overlay").classList.add("hidden");

            localStorage.setItem("isFirstTimeUser", "false");

            showWelcomeBackMessage();
            applySidebarUnlocksFromProgress();
        }
        // If first-time user show onboarding
        else {
            const videoWrapper = document.getElementById("codyIntroVideo");
            const videoElement = document.getElementById("codyVideo");

            document.getElementById("intro-gate").classList.add("hidden");

            videoWrapper.classList.remove("hidden");
            videoElement.classList.add("loaded");
            videoElement.src = "videos/mentor_intro.mp4";
            videoElement.play();

            localStorage.setItem("isFirstTimeUser", "true");
            showWelcomeMessage();
        }
    });
}

// Set the username 
function setUsername(name) {
    firstName = name.split(" ")[0];
    lastName = name.split(" ")[1];
    username = firstName + " " + lastName;
}

// Helper function used to set the initials
function updateUserBadge(name) {
    const badge = document.querySelector(".user-badge");
    const initials = name
        .split(" ")
        .map(part => part[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();

    badge.textContent = initials;
}

// Username submit handler
function addUserNameEvents() {
    document.getElementById("submitUsername").addEventListener("click", () => {
        const value = document.getElementById("modalUsername").value.trim();
        if (!value || !value.includes(" ")) {
            document.getElementById("usernameErrorModal").classList.remove("hidden");
            return;
        }

        localStorage.setItem("username", value);

        setUsername(value);
        updateUserBadge(value);

        document.getElementById("usernameSuccessModal").classList.remove("hidden");
    });

    document.getElementById("modalUsername").addEventListener("input", () => {
        document.getElementById("usernameErrorModal").classList.add("hidden");
        document.getElementById("usernameSuccessModal").classList.add("hidden");
    });
}

// Shows the onboarding form after Cody's intro video finishes playing
document.getElementById("codyVideo").addEventListener("ended", () => {
    showMentorAndForm();
});

// Shows the onboarding message and industry selection form
function showMentorAndForm() {
    if (mentorQueueActive) return;
    mentorQueueActive = true;

    const industryIntro = {
        text: `Please enter your full name and select an industry you'd like to focus on. Your selection will determine which fictional company you're matched with during the simulation.`
    };

    document.getElementById("codyIntroVideo").classList.add("hidden");
    document.getElementById("onboarding-step").classList.remove("hidden");
    document.querySelector(".onboarding-form").classList.remove("hidden");
    processMessageQueue(industryIntro, "onboarding-chat-zone");
}

// Displays Cody's initial message when the user first launches the app
function showWelcomeMessage() {

    const text2 = "Great! The first section, Company Profile, is now unlocked.";
    const text = updateFirstNameStr(
        `Welcome to your Interview Journey, ${firstNamePlaceholder}. Each section on the sidebar will guide you through a different stage of a typical interview. You can always come back here to ask me questions or get help. Are you ready to get started?`
    );

    processMessageQueue({
        text
    }, "main-chat", () => {
        showMentorOptions([{
            label: "I'm Ready.",
            onClick: () => {
                unlockSection(0);
                applyMenuLocks();
                handleIntroResponse(text2);
            }
        }]);
    });
}

// Handles the name + industry submit form
document.getElementById("submitOnboarding").addEventListener("click", () => {

    const name = document.getElementById("username").value.trim();
    const errorEl = document.getElementById("onboardingError");
    let industry = document.querySelector('.industry-btn.selected')?.dataset.value;

    if (!name || name.split(" ").length < 2 || !industry) {
        errorEl.classList.remove("hidden");
        return;
    }

    if (industry === "random") {
        const randomIndustry = pickRandom(industryOptions);
        industry = randomIndustry.id;
    }

    userIndustry = industry;

    setUsername(name);
    localStorage.setItem("username", name);
    localStorage.setItem("userIndustry", industry);

    document.getElementById("intro-overlay").classList.add("hidden");
    document.getElementById("app-shell").classList.remove("hidden");

    updateUserBadge(name);
});

// Mouse down handler for selecting an industry button; used to specify the button was selected
document.querySelectorAll(".industry-btn").forEach(button => {
    button.addEventListener("click", () => {
        document.querySelectorAll(".industry-btn").forEach(btn => btn.classList.remove("selected"));
        button.classList.add("selected");        
    });
});

// Modal Industry event handler
function addIndustryEvents() {

    document.querySelectorAll(".modal-industry-btn").forEach(button => {
        button.addEventListener("click", () => {
            document.querySelectorAll(".modal-industry-btn").forEach(btn => btn.classList.remove("selected"));
            button.classList.add("selected");
            document.getElementById("modalSelectedIndustry").value = button.dataset.value;

            document.getElementById("industrySuccessModal").classList.add("hidden");
            document.getElementById("industryErrorModal").classList.add("hidden");
        });
    });

    document.getElementById("submitIndustry").addEventListener("click", () => {
        let selected = document.querySelector(".modal-industry-btn.selected")?.dataset.value;
        if (!selected) {
            document.getElementById("industryErrorModal").classList.remove("hidden");
            return;
        }

        if (selected === "random") {
            const randomIndustry = pickRandom(industryOptions);
            selected = randomIndustry.id;
        }

        userIndustry = selected;

        localStorage.setItem("userIndustry", selected);
        document.getElementById("industrySuccessModal").classList.remove("hidden");

        //Reload the Company Profile page if applicable 
        if (document.getElementById("company-view").classList.contains("active")) {
            setTimeout(() => {
                triggerSidebarClickByTitle("Company Profile");
            }, 500);
        }
    });
}

// Used to dynamically trigger clicking the sidebar; used if the user changes thier industry in the modal so this page "refreshes"
function triggerSidebarClickByTitle(title) {
    const item = document.querySelector(`#app-sidebar li[title="${title}"]`);
    if (item) {
        item.click();
    } else {
        console.warn(`Sidebar item with title "${title}" not found.`);
    }
}

// Displays Cody's greeting message when the user launches/returns to the app
function showWelcomeBackMessage() {
    const isFirstTime = localStorage.getItem("isFirstTimeUser") === "true";

    const greeting = updateFirstNameStr(
        isFirstTime ?
        pickRandom(firstTimeGreetings) :
        pickRandom(returningGreetings)
    );

    handleIntroResponse(greeting);
}

//----------------------------------
// Mentor Responses 
//----------------------------------
// Shows the mentor's prompt menu
function showCodyMenuPrompt() {

    calculateGlobalInsights();

    const progress = getUserProgress();
    const insightsAvailable = globalInsights.length > 0;
    const randomGlobalInsight = pickRandom(globalInsights);

    const options = [{
            label: "Can you tell me something about yourself?",
            onClick: handlePersonalFactRequest
        },
        {
            label: "What should I do next?",
            onClick: () => {
                const nextSection = determineNextSection(progress);
                const section = interviewSections[nextSection];
                const text = section?.intro?.[0] || "You're all caught up for now. Feel free to revisit any section or explore the Resources section.";
                handleCodyResponse(text);
            }
        },
        {
            label: "Any tips for using this simulation?",
            onClick: () => {
                const tip = pickRandom(simulationBehaviorTips);
                handleCodyResponse(tip);
            }
        },
        {
            label: "Do you have any interview advice?",
            onClick: () => {
                const tip = pickRandom(generalTips);
                handleCodyResponse(tip);
            }
        },
        {
            label: "How are my interviews going?",
            onClick: () => {
                const leadingLine = getLeadingInsightLine(randomGlobalInsight);
                const text = insightsAvailable ?
                    leadingLine + randomGlobalInsight.message :
                    "Once you complete a few interviews, I'll be able to share insights based on your performance across all interviews.";
                handleCodyResponse(text);
            }
        }
    ];

    showMentorOptions(options);
}

// Helper function used to get the user's progress
function getUserProgress() {
    const [co, ps, hm, tf] = getProgressArray();
    return {
        companyOverview: !!co,
        prescreenInterview: !!ps,
        hiringManagerInterview: !!hm,
        teamFitInterview: !!tf
    };
}

// Gets a "leading" sentence before displaying a global insight
function getLeadingInsightLine(insight) {
    if (!insight || !insight.key) {
        return "";  
    }

    const isPositive = positiveInsightKeys.includes(insight.key);
    const leadingLine = isPositive ?
        "Here's something you're doing well: " :
        "Here's something to work on for next time: ";

    return leadingLine;
}

// Helper function that shows the mentor's intro response (when starting the app)
function handleIntroResponse(text) {
    processMessageQueue({
        text
    }, "main-chat", () => {
        const bridge = pickRandom(introBridges);
        processMessageQueue({
            text: bridge
        }, "main-chat", () => {
            showCodyMenuPrompt();
        });
    });
}

// Helper function that shows the mentor's response
function handleCodyResponse(text) {
    processMessageQueue({
        text
    }, "main-chat", () => {
        const bridge = pickRandom(bridgePhrases);
        processMessageQueue({
            text: bridge
        }, "main-chat", () => {
            showCodyMenuPrompt();
        });
    });
}

// Helper function that is used to provide a personal fact about the mentor
function handlePersonalFactRequest() {

    let personalFactsAsked = 0;
    let personalFactsCooldown = false;

    if (personalFactsCooldown) {
        const msg = pickRandom(fallbackCooldowns);
        handleCodyResponse(msg);
        return;
    }

    const fact = pickRandom(codyPersonalFacts);
    personalFactsAsked++;

    // A soft cap on how many questions can be asked for the session (refreshing the page will reset the cap)
    processMessageQueue({
        text: fact
    }, "main-chat", () => {
        if (personalFactsAsked >= 4) {
            personalFactsCooldown = true;
        }

        const bridge = pickRandom(bridgePhrases);
        processMessageQueue({
            text: bridge
        }, "main-chat", () => {
            showCodyMenuPrompt();
        });
    });
}

// Helper function that is used for helping the user determine which section should be visited next
function determineNextSection() {
    const complete = getCompletionArray();
    if (!complete[0]) return "companyOverview";
    if (!complete[1]) return "prescreenInterview";
    if (!complete[2]) return "hiringManagerInterview";
    if (!complete[3]) return "teamFitInterview";
    return "completedJourney";
}

// Helper function that picks a random bridge (connecting) phrase
function offerBridgePrompt() {
    const bridge = pickRandom(bridgePhrases);
    processMessageQueue({
        text: bridge
    }, "main-chat", () => {
        showCodyMenuPrompt();
    });
}

// Helper function used to determine which sections have been completed
function getCompletionArray() {
    return JSON.parse(localStorage.getItem("completedSections")) || [0, 0, 0, 0];
}

// Helper function that sets a section complete
function markSectionComplete(index, value = 1) {
    const complete = getCompletionArray();
    complete[index] = value;
    localStorage.setItem("completedSections", JSON.stringify(complete));
}

//----------------------------------
// Chat Message Handlers
//----------------------------------
// Shows the user's response then shows the mentor's prompt menu again
function showMentorOptions(options = [], containerId = "main-chat") {
    const container = document.getElementById(containerId);
    if (!container) {
        console.warn(`Container "${containerId}" not found.`);
        return;
    }

    const btnGroup = document.createElement("div");
    btnGroup.classList.add("user-button-group", "fade-target");

    options.forEach(({
        label,
        onClick
    }) => {
        const btn = document.createElement("button");
        btn.title = label;
        btn.textContent = label;

        btn.addEventListener("click", () => {

            // Show user response
            addUserMessage(label, containerId);

            // Then show mentor's follow-up response
            if (typeof onClick === "function") {
                setTimeout(() => {
                    onClick();
                }, 800);
            }

            btnGroup.remove();
        });

        btnGroup.appendChild(btn);
    });

    container.appendChild(btnGroup);

    requestAnimationFrame(() => {
        btnGroup.classList.add("fade-in");
    });

    scrollToWindowBottom();
}

// Adds the user's message to the specified chat div
function addUserMessage(text, containerId = "main-chat") {
    const container = document.getElementById(containerId);
    if (!container) return;

    const wrapper = document.createElement("div");
    wrapper.classList.add("user-chat-row", "fade-in");

    const bubble = document.createElement("div");
    bubble.classList.add("user-chat-bubble");

    bubble.textContent = text;

    wrapper.appendChild(bubble);
    container.appendChild(wrapper);

    wrapper.classList.add("fade-target");
    requestAnimationFrame(() => {
        wrapper.classList.add("fade-in");
    });

    scrollToWindowBottom();
}

// Message queue handler
function processMessageQueue(response, containerId = "main-chat", onComplete, showInputIfFollowUp = false) {

    if (!response || !response.text) return;

    const updatedResponse = updateFirstNameStr(response.text);
    response.text = updatedResponse;

    const chunks = splitDialogIntoChunks(response);
    chunks.forEach(({
        text
    }, i) => {

        setTimeout(() => {
            const bubble = addMentorMessage(text, containerId);

            if (i === chunks.length - 1 && bubble) {
                bubble.addEventListener("animationend", () => {
                    if (typeof onComplete === "function") onComplete();
                }, {
                    once: true
                });
            }
        }, baseDelay + i * delayPerChunk);
    });
}

// Adds the mentor's message to a specified div
function addMentorMessage(text, containerId) {
    const parent = document.getElementById(containerId);
    if (!parent) return null;

    const wrapper = document.createElement("div");

    if (containerId === "onboarding-chat") {
        wrapper.classList.add("cody-chat-row-center", "fade-target");
    } else {
        wrapper.classList.add("cody-chat-row-left", "fade-target");
    }

    wrapper.innerHTML = `
    <div class="avatar-side">
      <img src="images/team.png" class="avatar-img" alt="Cody" />
    </div>
    <div class="cody-chat-bubble">
      <p>${text}</p>
    </div>
  `;

    parent.appendChild(wrapper);

    requestAnimationFrame(() => {
        wrapper.classList.add("fade-in");
    });

    return wrapper;
}

// Helper function that splits the mentor's dialog into smaller chunks (every 3 or so sentences)
function splitDialogIntoChunks(entry) {
    if (!entry || typeof entry.text !== "string") {
        console.warn("Invalid entry.text in splitDialogIntoChunks:", entry);
        return [];
    }

    // Handles intentional double line breaks
    const paragraphs = entry.text.split(/\n{2,}/g);
    const chunks = paragraphs.map((para, index) => ({
        text: para.trim()
    }));

    // If no intentional breaks, fallback to sentence grouping
    if (chunks.length === 1) {
        const safeAbbreviations = /\b(?:Mr|Ms|Mrs|Dr|Jr|Sr|St|J\.K|e\.g|i\.e)\./gi;
        const placeholder = "<<<DOT>>>";
        const safeText = entry.text.replace(safeAbbreviations, (match) =>
            match.replace(/\./g, placeholder)
        );

        const rawSentences = safeText.split(/(?<=[.?!])\s+(?=[A-Z])/);
        const fixedSentences = rawSentences.map(s =>
            s.replace(new RegExp(placeholder, "g"), ".").trim()
        );

        const grouped = [];
        for (let i = 0; i < fixedSentences.length; i += 2) {
            const group = fixedSentences.slice(i, i + 2).join(" ").trim();
            grouped.push({
                text: group
            });
        }
        return grouped;
    }
    return chunks;
}

//----------------------------------
// Sidebar Handler
//----------------------------------
// Event listener to toggle the sidebar's visibility and show/hide the lock icon
toggleBtn.addEventListener("click", () => {
    const isOpen = sidebar.classList.toggle("open");

    overlay.classList.toggle("hidden");
    document.body.classList.toggle("lock-scroll");

    if (isOpen) {
        usernameBadge.classList.add("locked");
    } else {
        usernameBadge.classList.remove("locked");
    }
});

// Event listener that closes the sidebar and hides the overlay
overlay.addEventListener("click", () => {
    sidebar.classList.remove("open");
    overlay.classList.add("hidden");
    usernameBadge.classList.remove("locked");
});

// Window event listener that closes the sidebar and toggles the view (for mobile)
window.addEventListener("resize", () => {
    if (window.innerWidth > 768) {

        sidebar.classList.remove("open");
        overlay.classList.add("hidden");
        document.body.classList.remove("lock-scroll");
        usernameBadge.classList.remove("locked");
    }
});

// Handles sidebar navigation by updating the page
document.querySelectorAll("#app-sidebar li").forEach(item => {
    item.addEventListener("click", () => {
        if (item.classList.contains("locked")) return;

        const sectionTitle = item.getAttribute("title");

        if (item.classList.contains("journey-item")) {
            document.querySelectorAll("#app-sidebar li").forEach(i => i.classList.remove("active"));
            item.classList.add("active");

            lastActiveSidebarTitle = sectionTitle;
        }

        if (sectionTitle === "Mentor Tips") {
            showMentorTips();
        } else if (sectionTitle === "Company Profile") {
            populateIndustryMeta();
            loadIndustryPreview();
            showCompanyOverview();
        } else if (sectionTitle.includes("Interview")) {
            currentInterviewType = getInterviewTypeFromTitle(sectionTitle);
            startInterviewSessionOverivew();
        }
    });
});

// Used to get the interview type based on the supplied title
function getInterviewTypeFromTitle(title = "") {
    const map = {
        "Company Profile": "companyOverview",
        "Prescreen Interview": "prescreen",
        "Hiring Manager Interview": "hiringManager",
        "Team Fit Interview": "teamFit"
    };
    return map[title.trim()] || null;
}

// Used to get the interview name based on the supplied type
function getInterviewLabelFromType(type = "") {
    const map = {
        prescreen: "Prescreen Interview",
        hiringManager: "Hiring Manager Interview",
        teamFit: "Team Fit Interview",
        companyOverview: "Company Profile"
    };
    return map[type] || null;
}

// Displays the Mentor Tips page
function showMentorTips() {
    showView("dashboard-view");
}

// Displays the Company Overview page
function showCompanyOverview() {
    const industry = localStorage.getItem("userIndustry") || "healthcare";
    const launchURL = `profile.html?type=${industry}`;
    const launchBtn = document.getElementById("launch-company-btn");

    showView("company-view");
    document.getElementById("company-view").classList.add("active");
    launchBtn.setAttribute("href", launchURL);
}

// Populates the data that appears in the Industry Preview page
function populateIndustryMeta() {
    const userIndustry = localStorage.getItem("userIndustry") || "healthcare";

    const match = industryOptions.find(opt => opt.id === userIndustry);
    const industryTitle = match ? match.title : "Unknown";

    const companyNames = {
        healthcare: "Vitalscope",
        industrial: "Summit Freight",
        it: "Flow Labs"
    };
    const companyName = companyNames[userIndustry] || "Unknown";

    document.getElementById("industry-label").textContent = industryTitle;
    document.getElementById("company-label").textContent = companyName;
}

// Handles displaying the preview image of the chosen industry
function loadIndustryPreview() {
    const industry = localStorage.getItem("userIndustry") || "healthcare";
    const imagePath = `images/preview-${industry}.png`;

    const img = document.querySelector(".company-preview img");
    if (img) {
        img.src = imagePath;
        img.alt = "Company Profile Preview";
        img.title = "Company Profile Preview";
    }
}

// Helper that shows the Interview Overview page
function startInterviewSessionOverivew() {

    showView("interview-overview-view");
    loadInterviewOverview();
    loadMiniSummary();
}

// Handles the interview session flow by determining if the user has completed the interview before or not
function startInterviewSession() {

    const type = currentInterviewType;

    document.getElementById("camera-preview-label").innerText = username;
    currentInterviewQuestions = [];

    if (hasCompletedInterview(type)) {
        showNewSessionWarning();
    } else {
        resetInterviewSession();
        initInterviewQuestions(type);
        showView("camera-check-view");
        startCameraPreview();
    }
}

// Shows the user's camera preview; if camera is undetected then stop the app
function startCameraPreview() {
    const preview = document.getElementById("cameraPreview");
    const userCam = document.getElementById("userWebcam");
    const container = document.getElementById("camera-check-view");

    if (!preview || !container) return;

    navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true
        })
        .then(stream => {
            webcamStream = stream;
            preview.srcObject = stream;
            preview.play();

            if (userCam) {
                userCam.srcObject = stream;
                userCam.play();
            }
            document.getElementById("continueToInterviewBtn").disabled = false;
        })
        .catch(err => {
            showAppErrorMsg();
        });
}

// Show erorr message if the camera is not detected
function showAppErrorMsg(){
    document.getElementById("camera-not-detected-warning").classList.remove("hidden");
    document.getElementById("app")?.classList.add("hidden");
    document.getElementById("continueToInterviewBtn").disabled = true;
}

// Loads the mini summary in the Interview Overview page
function loadMiniSummary(targetIdPrefix = "") {

    const type = currentInterviewType;
    const summary = JSON.parse(localStorage.getItem(`interviewSummary-${type}`)) || {};

    document.getElementById(`${targetIdPrefix}summary-finished-date`).textContent = summary.date || "-";
    document.getElementById(`${targetIdPrefix}summary-answered`).textContent = summary.answered || "-";
    document.getElementById(`${targetIdPrefix}summary-confidence-score`).textContent = summary.confidence || "-";
}

// Resets the interview session
function resetInterviewSession() {

    currentQuestionIndex = 0;
    const questions = currentInterviewQuestions;

    questions.forEach(q => {
        q.response = "";
        q.insights = [];
        q.audio = null;
        q.video = null;
    });
}

// Checks to see if the interview was completed
function hasCompletedInterview() {
    const completed = getCompletionArray();

    const typeIndexMap = {
        companyOverview: 0,
        prescreen: 1,
        hiringManager: 2,
        teamFit: 3
    };

    const index = typeIndexMap[currentInterviewType];
    return completed[index] === 1;
}

// Shows the specified page view
function showView(viewId) {

    scrollToTopOfApp();

    const target = document.getElementById(viewId);
    const appShell = document.getElementById("app-shell");

    document.querySelectorAll(".view-container, .fullscreen-container").forEach(v => {
        v.classList.remove("active");
    });

    if (target) {
        //Added to account for the "shared" interview overview pages
        target.classList.remove("active");
        setTimeout(() => {
            target.classList.add("active");
        }, 100);
    }

    if (target?.classList.contains("fullscreen-container")) {
        appShell?.classList.add("hidden");
    } else {
        appShell?.classList.remove("hidden");
    }
}

//----------------------------------
//  Menu Locking Functions
//----------------------------------
// Lock the sidebar menu items
function applyMenuLocks() {
    const progress = getProgressArray();
    const menuTitles = [
        "Company Profile",
        "Prescreen Interview",
        "Hiring Manager Interview",
        "Team Fit Interview"
    ];

    menuTitles.forEach((title, i) => {
        const item = document.querySelector(`[title="${title}"]`);
        if (!item) return;
        if (progress[i] === 1) {
            item.classList.remove("locked");
        } else {
            item.classList.add("locked");
        }
    });
}

// Unlocks a specified menu item 
function unlockSection(index, value = 1) {
    const progress = getProgressArray();
    progress[index] = value;
    localStorage.setItem(progressKey, JSON.stringify(progress));

    const match = interviewIconMap[index];
    if (!match) return;

    const el = document.querySelector(`#app-sidebar li[title="${match.title}"]`);
    if (!el) return;

    el.classList.remove("locked");
    el.classList.add("default");

    const icon = el.querySelector("i");
    if (icon) icon.className = `fas ${match.iconClass}`;
}

function applySidebarUnlocksFromProgress() {
    const progress = getProgressArray();

    progress.forEach((unlocked, index) => {
        if (unlocked === 1) {
            unlockSection(index);
        }
    });
}

// Gets the progress of completed section
function getProgressArray() {
    const raw = localStorage.getItem(progressKey);
    return raw ? JSON.parse(raw) : [...defaultProgress];
}

// Sets the section complete based on the index order and unlocks the next menu item
function completeAndUnlockNext(currentIndex) {
    markSectionComplete(currentIndex);
    const nextIndex = currentIndex + 1;
    if (nextIndex < 4) {
        unlockSection(nextIndex);
    }
    applyMenuLocks();
}

// Sets the section complete based on the name, and unlocks the next menu item
function completeAndUnlockNextByName(sectionName) {
    const index = sectionMap[sectionName];
    if (index === undefined) return;
    completeAndUnlockNext(index);
}

//----------------------------------
// Interview Handlers
//----------------------------------
// Sets the interview data for the Interview Overview page
function loadInterviewOverview() {

    const type = currentInterviewType;
    const industry = localStorage.getItem("userIndustry") || "healthcare";
    const activeIndustry = companyData[industry];

    const [recruiter, hiringManager, teamfit] = activeIndustry.team;

    const interviewData = {
        prescreen: {
            title: "Prescreen Interview",
            name: recruiter.name,
            role: recruiter.role,
            description: "This stage helps confirm your interest and background. You can think of it like a quick intro call to get the process started.",
            image: "avatar_alicia.png"
        },
        hiringManager: {
            title: "Hiring Manager Interview",
            name: hiringManager.name,
            role: hiringManager.role,
            description: "This round is more in-depth. Here you'll talk about your experience, problem-solving skills, and how you handle challenges.",
            image: "avatar_dana.png"
        },
        teamFit: {
            title: "Team Fit Interview",
            name: teamfit.name,
            role: teamfit.role,
            description: "This final stage focuses on team dynamics and cultural alignment. This is your chance to show how you communicate and collaborate.",
            image: "avatar_marcus.png"
        }
    };

    const info = interviewData[type];
    if (!info) return;

    // Update text/image content
    let avatarImg;
    currentInterviewInfo = info;

    document.getElementById("interview-title").textContent = info.title;
    document.getElementById("interview-description").textContent = info.description;
    document.getElementById("interviewer-name").textContent = info.name;
    document.getElementById("interviewer-role").textContent = info.role;

    avatarImg = document.getElementById("interviewer-avatar");
    avatarImg.src = "images/" + info.image;
    avatarImg.alt =
    avatarImg.title = info.name + " - " + info.role;

    const btn = document.getElementById("start-interview-btn");
    btn.onclick = () => startInterviewSession(type);
}

// Resets the interview local storage data when starting a new interview or quitting an interview early
function resetInterviewStorageData(){    

    const log = JSON.parse(localStorage.getItem("interviewResponsesLog")) || [];
    const filtered = log.filter(entry => entry.interviewType !== currentInterviewType);

    localStorage.removeItem(`interviewSummary-${currentInterviewType}`);
    localStorage.setItem("interviewResponsesLog", JSON.stringify(filtered));
}

// Confirm that the user wishes to start a new interview session; clears old interview data
function confirmNewInterview() {

    const type = currentInterviewType;

    closeModal();
    resetInterviewStorageData();

    resetInterviewSession();
    initInterviewQuestions(type);
    showView("camera-check-view");
    startCameraPreview();
}

// Handles saving questions to the current interview questions array
function initInterviewQuestions(type) {
    const allQuestions = interviewQuestions[type] || [];
    const isPrescreen = type.toLowerCase() === "prescreen";
    const taggedQuestions = allQuestions.map((q, index) => ({
        ...q,
        originalIndex: index
    }));

    let randomized;
    let maxQuestions = 4;   

    if (DEV_MODE) {
        maxQuestions = 1;
    }

    if (isPrescreen) {

        //For the prescreening interview, alwasy ask the same question first and shuffle the remaining questions
        const mustAskFirst = taggedQuestions[0];
        const remaining = [...taggedQuestions.slice(1)];
        const shuffled = pickMultipleRandom(remaining, maxQuestions);
        randomized = [mustAskFirst, ...shuffled];
    } else {
        randomized = pickMultipleRandom([...taggedQuestions], maxQuestions);
    }

    currentInterviewQuestions = randomized.map(q => ({
        ...q,
        response: "",
        insights: [],
        audio: null,
        video: null,
    }));

    currentQuestionIndex = 0;
}

// Interview entry point that is responsible for showing the interview page and playing the intro video
function startInterview() {
    document.getElementById("continueToInterviewBtn").disabled = true;
    showView("interview-view");
    setupInterviewLabels();
    playIntroVideos(currentInterviewType, () => {
        loadNextQuestion();
    });
}

// Helper method that updates the interview label text
function setupInterviewLabels() {

    if (!currentInterviewInfo) return;

    document.getElementById("avatar-name-1").textContent = currentInterviewInfo.name;
    document.getElementById("username-label").textContent = username;
}

// Shows the overlay div that appears during interviews
function showOverlay() {
    const loadingOverlay = document.getElementById("loading-overlay");
    loadingOverlay.classList.remove("hidden");
    loadingOverlay.classList.add("fade-in");
}

// Hides the overlay div that appears during interviews
function hideOverlay() {
    const loadingOverlay = document.getElementById("loading-overlay");
    loadingOverlay.classList.remove("fade-in");
    setTimeout(() => {
        loadingOverlay.classList.add("hidden");
    }, 500);
}

// Plays the interviewer's intro video, which introduces the character
function playIntroVideos(type, callback) {

    const introList = interviewerIntros[type] || [];
    const videoElement = document.getElementById("avatarPromptVideo");
    const label = document.getElementById("question-order");
    const micIcon = document.getElementById("micIcon");
    const webcamBox = document.getElementById("webcam-box");
    let current = 0;

    label.classList.add("hidden");
    micIcon.classList.add("disabled");
    micIcon.classList.remove("listening");

    if (webcamBox) {
        webcamBox.classList.remove("hidden");
    }

    function playNextIntro() {
        if (current >= introList.length) {
            callback();
            return;
        }

        const src = "videos/" + introList[current];
        videoElement.classList.add("loaded");
        videoElement.classList.remove("inactive");
        videoElement.src = src;
        videoElement.load();
        videoElement.play();

        videoElement.onerror = () => {
            videoElement.src = "videos/placeholder.mp4";
            videoElement.load();
            videoElement.play();
        };

        // To account for multiple intro videos
        // Note: this may be a feature in the next version
        videoElement.onended = () => {
            current++;
            playNextIntro();
        };
    }

    document.getElementById("sample-question-response").classList.add("hidden");
    document.getElementById("active-question-text").textContent = "";
    document.getElementById("sample-answer").textContent = "";
    document.getElementById("repeat-btn").disabled = true;
    document.getElementById("next-btn").disabled = true;
    document.getElementById("quit-btn").disabled = false;

    playNextIntro();
    scrollToTopOfApp();
}

// Handles updating the interview question numbers
function updateQuestionOrderUI() {
    const label = document.getElementById("question-order");
    label.classList.remove("hidden");
    const total = currentInterviewQuestions.length;
    const index = currentQuestionIndex + 1;
    label.textContent = `Question ${index} of ${total}`;
}

// Handles loading the next video question
function loadNextQuestion() {

    const question = currentInterviewQuestions[currentQuestionIndex];
    const paddedIndex = String(question.originalIndex).padStart(3, "0");
    const videoFile = `${currentInterviewType}_${paddedIndex}.mp4`;
    const micIcon = document.getElementById("micIcon");

    scrollToTopOfApp();
    micIcon.classList.add("disabled");
    micIcon.classList.remove("listening");

    document.getElementById("sample-question-response").classList.add("hidden");

    if (DEV_MODE) {
        document.getElementById("repeat-btn").disabled = false;
        document.getElementById("next-btn").disabled = false;
    } else {
        document.getElementById("repeat-btn").disabled = true;
        document.getElementById("next-btn").disabled = true;
    }

    updateQuestionOrderUI();

    // Load video for question
    const videoElement = document.getElementById("avatarPromptVideo");
    const videoSrc = `videos/${videoFile}` || "videos/placeholder.mp4";
    videoElement.classList.add("loaded");
    videoElement.src = videoSrc;
    videoElement.load();
    videoElement.play();
    videoElement.classList.remove("inactive");

    // Disable buttons until video finishes
    videoElement.onended = () => {
        document.getElementById("repeat-btn").disabled = false;
        document.getElementById("next-btn").disabled = false;

        videoElement.classList.add("inactive");
        micIcon.classList.remove("disabled");
        micIcon.classList.add("listening");

        if (DEV_MODE) {
            document.getElementById("active-question-text").textContent = question.prompt;
            document.getElementById("sample-answer").textContent = question.sampleAnswer;
            document.getElementById("sample-question-response").classList.remove("hidden");
        }

        // Add a slight delay to track data
        setTimeout(() => {
            startHeadTracking();
            startAudioCapture();
            startVideoCapture();
        }, 400);
    };
}

// Handles video capturing 
function startVideoCapture() {

    recordedVideoChunks = [];

    if (webcamStream) {

        webcamStream.getTracks().forEach(track => {
            track.onended = () => {
                stopMediaTracking();                
                showAppErrorMsg();
            };
        });

        videoMediaRecorder = new MediaRecorder(webcamStream, {
            mimeType: "video/webm"
        });

        videoMediaRecorder.ondataavailable = e => {
            if (e.data.size > 0) recordedVideoChunks.push(e.data);
        };

        videoMediaRecorder.start(100);

        // Stop recording video after set amount of time has passed
        videoTimeout = setTimeout(() => {
            stopVideoCapture();
        }, MAX_MEDIA_DURATION);

    } else {
        console.error("Video capture failed.");
    }
}

// Stops video capture and saves data
function stopVideoCapture() {

    if (videoMediaRecorder && videoMediaRecorder.state !== "inactive") {
        videoMediaRecorder.stop();
    }

    clearTimeout(videoTimeout);
    videoTimeout = null;

    videoMediaRecorder.onstop = () => {
        const videoBlob = new Blob(recordedVideoChunks, {
            type: "video/webm"
        });
        currentInterviewQuestions[currentQuestionIndex].video = videoBlob;
    };
}

// Handles audio capturing 
function startAudioCapture() {
    audioTranscript = "";
    recordedAudioChunks = [];

    if (webcamStream) {

        audioRecordingStartTime = Date.now();
        audioMediaRecorder = new MediaRecorder(webcamStream);

        audioMediaRecorder.ondataavailable = e => {
            if (e.data.size > 0) recordedAudioChunks.push(e.data);
        };

        audioMediaRecorder.start(100);

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        speechRecognition = new SpeechRecognition();
        speechRecognition.lang = "en-US";
        speechRecognition.continuous = true;
        speechRecognition.interimResults = false;

        speechRecognition.onresult = event => {
            for (let i = lastResultIndex; i < event.results.length; i++) {
                audioTranscript += event.results[i][0].transcript + " ";
            }
            lastResultIndex = event.results.length;
            audioTranscript = audioTranscript.trim();
        };

        speechRecognition.start();
        isAudioCaptureActive = true;

        // Attempt to restart if the capture is still active
        speechRecognition.onend = () => {
            if (isAudioCaptureActive && audioMediaRecorder && audioMediaRecorder.state !== "inactive") {
                try {
                    speechRecognition.start();
                } catch (err) {
                    // Could not restart audio capture...
                }
            }
        };        

        // Stop recording audio after set amount of time
        audioTimeout = setTimeout(() => {
            stopAudioCapture();
        }, MAX_MEDIA_DURATION);

    } else {
        console.error("Audio capture failed.");
    }
}

// Stops audio capture and saves data
function stopAudioCapture() {
    if (audioMediaRecorder && audioMediaRecorder.state !== "inactive") {
        audioMediaRecorder.stop();
    }
    if (speechRecognition) {
        speechRecognition.stop();
        speechRecognition = null;
    }

    clearTimeout(audioTimeout);
    audioTimeout = null;
    isAudioCaptureActive = false;
    lastResultIndex = 0;

    audioMediaRecorder.onstop = () => {
        const audioDuration = (Date.now() - audioRecordingStartTime) / 1000;
        const audioBlob = new Blob(recordedAudioChunks, {
            type: 'audio/webm'
        });

        currentInterviewQuestions[currentQuestionIndex].audio = audioBlob;
        currentInterviewQuestions[currentQuestionIndex].response = cleanTranscript(audioTranscript) || didNotAnswer
        calculateInterviewInsights(currentInterviewQuestions[currentQuestionIndex], currentInterviewType, audioDuration);
    };
}

// Handles tracking head movement
async function startHeadTracking() {

    if (!webcamStream) return;

    const video = document.getElementById("userWebcam");

    faceDetectorModel = await faceDetection.createDetector(faceDetection.SupportedModels.MediaPipeFaceDetector, {
        runtime: "mediapipe",
        maxFaces: 1,
        solutionPath: "https://cdn.jsdelivr.net/npm/@mediapipe/face_detection"
    });

    headTrackingInterval = setInterval(async () => {

        const faces = await faceDetectorModel.estimateFaces(video);

        // Determine if the user's head is centered on screen or not
        if (faces.length > 0) {

            const face = faces[0];
            const video = document.getElementById("userWebcam");

            const xCenter = (face.box.xMin + face.box.xMax) / 2;
            const yCenter = (face.box.yMin + face.box.yMax) / 2;

            const xCenterNorm = xCenter / video.videoWidth;
            const yCenterNorm = yCenter / video.videoHeight;

            const isCentered = (
                xCenterNorm > 0.4 && xCenterNorm < 0.6 &&
                yCenterNorm > 0.4 && yCenterNorm < 0.6
            );

            headTrackingResults.push(isCentered);

        } else {
            headTrackingResults.push(false);
        }
    }, 500);
}

// Stops tracking head movement and saves data
function stopHeadTracking() {

    clearInterval(headTrackingInterval);

    const total = headTrackingResults.length;
    const centeredCount = headTrackingResults.filter(val => val).length;

    let headInsight = "headDefault";

    if (total > 4) {
        const ratio = centeredCount / total;
        if (ratio >= 0.8) headInsight = "headFocused";
        else if (ratio <= 0.5) headInsight = "headDistracted";
    }
    currentInterviewQuestions[currentQuestionIndex].insights.push(headInsight);
}

// Pauses all tracking (video, audio, and head)
function pauseInterviewMedia() {

    const micIcon = document.getElementById("micIcon");
    const avatarPromptVideo = document.getElementById("avatarPromptVideo");

    micIcon.classList.add("disabled");
    micIcon.classList.remove("listening");
    avatarPromptVideo.pause();

    isAudioCaptureActive = false;

    if (audioMediaRecorder && audioMediaRecorder.state !== "inactive") {
        audioMediaRecorder.stop();
    }

    if (speechRecognition) {
        speechRecognition.stop();
    }

    if (videoMediaRecorder && videoMediaRecorder.state !== "inactive") {
        videoMediaRecorder.stop();
    }

    if (audioTimeout) {
        clearTimeout(audioTimeout);
        audioTimeout = null;
    }

    if (videoTimeout) {
        clearTimeout(videoTimeout);
        videoTimeout = null;
    }

    if (headTrackingInterval) {
        clearInterval(headTrackingInterval);
        headTrackingInterval = null;
    }

    if (faceDetectorModel && typeof faceDetectorModel.dispose === "function") {
        faceDetectorModel.dispose();
        faceDetectorModel = null;
    }
}

// Resumes all tracking (video, audio, and head)
function resumeInterviewMedia() {

    const micIcon = document.getElementById("micIcon");
    const avatarPromptVideo = document.getElementById("avatarPromptVideo");

    micIcon.classList.remove("disabled");
    micIcon.classList.add("listening");

    // Only resume video playback if the video isn't at the end
    if (avatarPromptVideo.currentTime < avatarPromptVideo.duration) {
        avatarPromptVideo.play();
    }

    startVideoCapture();
    startAudioCapture();
    startHeadTracking();
}

// Repeat the current question (replay video and restarts all tracking)
function handleRepeatQuestion(event) {
    const button = event?.target;
    if (button) {
        button.disabled = true;
    }

    showOverlay();
    stopMediaTracking(true);

    setTimeout(() => {
        hideOverlay();
        loadNextQuestion();
    }, 400);
}

// Launches the next question
function handleNextQuestion(event) {
    const button = event?.target;
    if (button) {
        button.disabled = true;
    }

    setTimeout(() => {
        stopVideoCapture();
        stopAudioCapture();
        stopHeadTracking();

        setTimeout(() => {
            hideOverlay();
            currentQuestionIndex++;

            if (currentQuestionIndex < currentInterviewQuestions.length) {
                showOverlay();
                loadNextQuestion();
            } else {
                playInterviewerOutro();
            }
        }, 800);
    }, 400);
}

// Calculates the current user's keyword responses
function calculateInterviewInsights(questionObj, interviewType, audioDuration = 0) {
    const insights = [];

    if (!questionObj || !questionObj.response || !questionObj.response.trim() || questionObj.response === didNotAnswer) {
        questionObj.insights = ["noResponse"];
        return;
    }

    const response = questionObj.response.toLowerCase().trim();
    const responseWords = response.split(/\s+/);

    // Checks the duration of the audio
    if (audioDuration < 4) insights.push("tooShort");
    if (audioDuration > 180) insights.push("tooLong");

    // Filler word detection; 
    // Note that words like "like" and "so" can be conjunctions or connecting words
    const fillerCount = fillerWords.reduce((count, word) => {
        return count + responseWords.filter(w => w === word).length;
    }, 0);

    if (fillerCount >= 3) insights.push("fillerHeavy");

    // Check for any generic or negative phrases
    const containsAny = (terms) => terms.some(term => response.includes(term));
    if (containsAny(genericPhrases)) insights.push("generic");
    if (containsAny(negativePhrases)) insights.push("negativeTone");

    // Check for any words to avoid during the actual interview
    if (avoidKeywords[interviewType] && containsAny(avoidKeywords[interviewType])) {
        insights.push("avoidLanguage");
    }

    // Check for teamwork or learning responses 
    const hasTeamwork = teamworkTerms.some(term => response.includes(term));
    const hasLearning = learningTerms.some(term => response.includes(term));

    if (hasTeamwork) insights.push("teamwork");
    if (hasLearning) insights.push("learning");

    // Check for key terms that are both general- and industry-specific 
    const allKeywords = [
        ...(questionObj.keywords?.general || []),
        ...(questionObj.keywords?.industry || [])
    ];

    const matchedKeywords = allKeywords.filter(keyword =>
        response.includes(keyword.toLowerCase())
    );

    // Specify high, low, or no key term matches
    if (matchedKeywords.length === 0 && allKeywords.length > 0) {
        insights.push("lowKeywordMatch");
    }
    if (matchedKeywords.length >= 2) insights.push("keywordMatchHigh");

    if (insights.length === 0) insights.push("default");

    questionObj.insights = [...(questionObj.insights || []), ...insights];
}

// Exits to the Interview Overview page
function exitToOverview() {
    resetInterviewStorageData();    
    activeModalContext = "quit-interview";
    stopMediaTracking();
    closeModal();
    startInterviewSessionOverivew();
}

// Plays the interviewer's outro video, which thanks the user for thier time
function playInterviewerOutro() {
    const videoElement = document.getElementById("avatarPromptVideo");
    const micIcon = document.getElementById("micIcon");
    const label = document.getElementById("question-order");
    const webcamBox = document.getElementById("webcam-box");

    if (webcamBox) {
        webcamBox.classList.add("hidden");
    }

    micIcon.classList.add("disabled");
    micIcon.classList.remove("listening");
    label.classList.add("hidden");

    const outroVideo = interviewerOutros[currentInterviewType] || "placeholder.mp4";

    videoElement.classList.remove("inactive");
    videoElement.src = `videos/${outroVideo}`;
    videoElement.load();
    videoElement.play();

    videoElement.onerror = () => {
        videoElement.src = "videos/placeholder.mp4";
        videoElement.load();
        videoElement.play();
    };

    videoElement.onended = () => {
        videoElement.classList.add("inactive");
        showOverlay();

        setTimeout(() => {
            hideOverlay();
            showView("outro-video-view");
            playMentorSummaryOutro();
        }, 1000);
    };

    document.getElementById("repeat-btn").disabled = true;
    document.getElementById("next-btn").disabled = true;
    document.getElementById("quit-btn").disabled = true;
    setTimeout(stopMediaTracking, 800);
}

// Plays a randomized mentor outro video
function playMentorSummaryOutro() {
    const wrapper = document.getElementById("outro-video-view");
    const videoElement = document.getElementById("outroVideo");
    const chosenVideo = pickRandom(mentorOutros);

    wrapper.classList.remove("hidden");
    videoElement.classList.add("loaded");

    videoElement.src = `videos/${chosenVideo}`;
    videoElement.load();
    videoElement.play();

    videoElement.onerror = () => {
        videoElement.src = "videos/placeholder.mp4";
        videoElement.load();
        videoElement.play();
    };

    videoElement.onended = () => {
        videoElement.classList.add("fade-out");

        setTimeout(() => {
            wrapper.classList.add("hidden");
            populateSummary();
            showView("summary-view");
            scrollToTopOfApp();
        }, 700);
    };
}

// Stops all tracking (video, audio, and head)
function stopMediaTracking(isRepeat = false) {

    if (audioMediaRecorder && audioMediaRecorder.state !== "inactive") {
        audioMediaRecorder.stop();
        audioMediaRecorder.onstop = () => {
            audioMediaRecorder = null;
        };
    }
    if (speechRecognition) {
        speechRecognition.stop();
        speechRecognition = null;
    }

    if (audioTimeout) {
        clearTimeout(audioTimeout);
        audioTimeout = null;
    }

    if (videoMediaRecorder && videoMediaRecorder.state !== "inactive") {
        videoMediaRecorder.stop();
        videoMediaRecorder.onstop = () => {
            videoMediaRecorder = null;
        };
    }

    if (videoTimeout) {
        clearTimeout(videoTimeout);
        videoTimeout = null;
    }

    if (headTrackingInterval) {
        clearInterval(headTrackingInterval);
        headTrackingInterval = null;
    }

    if (faceDetectorModel && typeof faceDetectorModel.dispose === "function") {
        faceDetectorModel.dispose();
        faceDetectorModel = null;
    }

    audioTranscript = "";
    recordedAudioChunks = [];
    recordedVideoChunks = [];
    headTrackingResults = [];
    isAudioCaptureActive = false;

    if (!isRepeat) {
        if (webcamStream) {
            webcamStream.getTracks().forEach(track => track.stop());
            webcamStream = null;
        }
    }
}

//----------------------------------
// Summary Handlers
//----------------------------------
// Populates the Summary page
function populateSummary() {

    const videoDownloadWarning = document.getElementById("video-download-warning");
    const summaryContainer = document.getElementById("summary-question-list");
    const avatarPath = "images/team.png";
    const answeredCount = countAnsweredQuestions(currentInterviewQuestions);
    const totalQuestions = currentInterviewQuestions.length;

    reorderInterviewInsights();

    // Show download warning message if running on a mobile device
    videoDownloadWarning.classList.add("hidden");
    if (!isDesktop) {
        videoDownloadWarning.classList.remove("hidden");
    }

    // Set and store summary data
    const summary = {
        date: formatDate(new Date()),
        answered: `${answeredCount} of ${totalQuestions} questions`,
        confidence: `${calculateConfidenceScore(currentInterviewQuestions)}%`
    };

    localStorage.setItem(`interviewSummary-${currentInterviewType}`, JSON.stringify(summary));
    appendToGlobalLog();

    console.log("SUMMARY::")
    console.log(`interviewSummary-${currentInterviewType}`)
    console.log(JSON.stringify(summary))

    // Update mini summary stats and clear the old question list
    loadMiniSummary("final-");
    summaryContainer.innerHTML = "";

    // Loop through questions and render each summary
    currentInterviewQuestions.forEach(question => {
        const wasSkipped = !question.response || question.response === didNotAnswer || !question.response.trim();
        const insightsToShow = getAbridgedInsights(question.insights);
        const shouldShowToggle = question.response && question.response.length > 110;

        const questionDiv = document.createElement("div");
        questionDiv.className = "question-summary";
        if (wasSkipped) questionDiv.classList.add("skipped");

        questionDiv.innerHTML = `
        <p class="section-label">
          <i class="fas ${wasSkipped ? "fa-minus-circle skipped-icon" : "fa-check-circle completed-icon"}"></i> Question:
        </p>
        <h4 class="question-text">${question.prompt}</h4>

        <p class="section-label">Your Response:</p>
        ${wasSkipped ? `
          <p class="response-snippet muted">${didNotAnswer}</p>
        ` : `
          <div class="response-line">
            <p class="response-snippet short-text">${truncateResponse(question.response)}</p>
            <p class="response-snippet full-text hidden">${question.response}</p>
            ${shouldShowToggle ? `
            <button class="circle-toggle-btn" onclick="toggleExpand(this)" title="Expand/Collapse">
              <i class="fas fa-chevron-down"></i>
            </button>
          ` : ""}
          </div>
        `}

      ${wasSkipped ? `<div class="insight-box cody-chat-row-left">
            <div class="avatar-side">
              <img src="${avatarPath}" class="avatar-img" alt="Cody" />
            </div>
            <div class="cody-chat-bubble">
              <p>${insightMessages.noResponse}</p>
            </div>
          </div>
        ` : `
        ${insightsToShow.map(insight => `
          <div class="insight-box cody-chat-row-left">
            <div class="avatar-side">
              <img src="${avatarPath}" class="avatar-img" alt="Cody" />
            </div>
            <div class="cody-chat-bubble">
              <p>${insightMessages[insight]}</p>
            </div>
          </div>
        `).join("")}
      `}
     `;

        summaryContainer.appendChild(questionDiv);
    });

    completeAndUnlockNextByName(currentInterviewType);
}

// Reorder all insights for interview question responses (positives, critiques, neutral)
function reorderInterviewInsights() {
    currentInterviewQuestions.forEach(question => {
        const insights = question?.insights;
        if (!insights || !Array.isArray(insights)) return;

        insights.sort((a, b) => {
            const isPositiveA = positiveInsightKeys.includes(a) && a !== "default" && a !== "headDefault";
            const isPositiveB = positiveInsightKeys.includes(b) && b !== "default" && b !== "headDefault";
            const isNeutralA = (a === "default" || a === "headDefault");
            const isNeutralB = (b === "default" || b === "headDefault");

            // Positives first
            if (isPositiveA && !isPositiveB) return -1;
            if (!isPositiveA && isPositiveB) return 1;

            // Neutrals (defaults) last
            if (isNeutralA && !isNeutralB) return 1;
            if (!isNeutralA && isNeutralB) return -1;

            return 0; // Keep existing order if same category
        });
    });
}

// Helper function used to determine the number of questions that were answered during the interview
function countAnsweredQuestions(arr) {
    return arr.filter(q => q.response && q.response !== didNotAnswer).length;
}

// Used to calculate the user's Confidence Score
function calculateConfidenceScore(questions) {
    let score = 0;
    let count = 0;

    questions.forEach(q => {
        if (!q || !q.insights) return;

        count++;

        if (!q.response || q.response === didNotAnswer) {
            score += 0;
        } else {
            let qScore = 82;

            // Major penalties
            if (q.insights.includes("avoidLanguage")) qScore -= 25;
            if (q.insights.includes("negativeTone")) qScore -= 25;

            // Moderate penalties
            if (q.insights.includes("tooShort")) qScore -= 15;
            if (q.insights.includes("tooLong")) qScore -= 15;
            if (q.insights.includes("headDistracted")) qScore -= 15;

            // Minor penalties
            if (q.insights.includes("fillerHeavy")) qScore -= 10;
            if (q.insights.includes("lowKeywordMatch")) qScore -= 10;
            if (q.insights.includes("generic")) qScore -= 10;

            // Bonus points (capped so score don't exceed 100)
            if (q.insights.includes("keywordMatchHigh")) qScore += 8;
            if (q.insights.includes("headFocused")) qScore += 5;
            if (q.insights.includes("teamwork")) qScore += 2;
            if (q.insights.includes("learning")) qScore += 2;
            if (q.insights.includes("headDefault")) qScore += 1;

            qScore = Math.max(0, Math.min(100, qScore));
            score += qScore;
        }
    });

    return count > 0 ? Math.round(score / count) : 0;
}

// Toggle handler for the arrows associated with the user's feedback in the Summary page
function toggleExpand(btn) {
    const container = btn.closest(".question-summary");
    const shortText = container.querySelector(".short-text");
    const fullText = container.querySelector(".full-text");
    const icon = btn.querySelector("i");

    const isExpanded = !fullText.classList.contains("hidden");

    if (isExpanded) {
        fullText.classList.add("hidden");
        shortText.classList.remove("hidden");
        icon.classList.remove("fa-chevron-up");
        icon.classList.add("fa-chevron-down");
    } else {
        fullText.classList.remove("hidden");
        shortText.classList.add("hidden");
        icon.classList.remove("fa-chevron-down");
        icon.classList.add("fa-chevron-up");
    }
}

// Handles showing/hiding the confidence score tooltip that appears in the Summary and Interview Overview
document.querySelectorAll(".tooltip-wrapper").forEach(wrapper => {
    const icon = wrapper.querySelector(".fa-info-circle");
    const tooltip = wrapper.querySelector(".tooltip-text");

    icon.addEventListener("click", () => {
        const isVisible = tooltip.getAttribute("data-active") === "true";

        if (isVisible) {
            tooltip.style.visibility = "hidden";
            tooltip.style.opacity = 0;
            tooltip.setAttribute("data-active", "false");
        } else {
            tooltip.style.visibility = "visible";
            tooltip.style.opacity = 1;
            tooltip.setAttribute("data-active", "true");

            // Auto-close after 4 seconds
            setTimeout(() => {
                tooltip.style.visibility = "hidden";
                tooltip.style.opacity = 0;
                tooltip.setAttribute("data-active", "false");
            }, 4000);
        }
    });
});

// Helper function that confirms the user wishes to leave the summary
function confirmLeaveSummary() {
    closeModal();
    stopMediaTracking();    
    startInterviewSessionOverivew();
}

// Formats data as a downloadable text blob
function downloadTranscript() {
    const type = currentInterviewType;
    const interviewLabel = getInterviewLabelFromType(type);
    const summary = JSON.parse(localStorage.getItem(`interviewSummary-${type}`)) || {
        date: "N/A",
        answered: "N/A",
        confidence: "N/A"
    };

    const questions = currentInterviewQuestions || [];

    const header = `
------------------------------------------------
${interviewLabel} - Transcript
------------------------------------------------

Note: This transcript was created using browser-based speech recognition.
Due to Web API limitations, some words may be missed, and longer responses can appear condensed into a single block.

Results Summary:

Date: ${summary.date}
Questions Answered: ${summary.answered}
Confidence Score: ${summary.confidence}

---
`;

    const transcriptBody = questions.map((entry, i) => {
        const response = entry.response?.trim() || "(No response)";
        const insights = entry.insights || [];

        const insightLines = insights.length > 0 ?
            insights.map(insight => `  - ${insightMessages[insight] || insightMessages.noResponse}`).join("\n") :
            `  - ${insightMessages.noResponse}`;

        return `Q${i + 1}: ${entry.prompt}\n\nYour Response: ${response}\n\nFeedback:\n${insightLines}\n`;
    }).join("\n---\n\n");

    const blob = new Blob([header + transcriptBody], {
        type: "text/plain"
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `steady-talk_${type}-transcript.txt`;
    link.click();
    URL.revokeObjectURL(url);
}

// Creates a downloadable audio blob
// Note: this function is currently not being used
function downloadAudioBlobs() {
    const zip = new JSZip();

    currentInterviewQuestions.forEach((q, i) => {
        if (q.audio) {
            zip.file(`audio_q${i + 1}.weba`, q.audio);
        }
    });

    zip.generateAsync({
        type: "blob"
    }).then(content => {
        const link = document.createElement("a");
        link.href = URL.createObjectURL(content);
        link.download = `steady-talk_${currentInterviewType}-audio.zip`;
        link.click();
    });
}

// Creates a downloadable video blob
function downloadVideoBlobs() {
    const zip = new JSZip();

    currentInterviewQuestions.forEach((q, i) => {
        if (q.video) {
            zip.file(`video_q${i + 1}.webm`, q.video);
        }
    });

    zip.generateAsync({
        type: "blob"
    }).then(content => {
        const link = document.createElement("a");
        link.href = URL.createObjectURL(content);
        link.download = `steady-talk_${currentInterviewType}-responses.zip`;
        link.click();
    });
}

//----------------------------------
//  Modal Helper Functions
//----------------------------------
// Shows the Change Industry modal
function changeIndustry() {

    const title = "Change Industry";
    openModal(title, `
            <div class="field-group">
              
            <p>Please select an industry of your choice. The industry will determine the company you're assigned in the simulation.</p>
            <br>
              <div class="industry-options">
                <button class="industry-btn modal-industry-btn" data-value="healthcare" title="Healthcare">
                  <i class="fas fa-stethoscope"></i> Healthcare
                </button>
                <button class="industry-btn modal-industry-btn" data-value="it" title="Information Technology">
                  <i class="fas fa-laptop-code"></i> Information Technology
                </button>
                <button class="industry-btn modal-industry-btn" data-value="industrial" title="Industrial">
                  <i class="fas fa-truck-moving"></i> Industrial
                </button>
                <button class="industry-btn modal-industry-btn" data-value="random" title="Pick for Me">
                  <i class="fas fa-shuffle"></i> Pick for Me
                </button>
              </div>
              <input type="hidden" id="modalSelectedIndustry" />
            </div>

          <button id="submitIndustry" class="primary-btn" title="Submit">Submit</button>
          <p id="industryErrorModal" class="error-msg hidden">Please select an industry.</p>
          <p id="industrySuccessModal" class="success-msg hidden">You have successfully updated your industry.</p>
  `);

    addIndustryEvents();
}

// Shows the Reset Progress modal
function resetProgress() {

    const title = "Reset Progress?";
    openModal(title, `
              <p>Are you sure you want to reset your progress? This will remove all your current data and refresh the page.</p>

              <div class="modal-footer-bns">  
                <button id="no-reset" class="primary-btn" onclick="closeModal()" title="No, Don't Reset">
                  No, Don't Reset
                </button>
                <button id="yes-reset" class="warning-btn" onclick="clearSteadyTalkData()" title="Yes, Reset Progress">
                  Yes, Reset Progress
                </button>
             </div> 
    `);
}

// Shows the Resources modal
function showResources() {
    const title = "Resources";
    openModal(title, `
              <h3>Internal Resources</h3>
               <ul>
                  <li>
                    <a title="Interview Communication Tips" target="_blank" class="link" href="documents/Interview_Communication_Tips.pdf">
                      Interview Communication Tips (<i class="fa-solid fa-file-pdf"></i>)
                    </a>
                  </li>
                  <li>
                    <a title="Structuring Interview Responses" target="_blank" class="link" href="documents/Structuring_Interview_Responses.pdf">
                      Structuring Interview Responses (<i class="fa-solid fa-file-pdf"></i>)
                    </a>
                  </li>

                  <li>
                    <a title="Thank-You Note Template" target="_blank" class="link" href="documents/Thank-You_Note_Template.pdf">
                      Thank-You Note Template (<i class="fa-solid fa-file-pdf"></i>)
                    </a>
                  </li>
               </ul> 
               <hr class="navbar-divider">
              <h3>External Resources</h3>
              <ul>                
                  <li>
                    <a title="The 8 Major Types of Interview" target="_blank" class="link" href="https://slinuacareers.com/8-major-types-interviews/">
                      The 8 Major Types of Interview (<i class="fa-solid fa-link"></i>)
                    </a>
                  </li>
                  <li>
                    <a title="The Best Job Interview Tips" target="_blank" class="link" href="https://www.linkedin.com/pulse/best-job-interview-tips-alexander-besant">
                      The Best Job Interview Tips (<i class="fa-solid fa-link"></i>)
                    </a>
                  </li>
                  <li>
                    <a title="Job Rejection Isn't the End: How to Bounce Back Stronger" target="_blank" class="link" href="https://www.thehirefirm.com/2025/06/11/job-rejection-isnt-the-end-how-to-bounce-back-stronger/">
                      Job Rejection Isn't the End: How to Bounce Back Stronger (<i class="fa-solid fa-link"></i>)
                    </a>
                  </li>
               </ul> 
    `);

}

// Shows the Update Username modal
function updateUsername() {
    const title = "Change Name";
    openModal(title, `
        <div class="field-group">
          <p>Please enter your full name below. This name will be used throughout the simulation.</p>
          <input type="text" id="modalUsername" placeholder="${username}" maxlength="40"/>
        </div>
        <button id="submitUsername" class="primary-btn" title="Submit">Submit</button>
        <p id="usernameErrorModal" class="error-msg hidden">Please enter your full name.</p>
        <p id="usernameSuccessModal" class="success-msg hidden">You have successfully updated your name.</p>
    `);

    addUserNameEvents();
}

// Shows the About modal
function showAbout() {
    const title = "About";
    openModal(title, `
      <p>
        Steady Talk is an interview simulation designed to help individuals practice and improve conversational skills in a low-pressure environment. Users can engage with a range of interview types using realistic questions, voice-based responses, and personalized mentor feedback.
        <br><br>
        This project is provided as-is for educational and demonstration purposes.
        <br><br>
        The simulation, including all video editing, timing, and interactive flow, was designed and developed by <a href="https://www.linkedin.com/in/dominique-thomas-ab56b433/" target="_blank" title="Dominique Thomas">Dominique Thomas</a>.<br><br>
        AI avatar videos were generated using <a href="https://www.heygen.com/" target="_blank" title="HeyGen">HeyGen</a>, and gesture detection was powered by <a href="https://www.tensorflow.org/js" target="_blank" title="TensorFlow.js">TensorFlow.js</a>.
      </p>

    `);
}

// Shows the Start New Session modal
function showNewSessionWarning() {
    const title = "Start New Interview?";
    openModal(title, `
    <p>Starting a new interview will clear your previous responses and progress for this stage. Are you sure you want to continue?</p>

    <div class="modal-footer-bns">  
      <button class="primary-btn" onclick="closeModal()" title="No, Don't Start Interview">
        No, Don't Start Interview
      </button>
      <button class="outline-btn" onclick="confirmNewInterview()" title="Yes, Start New Interview">
        Yes, Start New Interview
      </button>
    </div> 
  `);
}

// Shows the Exit Summary Warning modal
function showExitSummaryWarning() {
    const title = "Leave the Summary?";
    openModal(title, `
    <p>Leaving this page will erase your session data, including transcript, audio, and video. Be sure to download anything you'd like to keep before leaving.</p>

    <div class="modal-footer-bns">  
      <button class="primary-btn" onclick="closeModal()" title="No, Stay on Summary">
        No, Stay on Summary
      </button>
      <button class="outline-btn" onclick="confirmLeaveSummary()" title="Yes, Leave Summary">
        Yes, Leave Summary
      </button>
    </div> 
  `);
}

// Shows the Stop Interview modal
function handleStopInterview() {

    pauseInterviewMedia();
    activeModalContext = "pause-interview";

    const title = "Stop Interview?";
    openModal(title, `
    <p>
      Are you sure you want to stop this interview? Your progress will not be saved.
    </p>
    
    <div class="modal-footer-bns">  
      <button class="primary-btn" onclick="closeModal()" title="No, Cancel">No, Cancel</button>
      <button class="outline-btn" onclick="exitToOverview()" title="Yes, Stop Interview">Yes, Stop Interview</button>
    </div>
  `);
}

// Handles opening the modal
function openModal(title, htmlContent) {
    document.getElementById("modal-title").textContent = title;
    document.getElementById("modal-body").innerHTML = "";
    document.getElementById("modal-body").innerHTML = htmlContent;
    document.getElementById("modal-overlay").classList.remove("hidden");
}

// Handles closing the modal
function closeModal() {
    document.getElementById("modal-overlay").classList.add("hidden");

    if (activeModalContext === "pause-interview") {
        resumeInterviewMedia();
        isAudioCaptureActive = true;
    }
    activeModalContext = null;

    document.querySelectorAll(".app-sidebar li").forEach(el => {
        if (el.classList.contains("default")) {
            el.classList.remove("active");
        }
    });

    reapplySidebarActive();
}

// Specifies if the sidebar has the "active" class
function reapplySidebarActive() {
    if (!lastActiveSidebarTitle) return;

    document.querySelectorAll("#app-sidebar li.journey-item").forEach(i => {
        i.classList.toggle("active", i.getAttribute("title") === lastActiveSidebarTitle);
    });
}

// Close the modal if the user clicks the "X" button
document.getElementById("modal-close").addEventListener("click", closeModal);

// Close the modal if the user clicks overlay
document.getElementById("modal-overlay").addEventListener("click", (e) => {
    if (e.target === e.currentTarget) closeModal();
});

//----------------------------------
//  Misc. Helper Functions
//----------------------------------
// Helper function that truncates a response; used in the Summary page
function truncateResponse(text, maxLength = 100) {
    if (!text) return "";
    return text.length > maxLength ?
        text.slice(0, maxLength).trim() + "..." :
        text;
}

// Retreives a minimum of 1 insight, so that the Summary page isn't too long
function getAbridgedInsights(insights, maxShown = 1) {
    if (!insights || insights.length === 0) return [];

    const isPositive = (insight) => positiveInsightKeys.includes(insight);
    const positives = insights.filter(isPositive);
    const constructives = insights.filter(insight => !isPositive(insight));

    let selected = [];

    // Check for positive insights first, then constructive
    if (positives.length > 0) {
        selected = positives.slice(0, maxShown);
    } else {
        selected = constructives.slice(0, maxShown);
    }

    if ((positives.length + constructives.length) > selected.length) {
        selected.push("additionalFeedback");
    }

    return selected;
}

// Append current interview insights to the global log
function appendToGlobalLog() {
    const log = JSON.parse(localStorage.getItem("interviewResponsesLog")) || [];

    const data = currentInterviewQuestions.map(q => ({
        interviewType: currentInterviewType,
        prompt: q.prompt,
        response: q.response,
        insights: q.insights || [],
        timestamp: new Date().toISOString()
    }));

    localStorage.setItem("interviewResponsesLog", JSON.stringify([...log, ...data]));
}

// Calculate the global insights across all interviews
function calculateGlobalInsights() {
    const log = JSON.parse(localStorage.getItem("interviewResponsesLog")) || [];
    const completed = log.filter(entry => entry.response && entry.response !== didNotAnswer);

    if (completed.length === 0) {
        globalInsights = [];
        return;
    }

    const tally = {};

    for (const entry of log) {
        for (const tag of (entry.insights || [])) {
            if (globalInsightMessages[tag]) {
                tally[tag] = (tally[tag] || 0) + 1;
            }
        }
    }

    const sortedTags = Object.keys(tally)
        .filter(tag => tally[tag] >= 3)
        .sort((a, b) => tally[b] - tally[a]);

    globalInsights = sortedTags.length > 0 ?
        sortedTags.map(tag => ({
            key: tag,
            message: globalInsightMessages[tag]
        })) :
        [{
            key: "default",
            message: globalInsightMessages.default
        }];
}

// Helper function used to format the current date
function formatDate(dateObj) {
    return dateObj.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric"
    });
}

// Helper function that updates the username placeholder
function updateFirstNameStr(str) {
    return str.replaceAll(firstNamePlaceholder, firstName || "there");
}

// Helper function used to pick a random element from an array 
function pickRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

// Helper function used to pick multiple random elements from an array
function pickMultipleRandom(arr, count) {
    const copy = [...arr];
    const result = [];

    for (let i = 0; i < count && copy.length > 0; i++) {
        const index = Math.floor(Math.random() * copy.length);
        result.push(copy.splice(index, 1)[0]);
    }

    return result;
}

// Helper function that skips to the end of a specified video
function skipToVideoEnd(videoId, buttonId) {
  const video = document.getElementById(videoId);
  const button = document.getElementById(buttonId);
  if (!video) return;

  // Jump to 1 second before the end (or 0.5s if really short)
  const skipTime = Math.max(video.duration - 1, 0.5);
  video.currentTime = skipTime;

  // Hide the skip button once clicked
  if (button) button.style.display = "none";

  // Ensure playback resumes
  video.play();
}

// Helper function that scrolls to the top of the window
function scrollToTopOfApp() {
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
}

// Helper function that scrolls to the bottom of the main chat div
function scrollToWindowBottom() {
    const chatBody = document.getElementById("main-chat");
    chatBody.scrollTop = chatBody.scrollHeight;
}

// Adds a visual divider
function addDivider(containerId) {
    const divider = document.createElement("hr");
    divider.classList.add("divider");
    document.getElementById(containerId).appendChild(divider);
}

// Helper function used to fade in an element
function fadeIn(el) {
    el.classList.remove("hidden");
    el.classList.add("fade-in");
}

// Helper method to "clean up" the transcript; capitalizes first word and adds period to the end
function cleanTranscript(text) {
    if (!text || typeof text !== "string") return text;

    let trimmed = text.trim();
    trimmed = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);

    if (!/[.?!]$/.test(trimmed)) {
        trimmed += ".";
    }

    return trimmed;
}

// Development login; for testing purposes
function devLogin(name = "Dominique Thomas", industry = "healthcare") {

    setUsername(name);
    updateUserBadge(name);

    localStorage.setItem("username", name);
    localStorage.setItem("userIndustry", industry);
    localStorage.setItem("isFirstTimeUser", "true");
    localStorage.setItem("unlockedSections", JSON.stringify([0, 0, 0, 0]));
    document.getElementById("intro-overlay")?.classList.add("hidden");
    document.getElementById("app-shell")?.classList.remove("hidden");

    showWelcomeMessage();
}

// Specifies the industry was viewed (used to unlock next menu item in the list); for testing purposes
function companyWasViewed() {
    completeAndUnlockNextByName("companyOverview");
}

// Clears the local host data to reset progress
function clearSteadyTalkData() {

    const interviewTypes = ["prescreen", "hiringManager", "teamFit"];
    const keysToClear = [
        "username",
        "userIndustry",
        "isFirstTimeUser",
        "unlockedSections", //progressKey
        "completedSections",
        "interviewResponsesLog",
        ...interviewTypes.map(type => `interviewSummary-${type}`)
    ];

    keysToClear.forEach(key => localStorage.removeItem(key));
    location.reload();
}