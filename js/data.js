/**
 * Project: Steady Talk
 * Description: Stores all dynamic data for the app, including interview questions, sample answers, company profiles, and insight tags.
 * Author: Dominique Thomas (github.com/dominique-thomas)
 * License: Shared publicly for demonstration purposes only. Reuse or redistribution not permitted without permission.
 */
// List of interview intro videos 
const interviewerIntros = {
    prescreen: ["prescreen_intro.mp4"],
    hiringManager: ["hiringManager_intro.mp4"],
    teamFit: ["teamFit_intro.mp4"]
};

// List of interview outro videos
const interviewerOutros = {
    prescreen: "prescreen_outro.mp4",
    hiringManager: "hiringManager_outro.mp4",
    teamFit: "teamFit_outro.mp4"
};

// List of mentor outro videos that are randomly displayed at the end of the interview session
const mentorOutros = [
    "mentor_outro_0.mp4",
    "mentor_outro_1.mp4",
    "mentor_outro_2.mp4"
];

// Company profile data; this data is used in the main app, as well as to show data in the mockup company page
const companyData = {
    it: {
        name: "Flow Labs",
        tagline: "Empowering teams to move forward.",
        about: "Flow Labs was founded in 2017 and is based in the Pacific Northwest. We build cloud-based tools to help teams stay organized. We offer B2B solutions to make team collaboration smoother. We serve small to mid-size businesses across various industries.",
        unique: "Our tools are lightweight, easy to learn, and built for fast-moving teams that need clarity without clutter. We listen closely to user feedback and release regular updates that reflect what real teams want.",
        values: [{
                label: "Simplicity First",
                description: "We believe software should feel easy and get out of your way."
            },
            {
                label: "People Over Features",
                description: "We prioritize what helps people work better, not what looks flashy."
            },
            {
                label: "Constantly Moving",
                description: "We iterate quickly and aim for steady improvement."
            }
        ],
        image: "technology.png",
        email: "contact@flowlabs.com",
        phone: "(800) 555-FLOW",
        hours: "Mon-Fri, 9AM-5PM PST",
        team: [{
                name: "Alicia Torres",
                role: "Talent Acquisition Lead",
                bio: "Connects great people with the right opportunities."
            },
            {
                name: "Dana Wu",
                role: "Product Manager",
                bio: "Oversees development cycles and prioritizes strategic features."
            },
            {
                name: "Marcus Reed",
                role: "Product Designer",
                bio: "Crafts intuitive tools that help teams work more efficiently."
            }
        ]
    },
    healthcare: {
        name: "Vitalscope",
        tagline: "Care that fits your routine.",
        about: "Vitalscope was established in 2015 and is based in the Pacific Northwest. We develop diagnostic tools and remote monitoring solutions aimed at helping healthcare providers improve everyday care. We primarily serve outpatient clinics, regional hospitals, and care teams managing chronic conditions.",
        unique: "Vitalscope focuses on vitals trackers which supports better visibility and coordination between providers and patients.",
        values: [{
                label: "Compassion",
                description: "We create tools with both clinicians and patients in mind."
            },
            {
                label: "Reliability",
                description: "Our products are built to work consistently and reliably."
            },
            {
                label: "Clarity",
                description: "We prioritize ease of use for all users."
            }
        ],
        image: "healthcare.png",
        email: "contact@vitalscope.com",
        phone: "(800) 555-CARE",
        hours: "Mon-Fri, 8AM-6PM PST",
        team: [{
                name: "Alicia Torres",
                role: "Recruiter",
                bio: "Finds compassionate professionals ready to grow in healthcare."
            },
            {
                name: "Dana Wu",
                role: "Clinical Program Director",
                bio: "Helps bring diagnostic tools into hospitals and clinics across the country."
            },
            {
                name: "Marcus Reed",
                role: "Biomedical Engineer",
                bio: "Builds wearable devices that help patients monitor their health from home."
            }
        ]
    },
    industrial: {
        name: "Summit Freight",
        tagline: "Built for the long haul.",
        about: "Summit Freight was founded in 2003 and is based in the Pacific Northwest. We specialize in long-haul trucking, freight transport, and supply routes that serve manufacturers, warehouses, and essential industries across the region.",
        unique: "At Summit Freight, we go where others won't. Our fleet is equipped for harsh weather and remote roads, and our real-time routing keeps drivers safe and deliveries on time.",
        values: [{
                label: "Reliability",
                description: "Every delivery counts, no matter how big or small."
            },
            {
                label: "Adaptability",
                description: "We evolved to overcome terrain and climate."
            },
            {
                label: "Transparency",
                description: "We believe clear communication builds trust."
            }
        ],
        image: "industrial.png",
        email: "contact@summitfreight.com",
        phone: "(800) 555-TRUK",
        hours: "Mon-Fri, 8AM-6PM PST",
        team: [{
                name: "Alicia Torres",
                role: "Recruiter",
                bio: "Connects logistics talent to career growth."
            },
            {
                name: "Dana Wu",
                role: "Operations Manager",
                bio: "Oversees delivery strategy and scheduling."
            },
            {
                name: "Marcus Reed",
                role: "Logistics Specialist",
                bio: "Oversees fleet coordination across the freight network."
            }
        ]
    }
};

// Placeholder username 
const firstNamePlaceholder = "firstNamePlaceholder";

// Dialog for when the user asks too many personal questions about the mentor
const fallbackCooldowns = [
    "Okay, that's enough about me for now.",
    "Let's save the rest for later!",
    "How about we talk about something else?",
    "Whew! I'm tired about talking about myself.",
    `${firstNamePlaceholder}, I'm glad you want to know more about me, but maybe another time.`,
];

// Dialog for when the user first launches the app
const firstTimeGreetings = [
    `Welcome, ${firstNamePlaceholder}. I'm Cody, your interview mentor. Excited to help you get started.`,
    `Glad you're here. Let's walk through how this works.`,
    `Hey ${firstNamePlaceholder}, ready to build some confidence and sharpen your interview game?`
];

// Dialog for when the user returns to the app
const returningGreetings = [
    `Hey there ${firstNamePlaceholder}. Are you ready to level up your skills?`,
    "Welcome back! I'm glad you decided to join us again.",
    `It's good to see you again, ${firstNamePlaceholder}.`
];

// Dialog used to transition between topics; specifically when the user first logs into the app
const introBridges = [
    "If you're not sure where to start, I can help with that.",
    "We'll take it one step at a time, just let me know if you have any questions.",
    "If you'd like, I can walk you through your next step.",
    "Before continuing, do you have anything you'd like to ask me?"
];

// Dialog used to transition between topics
const bridgePhrases = [
    `Should we talk about something else, ${firstNamePlaceholder}?`,
    "Is there anything else on your mind?",
    "Would you like to explore a different topic?",
    "Need help with something?",
    `What would you like to talk about next, ${firstNamePlaceholder}?`,
    "I'm ready to keep going, just say the word!"
];

// Dialog about Cody
const codyPersonalFacts = [
    "I have two cats, Rocky and Muffin. Rocky thinks he's a dog, and Muffin just judges everyone.",
    "Back in high school, I had a counselor who completely changed how I saw myself. That's what made me want to become a mentor myself.",
    "I try to volunteer at my local food shelter on weekends, but I've been swamped lately. Still, it's something I care about.",
    "Work keeps me busy. I take it seriously. But I do make time for bowling after hours. I'm pretty decent, really.",
    "I once won an award for coaching the most candidates into successful tech roles. It was a proud moment for me!",
    "When I'm not mentoring, I'm probably watching old game shows or planning a trip I'll take eventually.",
    "I love helping people get unstuck. Everyone deserves a shot at being heard and seen.",
    "I'm a sucker for action-adventure movies! Give me a treasure hunt and a ticking clock and I'm all in.",
    "I've been teaching myself crochet. I'm still pretty bad at it, but it's oddly relaxing.",
    "I love quiet Sunday mornings with coffee, soft music, and no emails. That's the dream.",
    "I've been slowly working on a guidebook for job seekers. Not sure if I'll ever publish it, but it's my little passion project.",
    "Every once in a while, I try to design career worksheets. I like making practical tools for people who feel stuck.",
    "I keep a corkboard full of interview advice quotes. Some are great, some are awful, but I love collecting them!",
    "I have a small mountain of unread romance novels. I keep buying more and I'm not going to stop anytime soon!",
    "There's this outrageous drink on the menu at my local coffee place. I think about ordering it every week, but I never do.",
    "My older brother is obsessed with pro wrestling. I resisted it for years, but I enjoy all the drama!",
    "I alphabetize my spices but hate folding laundry. Chaos in balance, right?",
    "I have a favorite pen. If I lose it, my day is ruined. Well, not really.",
    "One time, a candidate completely froze mid-response. We paused, took a breath, and reframed the question. They nailed it the second time.",
    "I once mentored someone who never done a video call before, now they lead remote teams. I'm so proud of them!",
    "There was a candidate who always looked away when speaking. We worked on posture and eye contact, and it totally changed their vibe.",
    "Someone told me they were 'too nervous' to be good at interviews. I told them nerves just mean you care.",
    "I like to help people find confidence in their own voice!",
    "Some folks just need one person to believe in them. That's what my old counselor did for me, and now I try to pass it on to others.",
    "I know how hard it is to talk about yourself. Being able to help someone feel heard is the best part of my job."
];

// Dialog used to provide general interview advice
const generalTips = [
    "Try to keep each answer under two minutes. Keep your answers short, strong, and structured.",
    "Don't forget to smile, as it helps your tone sound more natural and warm.",
    "If you get stuck, take a breath. A short pause is better than rambling.",
    "Use the STAR method to answer behavioral questions.",
    "Speak with intention. It's better to say less with clarity than more with confusion.",
    "Avoid filler words like 'um', 'like', and 'so'. Pause for a moment to gather your thoughts rather than rushing your response.",
    "Mirror the energy and tone of your interviewer, but always stay authentic.",
    "Keep your posture open and relaxed, as it helps you sound more confident.",
    "Don't be afraid of silence. It's okay to take a second before answering.",
    "Always tie your experience back to how it benefits the company, not just what you did.",
    "Try to include key terms that relate to the question, as it shows you're focused and prepared.",
    "Practice your answers out loud, as it helps you sound natural.",
    "Always research the company beforehand so your examples feel tailored.",
    "Listen carefully to the question. It's okay to ask for clarification before answering.",
    "If you don't know something, be honest and explain how you'd find the answer.",
    "End answers on a positive note by focusing on results or growth.",
    "Prepare one or two thoughtful questions to ask at the end of the interview, as it shows you're engaged and curious about the role.",
];

// Dialog used to provide advice for using this simulation
const simulationBehaviorTips = [
    "Try to look at the webcam when speaking as it gives the impression of eye contact.",
    "Keep your camera at eye level as it makes your posture feel more natural.",
    "Relax your shoulders and sit upright. This will make you come across more confident.",
    "Smile before you speak, as this helps reset your tone and presence.",
    "Avoid multitasking when using the simulation. Treat each question like a real interview question.",
    "Make sure your microphone is close enough to pick up your voice clearly.",
    "If you're nervous, that's okay. Take a second before answering.",
    "Watch out for filler words like 'um', 'like', or 'so'.",
    "Look at the camera like you're talking to a real person.",
    "Head over to the Resources section for interview tips and templates.",
    "Resources are always available and especially useful before starting a new interview.",
    "You can change your selected industry anytime using the Change Industry button in the sidebar.",
    "You can update your name anytime by clicking the initials in the top right corner.",
    "Your name appears in several places, but you can update it anytime.",
    "If you want to start over from scratch, you can use the Reset Progress option in the sidebar.",
    "During interviews, you can use on-screen buttons to repeat questions or advance to the next question.",
    "This simulation uses a confidence score which is calculated based on your tone, use of relevant language, and how attentive you appear.",
    "Download your data before leaving the interview summary, because it will not be saved otherwise."
];

// Dialog that directs users to the next area of interest in the Interview Journey
const interviewSections = {
    companyOverview: {
        intro: [
            "Start with the Company Profile first. Think of it like doing research before an interview. There you will learn about the mission, values, and culture."
        ],
        reminders: [
            "I recommend that you start with the Company Profile.",
            "The Company Profile should come first. Just click the first section in the sidebar.",
            "You should begin with the Company Profile to learn more about your match."
        ]
    },
    prescreenInterview: {
        intro: [
            "Next is the Prescreen Interview. It's a quick introductory call with a recruiter to confirm your interest in a role, your availability, and basic information."
        ],
        reminders: [
            "Prescreen Interview is your next step.",
            "Go ahead and try the Prescreen Interview next.",
            "The Prescreen Interview is next in your journey."
        ]
    },
    hiringManagerInterview: {
        intro: [
            "You should visit the Hiring Manager Interview next. This one is more in-depth and focuses on your experience and qualifications."
        ],
        reminders: [
            "The Hiring Manager Interview is up next.",
            "You're ready for the Hiring Manager Interview next.",
            "Next is the Hiring Manager Interview. This is where you'll get into your background and strengths."
        ]
    },
    teamFitInterview: {
        intro: [
            "The final stage is the Team Fit Interview. This one's all about communication style and team alignment."
        ],
        reminders: [
            "Finish strong with the Team Fit Interview!",
            "Next up is the Team Fit interview. It's all about personality and presence.",
            "The last interview is the Team Fit Interview. This is where they see if you'd mesh well with the team."
        ]
    },
    completedJourney: {
        intro: [
            `You've completed the full interview journey. Well done, ${firstNamePlaceholder}! At this point, you can revisit any section for more practice or head to the Resources section for extra support.`
        ],
        reminders: [
            `You've finished your interview journey! Great job, ${firstNamePlaceholder}.`,
            "Feel free to revisit any section or check out the Resources section.",
            "You've completed your interview journey. Now's a good time to reflect or practice again."
        ]
    }
}

// Specifies words that are considered 'filler words'; affects final confidence score
const fillerWords = ["um", "uh", "like", "you know", "so", "basically"];

// Specifies words that should not be mentioned during a particular interview session; affects final confidence score
const avoidKeywords = {
    prescreen: [
        "salary", "pay", "compensation", "benefits", "vacation",
        "PTO", "bonus", "time off", "overtime"
    ],
    hiringManager: [
        "vacation", "PTO", "reduced hours", "early leave",
        "part-time", "short schedule", "personal time"
    ],
    teamFit: [
        "hate teams", "don't like working with others", "prefer to work alone",
        "not a people person", "not big on collaboration"
    ]
};

// Specifies words that are considered 'negative'; affects final confidence score
const negativePhrases = [
    "lazy",
    "dumb",
    "hate",
    "annoying",
    "don't like",
    "don't want",
    "not interested",
    "not good",
    "hate feedback",
    "conflict avoidant",
    "avoid responsibility",
    "bad at communicating",
    "not the best"
];

// Specifies words that are considered 'generic'; affects final confidence score
const genericPhrases = ["team player", "hard worker", "good communicator", "fast learner", "self-starter", "detail-oriented", "motivated", "go-getter", "good with people", "excellent time management", "strong work ethic", "quick learner", "multitasker", "results-driven", "passionate", "dedicated", "adaptable"];

// Specifies words that are considered 'teamwork-friendly terms'; affects final confidence score
const teamworkTerms = ["collaborate", "team", "together", "support", "shared", "we", "helped", "collaboration", "supportive", "assisted"];

// Specifies words that are geared towards learning/growth; affects final confidence score
const learningTerms = ["learn", "grew", "grew from", "growth", "curious", "new skill", "adapt", "improve"];

// Stores global insights, which is determined by insights gathered from completed interviews
let globalInsights = [];

// Specifies positive insights; shown in the interview summary screen
const positiveInsightKeys = [
    "keywordMatchHigh",  
    "teamwork",         
    "learning",          
    "headFocused",      
    "headDefault",       
    "default"          
];

// Collection of global positive/negative insight messages
const globalInsightMessages = {
    tooShort: "Many of your responses were a bit short. Try adding examples or context to expand on your points.",
    tooLong: "Several of your answers were on the longer side. Keeping things concise and focused can help you make a stronger impression overall.",
    fillerHeavy: "Across your interviews, there were quite a few filler words. Practicing smoother delivery could make your responses more confident.",
    generic: "Some of your responses felt a bit generic. Personalizing your answers more can help you stand out.",
    lowKeywordMatch: "Some answers didn't include enough relevant ideas. Tying your responses closer to the question can make them stronger.",
    keywordMatchHigh: "You consistently used clear, relevant language that connected well to the questions. Great job!",
    teamwork: "You frequently highlighted collaboration and shared ownership throughout your answers.",
    learning: "You demonstrated a growth mindset by often mentioning how you learn, adapt, and stay curious.",
    negativeTone: "Some responses had wording that might come off as overly negative or dismissive. Try to keep your phrasing constructive.",
    avoidLanguage: "A few words or phrases could come across as unprofessional. Staying polished can leave a better impression.",
    noResponse: "Some questions weren't answered. Practicing those can help you feel more confident next time.",
    headDistracted: "You occasionally seemed distracted or off-camera during your interviews. Staying centered can help you feel more engaged.",
    headFocused: "You stayed focused and attentive throughout your interviews.",
    headDefault: "Your focus seemed steady throughout your interviews; nothing unusual stood out.",    
    default: "You're building a solid foundation with your responses. With a bit more practice, your delivery will feel even smoother."
};


// Collection of positive/negative insights that are displayed in the interview summary screen
const insightMessages = {
    tooShort: "Your answer was a bit brief. Try adding an example or more detail next time.",
    tooLong: "Your response was long. Consider being more concise while still hitting key points.",
    lowKeywordMatch: "You might want to include more relevant ideas that connect directly to the question.",
    keywordMatchHigh: "Nice job! You included some great terms in your answer.",
    teamwork: "You did a good job emphasizing collaboration and shared responsibility for this answer.",
    learning: "It's great to show a growth mindset. Keep it up!",
    generic: "You might want to personalize this answer more. Right now, it feels like it could apply to any job.",
    negativeTone: "Watch out for wording that could come off as overly negative or dismissive.",
    fillerHeavy: "Watch for filler words or hesitations. Try to speak with confidence.",
    avoidLanguage: "Be careful with certain words or phrases that could come across as inappropriate or unprofessional.",
    default: "Thanks for your answer! Nothing stood out here that needs major improvement.",
    noResponse: "You didn't answer this question. That's okay, try again next time.",
    headDefault: "You appeared mostly focused during this answer. Nothing stood out.",
    headDistracted: "You seemed distracted or off-camera during this question. Try to stay centered and engaged.",
    headFocused: "Nice job! You appeared focused and attentive throughout your answer.",
    additionalFeedback: "Additional feedback is available in your full transcript."
};

// Interview questions; organized based on the interview stage
const interviewQuestions = {
    prescreen: [{
            prompt: "Can you tell me a little about yourself?",
            keywords: {
                general: ["experience", "background", "role", "education", "strengths", "career path", "industry", "years", "pivot", "transition", "new field", "certification", "certificate", "bootcamp", "degree", "course", "training", "self-study"]
            },
            sampleAnswer: "I've worked in customer operations for the past three years, supporting clients in the healthcare space. I recently completed a certification in data analytics, and I'm now looking to pivot into a more technical role where I can use both my people skills and my growing interest in tech.",
        },
        {
            prompt: "What motivated you to apply for this role",
            keywords: {
                general: ["team", "mission", "goals", "values", "skills match", "career fit", "job title", "responsibilities"],
                it: ["technology", "innovation", "scaling", "startups", "cutting-edge"],
                healthcare: ["patients", "impact", "healthcare", "service", "compassion", "empathy"],
                industrial: ["logistics", "operations", "career growth", "efficiency", "systems"]
            },
            sampleAnswer: "The position aligns with both my recent training and my background in working with cross-functional teams. I liked that the role emphasizes communication and adaptability, and I'm really excited by the company's mission to improve collaboration across teams.",
        },
        {
            prompt: "Why are you interested in working here?",
            keywords: {
                general: ["culture", "mission", "alignment", "opportunity", "growth", "reputation", "team", "certification", "certificate", "bootcamp", "degree", "course", "training", "self-study"],
                it: ["platform", "tech stack", "scalability", "modern", "cloud-based"],
                healthcare: ["patient care", "remote monitoring", "wellness", "clinical", "diagnostics"],
                industrial: ["supply chain", "delivery", "infrastructure", "routes", "distribution"]
            },
            sampleAnswer: "What stood out to me was your focus on innovation and team-driven problem solving. I also liked the fact that you're building internal tools that help people do their work more efficiently - I'd love to be part of that.",
        },
        {
            prompt: "What do you know about our organization?",
            keywords: {
                general: ["founded", "mission", "leadership", "headquarters", "growth", "focus area", "overview"],
                it: ["2017", "Flow Labs", "Pacific Northwest", "B2B", "data-driven"],
                healthcare: ["2015", "Vital Scope", "wearable", "remote care", "telehealth", "Pacific Northwest"],
                industrial: ["2003", "Summit Freight", "freight", "fleet", "logistics network", "Pacific Northwest"]
            },
            sampleAnswer: "I know that the company was founded in 2015 and focuses on building internal collaboration tools. You've got a strong reputation for innovation and for supporting cross-functional teams, especially in fast-paced environments.",
        },
        {
            prompt: "What are you looking for in your next opportunity?",
            keywords: {
                general: ["growth", "challenge", "mentorship", "leadership", "responsibility", "autonomy", "impact", "learning", "change of pace"]
            },
            sampleAnswer: "I'm looking for a place where I can keep growing - somewhere that encourages learning, offers mentorship, and values initiative. I'd also love to work in a space that balances collaboration with autonomy.",
        },
        {
            prompt: "What's your availability like for starting a new position?",
            keywords: {
                general: ["immediate", "two weeks", "start date", "notice", "flexible", "available", "open to start", "timeline"]
            },
            sampleAnswer: "I'm available to start in two weeks, but I'm also open to discussing your timeline. I want to make sure there's a smooth transition either way.",
        },
        {
            prompt: "What type of environment brings out your best work?",
            keywords: {
                general: ["supportive", "focused", "quiet", "collaborative", "independent", "remote", "hybrid", "transparent"]
            },
            sampleAnswer: "I do really well in environments that are structured but flexible, where people are open to new ideas and communication flows   freely. I enjoy remote or hybrid setups where there's a good rhythm and mutual respect.",
        },
        {
            prompt: "What team environment do you work best in?",
            keywords: {
                general: ["inclusive", "respectful", "transparent", "open communication", "supportive", "trust", "values-aligned", "growth mindset"]
            },
            sampleAnswer: "I thrive in a culture where people respect each other's time, are open to feedback, and collaborate with a sense of purpose. I also appreciate environments where people feel safe to ask questions and contribute new ideas.",
        },
        {
            prompt: "What are you hoping to learn or grow in over the next year?",
            keywords: {
                general: ["training", "mentorship", "technical", "leadership", "projects", "collaboration", "coaching", "impact", "leadership", "learning"]
            },
            sampleAnswer: "Over the next year, I'd like to get stronger in technical communication and maybe even take on small project leadership tasks. I also want to keep learning through mentorship or hands-on experience - especially around team tools or internal platforms.",
        },
        {
            prompt: "What does a good day at work look like for you?",
            keywords: {
                general: ["productive", "impact", "collaboration", "organized", "goals met", "clear communication", "focus", "feedback", "learn", "support", "helping"]
            },
            sampleAnswer: "A good day is when I've made clear progress, communicated well with my team, and learned something new. I like finishing the day knowing I supported my coworkers and helped move something forward.",
        }
    ],

    hiringManager: [{
            prompt: "Why do you think you'd be a good fit for this role?",
            keywords: {
                general: ["experience", "skills", "strengths", "alignment", "background", "value", "match", "contribution", "years"],
                it: ["frontend", "agile", "scalable", "users", "modern tools"],
                healthcare: ["empathy", "patient care", "health outcomes", "clinical background"],
                industrial: ["coordination", "scheduling", "routing", "distribution", "operations"]
            },
            sampleAnswer: "I've got a strong foundation in managing competing priorities, working with teams, and delivering results. My past experience overlaps well with this role's responsibilities, and I'm excited to apply my skills in a more strategic setting.",
        },
        {
            prompt: "What's your ideal approach to getting feedback?",
            keywords: {
                general: ["constructive", "open", "regular", "direct", "growth", "two-way", "clear", "specific"]
            },
            sampleAnswer: "I appreciate feedback that's timely, honest, and specific. I like to know what's working and where I can improve, and I always try to respond with curiosity rather than defensiveness.",
        },
        {
            prompt: "Can you tell me about a project you're proud of?",
            keywords: {
                general: ["impact", "ownership", "lead", "goal", "teamwork", "result", "success", "initiative", "increase", "resulted", "percent"],
                it: ["launch", "frontend", "design", "UI", "user interface", "development"],
                healthcare: ["program", "patient", "access", "improvement", "care delivery"],
                industrial: ["efficiency", "logistics", "cost savings", "fleet", "route planning"]
            },
            sampleAnswer: "I helped lead a project to streamline our client onboarding process. I collaborated with sales and support to build a new workflow that reduced onboarding time by 30%. I'm proud of how we brought different teams together to solve a real problem.",
        },
        {
            prompt: "How do you handle tight deadlines or unexpected challenges?",
            keywords: {
                general: ["prioritize", "communicate", "plan", "adapt", "stay calm", "organize", "focus", "solve", "milestones", "percent", "increase", "streamline", "solve", "priorities", "prioritize", "early", "adjust", "plan"]
            },
            sampleAnswer: "I try to stay calm and break the work into clear priorities. I communicate early if anything might impact timing and look for ways to keep moving forward — even if it means adjusting the plan.",
        },
        {
            prompt: "What kind of team environment helps you stay motivated?",
            keywords: {
                general: ["supportive", "collaborative", "transparent", "focused", "flexible", "trusting", "open communication", "goal-oriented", "collaboration", "respectful", "proactive", "expectations"]
            },
            sampleAnswer: "I work best in environments that are open and collaborative, where people are proactive and respectful. I like when expectations are clear but there's also room for creativity and input.",
        },
        {
            prompt: "Can you tell me about a time you had to prioritize conflicting tasks?",
            keywords: {
                general: ["prioritize", "schedule", "communicate", "delegate", "organize", "deadline", "trade-offs", "focus", "map", "time", "flagged", "priority", "realistic", "stakeholders", "on time", "under budget", "trade-offs"]
            },
            sampleAnswer: "I once had two projects due the same week - I mapped out the time needed for each, flagged potential blockers early, and communicated with both stakeholders to set realistic expectations. Both were delivered on time.",
        },
        {
            prompt: "How do you stay organized when things get busy?",
            keywords: {
                general: ["planning", "tools", "lists", "scheduling", "calendar", "structure", "prioritization", "focus", "project management tool", "routines", "checklists", "team", "standups"]
            },
            sampleAnswer: "I rely on a mix of tools and routines - daily checklists, calendar blocking, and quick team standups. I try to stay focused on outcomes and avoid jumping between tasks too often.",
        },
        {
            prompt: "Can you share a recent professional challenge you overcame?",
            keywords: {
                general: ["problem-solving", "resilience", "adaptability", "collaboration", "growth", "communication", "solution", "jumped in", "workaround", "fixed"],
                it: ["bug", "sprint", "release", "deployment"],
                healthcare: ["patient", "compliance", "access", "delivery"],
                industrial: ["delays", "fleet", "route", "coordination"]
            },
            sampleAnswer: "We had a system outage the morning of a product demo. I jumped in to coordinate updates between engineering and our client, and helped create a quick workaround. It wasn't ideal, but we turned a rough start into a win.",
        },
        {
            prompt: "What motivates you to do your best on a team?",
            keywords: {
                general: ["purpose", "drive", "collaboration", "impact", "support", "respect", "recognition", "trust", "shared goals", "help others", "meaningful", "momentum", "accountable"]
            },
            sampleAnswer: "I'm motivated when I know my work supports others and contributes to a shared goal. I love being part of a team that celebrates progress, holds each other accountable, and builds momentum together.",
        },
        {
            prompt: "How do you approach learning something new on the job?",
            keywords: {
                general: ["curiosity", "research", "ask questions", "mentorship", "reviewing", "practice", "training", "adapt", "dive-in", "trial and error", "just go for it", "jump in", "learn by doing", "ask questions", "clarity", "not afraid"]
            },
            sampleAnswer: "I usually start with asking questions, reviewing documentation, and diving into hands-on practice. I try to learn by doing, and I'm not afraid to say when I need clarity.",
        },
        {
            prompt: "How do you typically respond when plans change quickly?",
            keywords: {
                general: ["stay calm", "communicate", "pivot", "refocus", "reassess", "flexible", "reassess", "adjust", "open-minded", "shift", "keep moving", "go with the flow", "in my control", "regroup", "informed", "same page", "aligned"]
            },
            sampleAnswer: "I try to stay flexible and focus on what's still in my control. I regroup quickly, adjust priorities, and keep others informed so we're aligned on the new path forward.",
        }
    ],

    teamFit: [{
            prompt: "Can you tell me about a time you worked on a team project and what your role was?",
            keywords: {
                general: ["teamwork", "collaboration", "project", "role", "responsibility", "contribution", "outcome", "success", "feedback", "coordinator", "aligned", "check-ins", "standups"],
                it: ["cross-functional", "UI", "user interface", "frontend", "agile", "QA", "quality assurance", "software as a service", "sass", "technical teams", "data flow", "IT systems", "integration", "support tools", "dashboards", "scalable"],
                healthcare: ["clinical", "nursing", "multidisciplinary", "care team"],
                industrial: ["delivery team", "dispatch", "coordination", "operations"]
            },
            sampleAnswer: "I recently worked on a team project where we needed to streamline a process across departments. I was the main coordinator between operations and support. My role involved gathering feedback, keeping tasks organized, and helping keep the team aligned through weekly check-ins.",
        },
        {
            prompt: "How do you handle disagreements or differing opinions within a team?",
            keywords: {
                general: ["listen", "communicate", "respect", "compromise", "resolve", "constructive", "feedback", "understanding", "curiosity", "common ground", "miscommunication"]
            },
            sampleAnswer: "I try to approach disagreements with curiosity and respect. I like to understand where the other person is coming from and then find common ground. Most conflicts come down to misalignment, so I focus on getting us back on the same page.",
        },
        {
            prompt: "What's your approach to giving or receiving feedback?",
            keywords: {
                general: ["constructive", "timely", "open", "growth", "respectful", "two-way", "clear", "supportive"]
            },
            sampleAnswer: "I try to be specific and kind when giving feedback - and I appreciate the same in return. I see it as a tool for growth, so I try to stay open even when the feedback is tough to hear.",
        },
        {
            prompt: "Can you describe your ideal team environment?",
            keywords: {
                general: ["inclusive", "supportive", "open communication", "collaborative", "trust", "respect", "engaged", "transparent", "independent", "comfortable", "wins"]
            },
            sampleAnswer: "I do best in a team where people are supportive, take initiative, and communicate openly. It's also important that people feel comfortable asking questions and celebrating wins together.",
        },
        {
            prompt: "Can you tell me about a time when communication played a key role in your success?",
            keywords: {
                general: ["clarity", "updates", "collaboration", "coordination", "shared goals", "expectations", "delivery", "transparency", "check-in", "shift", "pivot"],
                it: ["standups", "tickets", "handoffs"],
                healthcare: ["handoff", "shift change", "patient updates", "charting"],
                industrial: ["dispatch", "delivery window", "logistics software"]
            },
            sampleAnswer: "We once had a project where one step was slowing everything down, but nobody had called it out. I brought it up during our daily check-in, and it turned out others had the same concern. That conversation helped us shift resources and hit our timeline.",
        },
        {
            prompt: "What do you think makes a good teammate?",
            keywords: {
                general: ["communication", "communicates", "support", "accountable", "accountability", "reliable", "reliability", "respect", "adaptability", "positivity", "initiative", "shows up", "open to feedback", "supportive"]
            },
            sampleAnswer: "Someone who shows up, follows through, and communicates clearly. I think being reliable, open to feedback, and supportive makes a big difference on any team.",
        },
        {
            prompt: "Have you ever had to join a project midstream? If so, how did you adapt?",
            keywords: {
                general: ["onboard", "ask", "questions", "read", "reviewed", "documentation", "observe", "jump in", "collaborate", "catch up", "stay flexible", "not really", "no, however", "listen"]
            },
            sampleAnswer: "Yes, I joined one project right before launch. I reviewed documentation, asked lots of questions, and tried to listen more than talk at first. It helped me contribute quickly without slowing the team down.",
        },
        {
            prompt: "How do you balance individual responsibility with group collaboration?",
            keywords: {
                general: ["ownership", "accountability", "accountable", "team goals", "autonomy", "communication", "support", "check-ins", "aligned", "alignment", "loop"]
            },
            sampleAnswer: "I think it's about knowing what you own - and also when to loop others in. I try to stay accountable for my part while making sure it connects to the team's goals. Good collaboration doesn't mean doing everything together - it means staying aligned.",
        },
        {
            prompt: "What tools or methods have you used to stay aligned with your team?",
            keywords: {
                general: ["check-ins", "standups", "calendar", "project tracker", "status", "updates", "dashboards", "transparency", "shared"],
                it: ["Jira", "Notion", "GitHub"],
                healthcare: ["EMR", "shift notes", "handoff sheets"],
                industrial: ["fleet tracker", "dispatch app", "delivery logs"]
            },
            sampleAnswer: "I've used things like Slack, Trello, and shared calendars to keep updates flowing. I also think regular check-ins, async notes, and shared docs are great for staying on the same page - especially if the team is remote or hybrid.",
        },
        {
            prompt: "What kind of communication style do you prefer when working with others?",
            keywords: {
                general: ["clear", "direct", "respectful", "honest", "open", "timely", "constructive", "two-way", "thoughtful", "model", "imitate"]
            },
            sampleAnswer: "I prefer direct but thoughtful communication - I like when people are clear, respectful, and not afraid to speak up. I try to model that in how I share updates and give feedback, too.",
        }
    ]
};