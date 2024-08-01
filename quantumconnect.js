// QuantumConnect: Quantum Physics Social Network Simulation

class QuantumConnect {
    constructor() {
        this.users = new Map();
        this.posts = [];
        this.quantumTopics = [
            'Quantum Entanglement', 'Quantum Superposition', 'Quantum Tunneling',
            'Quantum Computing', 'Quantum Cryptography', 'Quantum Teleportation',
            'Quantum Field Theory', 'Quantum Decoherence', 'Quantum Measurement',
            'Quantum Error Correction', 'Quantum Simulation', 'Quantum Sensing'
        ];
        this.institutions = [
            'CERN', 'Fermilab', 'Max Planck Institute for Quantum Optics',
            'MIT Center for Theoretical Physics', 'Perimeter Institute',
            'Institute for Quantum Computing', 'Harvard Quantum Initiative',
            'Google Quantum AI Lab', 'IBM Quantum', 'Microsoft Quantum'
        ];
        this.initializeNetwork();
    }

    initializeNetwork() {
        // Create initial set of quantum physicists
        for (let i = 0; i < 500; i++) {
            const name = this.generateName();
            const specialties = this.getRandomSubset(this.quantumTopics, 1, 3);
            const institution = this.getRandomItem(this.institutions);
            this.createUser(name, specialties, institution);
        }

        // Create initial connections and posts
        this.users.forEach(user => {
            const numConnections = Math.floor(Math.random() * 30) + 5;
            for (let i = 0; i < numConnections; i++) {
                const randomUser = this.getRandomUser();
                if (randomUser !== user) {
                    user.follow(randomUser);
                }
            }
            const numPosts = Math.floor(Math.random() * 5) + 1;
            for (let i = 0; i < numPosts; i++) {
                this.createPost(user);
            }
        });

        // Start network simulation
        setInterval(() => this.simulateNetworkActivity(), 5000);
    }

    createUser(name, specialties, institution) {
        const user = {
            id: Math.random().toString(36).substr(2, 9),
            name,
            specialties,
            institution,
            followers: new Set(),
            following: new Set(),
            posts: []
        };
        this.users.set(user.id, user);
        return user;
    }

    createPost(user) {
        const post = {
            id: Math.random().toString(36).substr(2, 9),
            author: user,
            content: this.generateQuantumPost(user),
            timestamp: new Date(),
            likes: new Set(),
            comments: []
        };
        user.posts.push(post);
        this.posts.push(post);
        return post;
    }

    generateQuantumPost(user) {
        const templates = [
            `Just had a breakthrough in ${this.getRandomItem(user.specialties)}! This could revolutionize our understanding of quantum mechanics.`,
            `Attending the International Conference on ${this.getRandomItem(this.quantumTopics)} next week. Who else will be there? #QuantumPhysics`,
            `New paper alert! "Novel Approaches to ${this.getRandomItem(user.specialties)} Using Advanced Quantum Techniques" - check it out in the latest issue of Physical Review Letters.`,
            `Fascinating seminar today on the intersection of ${this.getRandomItem(this.quantumTopics)} and ${this.getRandomItem(this.quantumTopics)}. The implications for quantum computing are mind-boggling!`,
            `Looking for collaborators on a new ${this.getRandomItem(user.specialties)} project. DM if interested! #QuantumCollaboration`,
            `Just submitted a grant proposal for cutting-edge research in ${this.getRandomItem(user.specialties)}. Fingers crossed! #QuantumFunding`,
            `Excited to announce our lab's latest achievement in ${this.getRandomItem(user.specialties)}. Press release coming soon! #QuantumBreakthrough`,
            `Reflecting on the philosophical implications of ${this.getRandomItem(this.quantumTopics)}. How does it change our understanding of reality? #QuantumPhilosophy`,
            `New quantum algorithm developed! It shows promising results for ${this.getRandomItem(this.quantumTopics)}. Preprint available on arXiv. #QuantumAlgorithms`,
            `Just set up a new experiment to test ${this.getRandomItem(user.specialties)} predictions. The suspense is killing me! #QuantumExperiment`
        ];
        return this.getRandomItem(templates);
    }

    simulateNetworkActivity() {
        // Simulate user actions
        for (let i = 0; i < 5; i++) {
            const user = this.getRandomUser();
            const action = Math.random();
            if (action < 0.4) {
                this.createPost(user);
            } else if (action < 0.7) {
                const randomPost = this.getRandomItem(this.posts);
                randomPost.likes.add(user.id);
            } else if (action < 0.9) {
                const randomPost = this.getRandomItem(this.posts);
                randomPost.comments.push({
                    user: user.name,
                    content: this.generateQuantumComment(),
                    timestamp: new Date()
                });
            } else {
                const randomUser = this.getRandomUser();
                if (randomUser !== user) {
                    user.following.add(randomUser.id);
                    randomUser.followers.add(user.id);
                }
            }
        }

        // Remove old posts
        this.posts = this.posts.filter(post => {
            const age = (new Date() - post.timestamp) / (1000 * 60 * 60); // age in hours
            return Math.random() > age / 500; // probability of removal increases with age
        });
    }

    getRandomUser() {
        const userArray = Array.from(this.users.values());
        return userArray[Math.floor(Math.random() * userArray.length)];
    }

    getRandomItem(array) {
        return array[Math.floor(Math.random() * array.length)];
    }

    getRandomSubset(array, min, max) {
        const num = Math.floor(Math.random() * (max - min + 1)) + min;
        const shuffled = array.sort(() => 0.5 - Math.random());
        return shuffled.slice(0, num);
    }

    generateName() {
        const firstNames = ['Emma', 'Liam', 'Olivia', 'Noah', 'Ava', 'Ethan', 'Sophia', 'Mason', 'Isabella', 'William'];
        const lastNames = ['Smith', 'Johnson', 'Brown', 'Taylor', 'Miller', 'Wilson', 'Moore', 'Anderson', 'Thomas', 'Jackson'];
        return `Dr. ${this.getRandomItem(firstNames)} ${this.getRandomItem(lastNames)}`;
    }

    generateQuantumComment() {
        const comments = [
            "Fascinating approach! Have you considered the implications for quantum entanglement?",
            "This aligns closely with some findings in our lab. Would love to collaborate!",
            "Interesting results. How does this hold up under decoherence?",
            "Have you encountered any issues with scalability in your quantum system?",
            "This could have significant implications for quantum cryptography. Exciting stuff!",
            "I'd be curious to see how this performs in a noisy intermediate-scale quantum (NISQ) environment.",
            "How does this compare to the tensor network method for simulating quantum systems?",
            "Congratulations on the breakthrough! Looking forward to seeing the full paper.",
            "This raises some interesting questions about the nature of quantum reality. Any thoughts on the metaphysical implications?",
            "Impressive results! What's the next step in extending this to multi-qubit systems?"
        ];
        return this.getRandomItem(comments);
    }

    getFeed(userId, n = 20) {
        const user = this.users.get(userId);
        if (!user) return [];
        
        const relevantPosts = this.posts.filter(post => 
            user.following.has(post.author.id) || post.author.id === userId
        );

        return relevantPosts
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, n)
            .map(post => ({
                id: post.id,
                author: post.author.name,
                content: post.content,
                timestamp: post.timestamp,
                likes: post.likes.size,
                comments: post.comments.length
            }));
    }

    getUserProfile(userId) {
        const user = this.users.get(userId);
        if (!user) return null;
        return {
            id: user.id,
            name: user.name,
            institution: user.institution,
            specialties: user.specialties,
            followers: user.followers.size,
            following: user.following.size,
            posts: user.posts.length
        };
    }

    getTopInfluencers(n = 10) {
        return Array.from(this.users.values())
            .sort((a, b) => b.followers.size - a.followers.size)
            .slice(0, n)
            .map(user => ({
                name: user.name,
                institution: user.institution,
                followers: user.followers.size,
                specialty: user.specialties[0]
            }));
    }

    getTrendingTopics() {
        const topicCounts = {};
        this.posts.forEach(post => {
            this.quantumTopics.forEach(topic => {
                if (post.content.includes(topic)) {
                    topicCounts[topic] = (topicCounts[topic] || 0) + 1;
                }
            });
        });
        return Object.entries(topicCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([topic, count]) => ({ topic, count }));
    }
}

class User {
    constructor(name, fields, institution) {
        this.id = Math.random().toString(36).substr(2, 9);
        this.name = name;
        this.fields = fields;
        this.institution = institution;
        this.followers = new Set();
        this.following = new Set();
        this.posts = [];
        this.reputation = Math.floor(Math.random() * 100);
    }

    createPost(content, type = 'text') {
        const post = new Post(this, content, type);
        this.posts.push(post);
        return post;
    }

    follow(user) {
        this.following.add(user);
        user.followers.add(this);
    }

    unfollow(user) {
        this.following.delete(user);
        user.followers.delete(this);
    }
}

class Post {
    constructor(author, content, type) {
        this.id = Math.random().toString(36).substr(2, 9);
        this.author = author;
        this.content = content;
        this.type = type;
        this.timestamp = new Date();
        this.likes = new Set();
        this.comments = [];
        this.shares = new Set();
    }

    addComment(user, content) {
        this.comments.push({ user, content, timestamp: new Date() });
    }

    like(user) {
        this.likes.add(user);
    }

    unlike(user) {
        this.likes.delete(user);
    }

    share(user) {
        this.shares.add(user);
    }
}

class ScienceNet {
    constructor() {
        this.users = new Map();
        this.posts = [];
        this.trends = new Map();
        this.fields = [
            'Physics', 'Chemistry', 'Biology', 'Astronomy', 'Neuroscience',
            'Computer Science', 'Mathematics', 'Environmental Science',
            'Genetics', 'Robotics', 'Nanotechnology', 'Quantum Computing'
        ];
        this.institutions = [
            'MIT', 'Stanford', 'Harvard', 'Caltech', 'Oxford',
            'Cambridge', 'ETH Zurich', 'Max Planck Society', 'CERN',
            'NASA', 'NIH', 'Johns Hopkins University'
        ];
        this.initializeNetwork();
    }

    initializeNetwork() {
        // Create initial set of users
        for (let i = 0; i < 1000; i++) {
            const name = this.generateName();
            const fields = this.getRandomSubset(this.fields, 1, 3);
            const institution = this.getRandomItem(this.institutions);
            this.createUser(name, fields, institution);
        }

        // Create initial connections
        this.users.forEach(user => {
            const numConnections = Math.floor(Math.random() * 50) + 10;
            for (let i = 0; i < numConnections; i++) {
                const randomUser = this.getRandomUser();
                if (randomUser !== user) {
                    user.follow(randomUser);
                }
            }
        });

        // Generate initial content
        this.users.forEach(user => {
            const numPosts = Math.floor(Math.random() * 10) + 1;
            for (let i = 0; i < numPosts; i++) {
                this.generatePost(user);
            }
        });

        // Start network simulation
        setInterval(() => this.simulateNetworkActivity(), 1000);
    }

    createUser(name, fields, institution) {
        const user = new User(name, fields, institution);
        this.users.set(user.id, user);
        return user;
    }

    getRandomUser() {
        const userArray = Array.from(this.users.values());
        return userArray[Math.floor(Math.random() * userArray.length)];
    }

    generatePost(user) {
        const type = Math.random() < 0.8 ? 'text' : (Math.random() < 0.5 ? 'image' : 'link');
        let content;
        switch (type) {
            case 'text':
                content = this.generateTextPost(user);
                break;
            case 'image':
                content = this.generateImagePost(user);
                break;
            case 'link':
                content = this.generateLinkPost(user);
                break;
        }
        const post = user.createPost(content, type);
        this.posts.push(post);
        this.updateTrends(post);
        return post;
    }

    generateTextPost(user) {
        const templates = [
            `Exciting progress in my ${this.getRandomItem(user.fields)} research! Just submitted a paper to ${this.getRandomItem(this.journals)}. #${this.getRandomItem(user.fields).replace(' ', '')}`,
            `Attending the International Conference on ${this.getRandomItem(user.fields)} next week. Who else will be there? #${this.getRandomItem(user.fields).replace(' ', '')}Conference`,
            `Just read a fascinating paper on ${this.generateResearchTopic()}. Thoughts? #ScienceDiscussion`,
            `Looking for collaborators on a new ${this.getRandomItem(user.fields)} project. DM if interested! #ResearchCollaboration`,
            `Our lab just received a grant for ${this.generateResearchTopic()} research. Exciting times ahead! #FundedScience`,
            `Reviewing the latest advancements in ${this.generateResearchTopic()}. The pace of progress is incredible! #ScientificProgress`,
            `Question for fellow ${this.getRandomItem(user.fields)} researchers: ${this.generateScientificQuestion()}`,
            `Just published: "${this.generateResearchTitle()}" in ${this.getRandomItem(this.journals)}. Link in bio. #NewPublication`,
            `Breakthrough in ${this.generateResearchTopic()}! This could revolutionize ${this.getRandomItem(user.fields)}. Stay tuned for our paper. #ScientificBreakthrough`,
            `Reflecting on the ethical implications of ${this.generateResearchTopic()}. We need more discussions on this. #ScienceEthics`
        ];
        return this.getRandomItem(templates);
    }

    generateImagePost(user) {
        const imageDescriptions = [
            `Check out this incredible image from our ${this.getRandomItem(user.fields)} lab! #LabLife`,
            `Visualizing ${this.generateResearchTopic()} data. Beauty in complexity! #DataVisualization`,
            `Our team at the ${this.getRandomItem(this.conferences)} conference. Great discussions! #ScienceConference`,
            `New equipment arrived for our ${this.generateResearchTopic()} experiments. Can't wait to start! #LabEquipment`,
            `Poster presentation on ${this.generateResearchTopic()} at ${user.institution}. Feedback welcome! #PosterSession`
        ];
        return this.getRandomItem(imageDescriptions);
    }

    generateLinkPost(user) {
        const linkDescriptions = [
            `Just published my latest article on ${this.generateResearchTopic()}. Read it here: ${this.generateFakeURL()}`,
            `Fascinating new study on ${this.generateResearchTopic()} in ${this.getRandomItem(this.journals)}. Thoughts? ${this.generateFakeURL()}`,
            `Our lab's new website is live! Check out our current ${this.getRandomItem(user.fields)} projects: ${this.generateFakeURL()}`,
            `Important policy changes affecting ${this.getRandomItem(user.fields)} research. Stay informed: ${this.generateFakeURL()}`,
            `Free webinar on ${this.generateResearchTopic()} next week. Register here: ${this.generateFakeURL()}`
        ];
        return this.getRandomItem(linkDescriptions);
    }

    updateTrends(post) {
        const words = post.content.split(/\s+/);
        words.forEach(word => {
            if (word.startsWith('#')) {
                const count = this.trends.get(word) || 0;
                this.trends.set(word, count + 1);
            }
        });
    }

    simulateNetworkActivity() {
        // Simulate user actions
        for (let i = 0; i < 10; i++) {
            const user = this.getRandomUser();
            const action = Math.random();
            if (action < 0.4) {
                this.generatePost(user);
            } else if (action < 0.7) {
                const randomPost = this.getRandomItem(this.posts);
                randomPost.like(user);
            } else if (action < 0.9) {
                const randomPost = this.getRandomItem(this.posts);
                randomPost.addComment(user, this.generateComment());
            } else {
                const randomUser = this.getRandomUser();
                if (randomUser !== user) {
                    user.follow(randomUser);
                }
            }
        }

        // Simulate content aging
        this.posts = this.posts.filter(post => {
            const age = (new Date() - post.timestamp) / (1000 * 60 * 60); // age in hours
            return Math.random() > age / 1000; // probability of removal increases with age
        });

        // Update trends
        this.trends = new Map([...this.trends.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10));
    }

    generateName() {
        const firstNames = ['Emma', 'Liam', 'Olivia', 'Noah', 'Ava', 'Ethan', 'Sophia', 'Mason', 'Isabella', 'William'];
        const lastNames = ['Smith', 'Johnson', 'Brown', 'Taylor', 'Miller', 'Wilson', 'Moore', 'Anderson', 'Thomas', 'Jackson'];
        return `${this.getRandomItem(firstNames)} ${this.getRandomItem(lastNames)}`;
    }

    getRandomSubset(array, min, max) {
        const num = Math.floor(Math.random() * (max - min + 1)) + min;
        const shuffled = array.sort(() => 0.5 - Math.random());
        return shuffled.slice(0, num);
    }

    getRandomItem(array) {
        return array[Math.floor(Math.random() * array.length)];
    }

    generateResearchTopic() {
        const topics = [
            'CRISPR gene editing', 'quantum entanglement', 'exoplanet atmospheres',
            'neural networks', 'dark matter detection', 'climate modeling',
            'protein folding', 'gravitational waves', 'synthetic biology',
            'machine learning in drug discovery', 'nanomaterials', 'brain-computer interfaces'
        ];
        return this.getRandomItem(topics);
    }

    generateScientificQuestion() {
        const questions = [
            'How do you handle reproducibility issues in your experiments?',
            'What\'s your take on the role of AI in scientific discovery?',
            'How do you balance basic and applied research in your work?',
            'What\'s the biggest challenge in translating lab results to real-world applications?',
            'How do you approach interdisciplinary collaboration in your field?'
        ];
        return this.getRandomItem(questions);
    }

    generateResearchTitle() {
        const templates = [
            `Novel Approaches to ${this.generateResearchTopic()} Using Advanced ${this.getRandomItem(this.fields)} Techniques`,
            `The Role of ${this.generateResearchTopic()} in ${this.getRandomItem(this.fields)}: A Comprehensive Study`,
            `Exploring the Intersection of ${this.generateResearchTopic()} and ${this.generateResearchTopic()}`,
            `A New Paradigm for Understanding ${this.generateResearchTopic()} in the Context of ${this.getRandomItem(this.fields)}`,
            `Quantitative Analysis of ${this.generateResearchTopic()} and Its Implications for ${this.getRandomItem(this.fields)}`
        ];
        return this.getRandomItem(templates);
    }

    generateFakeURL() {
        const domains = ['science.org', 'research.net', 'academia.edu', 'scholarly.com', 'sciencedirect.com'];
        return `https://${this.getRandomItem(domains)}/${Math.random().toString(36).substr(2, 7)}`;
    }

    generateComment() {
        const comments = [
            'Fascinating research! Have you considered the implications for [FIELD]?',
            'Great work! This aligns closely with some findings in our lab.',
            'Interesting approach. I\'d be curious to see how this scales up.',
            'Have you encountered any reproducibility issues with this method?',
            'This could have significant implications for [TOPIC]. Exciting stuff!',
            'I\'d love to discuss potential collaborations in this area.',
            'How does this compare to the [ALTERNATIVE] method?',
            'Congratulations on the publication! Looking forward to diving into the full paper.',
            'This raises some interesting ethical considerations. How are you addressing those?',
            'Impressive results! What\'s the next step in this line of research?'
        ];
        let comment = this.getRandomItem(comments);
        comment = comment.replace('[FIELD]', this.getRandomItem(this.fields));
        comment = comment.replace('[TOPIC]', this.generateResearchTopic());
        comment = comment.replace('[ALTERNATIVE]', this.generateResearchTopic());
        return comment;
    }

    journals = [
        'Nature', 'Science', 'Cell', 'PNAS', 'The Lancet',
        'New England Journal of Medicine', 'Physical Review Letters',
        'Journal of Neuroscience', 'Genome Research', 'Advanced Materials'
    ];

    conferences = [
        'American Association for the Advancement of Science (AAAS) Annual Meeting',
        'International Conference on Machine Learning (ICML)',
        'American Chemical Society (ACS) National Meeting',
        'Society for Neuroscience Annual Meeting',
        'European Geosciences Union (EGU) General Assembly',
        'International Astronomical Union (IAU) General Assembly',
        'Materials Research Society (MRS) Spring Meeting',
        'American Physical Society (APS) March Meeting',
        'International Conference on Robotics and Automation (ICRA)',
        'World Conference on Carbon'
    ];

    getTrendingTopics() {
        return Array.from(this.trends.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([topic, count]) => ({ topic, count }));
    }

    getTopInfluencers() {
        return Array.from(this.users.values())
            .sort((a, b) => b.followers.size - a.followers.size)
            .slice(0, 10)
            .map(user => ({
                name: user.name,
                institution: user.institution,
                followers: user.followers.size,
                field: user.fields[0]
            }));
    }

    getRecentPosts(n = 20) {
        return this.posts
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, n)
            .map(post => ({
                id: post.id,
                author: post.author.name,
                content: post.content,
                type: post.type,
                timestamp: post.timestamp,
                likes: post.likes.size,
                comments: post.comments.length,
                shares: post.shares.size
            }));
    }

    getPostById(id) {
        const post = this.posts.find(p => p.id === id);
        if (!post) return null;
        return {
            id: post.id,
            author: {
                id: post.author.id,
                name: post.author.name,
                institution: post.author.institution,
                fields: post.author.fields
            },
            content: post.content,
            type: post.type,
            timestamp: post.timestamp,
            likes: Array.from(post.likes).map(u => u.name),
            comments: post.comments.map(c => ({
                author: c.user.name,
                content: c.content,
                timestamp: c.timestamp
            })),
            shares: Array.from(post.shares).map(u => u.name)
        };
    }

    getUserProfile(userId) {
        const user = this.users.get(userId);
        if (!user) return null;
        return {
            id: user.id,
            name: user.name,
            institution: user.institution,
            fields: user.fields,
            followers: user.followers.size,
            following: user.following.size,
            posts: user.posts.length,
            reputation: user.reputation
        };
    }

    getUserPosts(userId, n = 10) {
        const user = this.users.get(userId);
        if (!user) return null;
        return user.posts
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, n)
            .map(post => ({
                id: post.id,
                content: post.content,
                type: post.type,
                timestamp: post.timestamp,
                likes: post.likes.size,
                comments: post.comments.length,
                shares: post.shares.size
            }));
    }

    searchPosts(query) {
        const lowercaseQuery = query.toLowerCase();
        return this.posts
            .filter(post => post.content.toLowerCase().includes(lowercaseQuery))
            .map(post => ({
                id: post.id,
                author: post.author.name,
                content: post.content,
                type: post.type,
                timestamp: post.timestamp,
                relevance: this.calculateRelevance(post, lowercaseQuery)
            }))
            .sort((a, b) => b.relevance - a.relevance)
            .slice(0, 20);
    }

    calculateRelevance(post, query) {
        // Simple relevance calculation based on content match and engagement
        const contentMatch = post.content.toLowerCase().split(query).length - 1;
        const engagementScore = post.likes.size + post.comments.length * 2 + post.shares.size * 3;
        const recency = 1 / (1 + (Date.now() - post.timestamp) / (1000 * 60 * 60 * 24)); // Favor recent posts
        return (contentMatch * 10 + engagementScore) * recency;
    }

    getRecommendedPosts(userId, n = 10) {
        const user = this.users.get(userId);
        if (!user) return null;

        // Get posts from followed users and in user's fields of interest
        const candidatePosts = this.posts.filter(post => 
            user.following.has(post.author) || 
            post.author.fields.some(field => user.fields.includes(field))
        );

        // Score posts based on relevance to user
        const scoredPosts = candidatePosts.map(post => ({
            ...post,
            score: this.calculateUserRelevance(user, post)
        }));

        // Return top N posts
        return scoredPosts
            .sort((a, b) => b.score - a.score)
            .slice(0, n)
            .map(({ id, author, content, type, timestamp, likes, comments, shares }) => ({
                id, 
                author: author.name, 
                content, 
                type, 
                timestamp,
                likes: likes.size,
                comments: comments.length,
                shares: shares.size
            }));
    }

    calculateUserRelevance(user, post) {
        // Calculate relevance based on various factors
        let score = 0;

        // Author relationship
        if (user.following.has(post.author)) score += 10;
        
        // Field match
        const fieldOverlap = post.author.fields.filter(field => user.fields.includes(field)).length;
        score += fieldOverlap * 5;

        // Engagement
        score += post.likes.size * 0.1;
        score += post.comments.length * 0.2;
        score += post.shares.size * 0.3;

        // Recency
        const ageInHours = (Date.now() - post.timestamp) / (1000 * 60 * 60);
        score *= Math.exp(-ageInHours / 24); // Exponential decay based on age

        return score;
    }

    likePost(userId, postId) {
        const user = this.users.get(userId);
        const post = this.posts.find(p => p.id === postId);
        if (!user || !post) return false;
        post.like(user);
        return true;
    }

    unlikePost(userId, postId) {
        const user = this.users.get(userId);
        const post = this.posts.find(p => p.id === postId);
        if (!user || !post) return false;
        post.unlike(user);
        return true;
    }

    commentOnPost(userId, postId, content) {
        const user = this.users.get(userId);
        const post = this.posts.find(p => p.id === postId);
        if (!user || !post) return false;
        post.addComment(user, content);
        return true;
    }

    sharePost(userId, postId) {
        const user = this.users.get(userId);
        const post = this.posts.find(p => p.id === postId);
        if (!user || !post) return false;
        post.share(user);
        // Create a new post representing the share
        const sharePost = user.createPost(`Shared: ${post.content.substring(0, 50)}...`, 'share');
        sharePost.originalPost = post;
        this.posts.push(sharePost);
        return true;
    }

    followUser(followerId, targetUserId) {
        const follower = this.users.get(followerId);
        const target = this.users.get(targetUserId);
        if (!follower || !target) return false;
        follower.follow(target);
        return true;
    }

    unfollowUser(followerId, targetUserId) {
        const follower = this.users.get(followerId);
        const target = this.users.get(targetUserId);
        if (!follower || !target) return false;
        follower.unfollow(target);
        return true;
    }

    getNetworkStatistics() {
        return {
            totalUsers: this.users.size,
            totalPosts: this.posts.length,
            averageFollowers: Array.from(this.users.values()).reduce((sum, user) => sum + user.followers.size, 0) / this.users.size,
            averagePosts: this.posts.length / this.users.size,
            mostActiveUser: Array.from(this.users.values()).sort((a, b) => b.posts.length - a.posts.length)[0].name,
            mostLikedPost: this.posts.sort((a, b) => b.likes.size - a.likes.size)[0].id
        };
    }

    generateDailyDigest(userId) {
        const user = this.users.get(userId);
        if (!user) return null;

        const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const relevantPosts = this.posts.filter(post => 
            post.timestamp > last24Hours &&
            (user.following.has(post.author) || user.fields.some(field => post.author.fields.includes(field)))
        );

        const topPosts = relevantPosts
            .sort((a, b) => (b.likes.size + b.comments.length) - (a.likes.size + a.comments.length))
            .slice(0, 5);

        const newFollowers = Array.from(user.followers)
            .filter(follower => follower.following.get(user).timestamp > last24Hours)
            .map(follower => follower.name);

        const trendingTopics = this.getTrendingTopics().slice(0, 5);

        return {
            date: new Date(),
            topPosts: topPosts.map(post => ({
                id: post.id,
                author: post.author.name,
                content: post.content.substring(0, 100) + '...',
                likes: post.likes.size,
                comments: post.comments.length
            })),
            newFollowers,
            trendingTopics
        };
    }
}

// HTML for QuantumConnect window
const quantumConnectHTML = `
<div class="window" id="quantumconnect-window" style="width: 800px; height: 600px; top: 60px; left: 300px;">
    <div class="window-header">
        <img src="https://img.icons8.com/color/48/000000/atomic-orbital.png" class="window-icon" alt="QuantumConnect Icon">
        QuantumConnect
        <button class="close-btn">&times;</button>
    </div>
    <div class="window-content">
        <div id="quantumconnect-nav">
            <button onclick="showQuantumFeed()">Feed</button>
            <button onclick="showQuantumProfile()">Profile</button>
            <button onclick="showQuantumInfluencers()">Top Influencers</button>
            <button onclick="showQuantumTrends()">Trending</button>
        </div>
        <div id="quantumconnect-main">
            <!-- Content will be dynamically inserted here -->
        </div>
    </div>
</div>
`;

// CSS for QuantumConnect
const quantumConnectCSS = `
#quantumconnect-window .window-content {
    display: flex;
    flex-direction: column;
}
#quantumconnect-nav {
    display: flex;
    justify-content: space-around;
    padding: 10px;
    background-color: #1a237e;
}
#quantumconnect-nav button {
    padding: 5px 10px;
    background-color: #3f51b5;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.2s ease;
}
#quantumconnect-nav button:hover {
    background-color: #5c6bc0;
}
#quantumconnect-main {
    flex-grow: 1;
    overflow-y: auto;
    padding: 20px;
}
.quantum-post {
    border: 1px solid #c5cae9;
    border-radius: 5px;
    padding: 10px;
    margin-bottom: 15px;
    background-color: #e8eaf6;
}
.quantum-post-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 10px;
    color: #3f51b5;
}
.quantum-post-actions {
    display: flex;
    justify-content: space-around;
    margin-top: 10px;
}
.quantum-post-actions button {
    background: none;
    border: none;
    color: #3f51b5;
    cursor: pointer;
}
.quantum-profile-header {
    display: flex;
    align-items: center;
    margin-bottom: 20px;
}
.quantum-profile-avatar {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    margin-right: 20px;
    background-color: #c5cae9;
}
.quantum-profile-info {
    flex-grow: 1;
}
.quantum-trend-item {
    display: flex;
    justify-content: space-between;
    margin-bottom: 10px;
    padding: 5px;
    background-color: #e8eaf6;
    border-radius: 5px;
}
`;

// JavaScript for QuantumConnect functionality
const quantumConnectJS = `
// Initialize QuantumConnect
const quantumConnect = new QuantumConnect();

// Simulate a logged-in user
let currentQuantumUser = quantumConnect.getRandomUser();

function showQuantumFeed() {
    setActiveNavButton('Feed');
    const posts = quantumConnect.getFeed(currentQuantumUser.id);
    let feedHTML = '<h2>Quantum Feed</h2>';
    posts.forEach(post => {
        feedHTML += \`
            <div class="quantum-post">
                <div class="quantum-post-header">
                    <strong>\${post.author}</strong>
                    <span>\${new Date(post.timestamp).toLocaleString()}</span>
                </div>
                <div class="quantum-post-content">\${post.content}</div>
                <div class="quantum-post-actions">
                    <button onclick="likeQuantumPost('\${post.id}')">Like (\${post.likes})</button>
                    <button onclick="showQuantumComments('\${post.id}')">Comments (\${post.comments})</button>
                </div>
            </div>
        \`;
    });
    document.getElementById('quantumconnect-main').innerHTML = feedHTML;
}

function showQuantumProfile() {
    setActiveNavButton('Profile');
    const profile = quantumConnect.getUserProfile(currentQuantumUser.id);
    let profileHTML = `
        <div class="quantum-profile-header">
            <div class="quantum-profile-avatar"></div>
            <div class="quantum-profile-info">
                <h2>${profile.name}</h2>
                <p>${profile.institution}</p>
                <p>Specialties: ${profile.specialties.join(', ')}</p>
                <p>Followers: ${profile.followers} | Following: ${profile.following}</p>
            </div>
        </div>
        <h3>Recent Quantum Posts</h3>
    `;
    const posts = quantumConnect.getFeed(currentQuantumUser.id, 5);
    posts.forEach(post => {
        profileHTML += `
            <div class="quantum-post">
                <div class="quantum-post-header">
                    <span>${new Date(post.timestamp).toLocaleString()}</span>
                </div>
                <div class="quantum-post-content">${post.content}</div>
                <div class="quantum-post-actions">
                    <button>Like (${post.likes})</button>
                    <button>Comments (${post.comments})</button>
                </div>
            </div>
        `;
    });
    document.getElementById('quantumconnect-main').innerHTML = profileHTML;
}

function showQuantumInfluencers() {
    setActiveNavButton('Top Influencers');
    const influencers = quantumConnect.getTopInfluencers();
    let influencersHTML = '<h2>Top Quantum Influencers</h2>';
    influencers.forEach((influencer, index) => {
        influencersHTML += `
            <div class="quantum-influencer">
                <h3>${index + 1}. ${influencer.name}</h3>
                <p>Institution: ${influencer.institution}</p>
                <p>Specialty: ${influencer.specialty}</p>
                <p>Followers: ${influencer.followers}</p>
            </div>
        `;
    });
    document.getElementById('quantumconnect-main').innerHTML = influencersHTML;
}

function showQuantumTrends() {
    setActiveNavButton('Trending');
    const trends = quantumConnect.getTrendingTopics();
    let trendsHTML = '<h2>Trending Quantum Topics</h2>';
    trends.forEach((trend, index) => {
        trendsHTML += `
            <div class="quantum-trend-item">
                <span>${index + 1}. ${trend.topic}</span>
                <span>${trend.count} posts</span>
            </div>
        `;
    });
    document.getElementById('quantumconnect-main').innerHTML = trendsHTML;
}

function likeQuantumPost(postId) {
    // In a real implementation, this would send a request to the server
    console.log(`Liked post ${postId}`);
    showQuantumFeed(); // Refresh the feed to show updated like count
}

function showQuantumComments(postId) {
    // In a real implementation, this would fetch comments from the server
    const post = quantumConnect.posts.find(p => p.id === postId);
    if (!post) return;

    let commentsHTML = `
        <h3>Comments on Quantum Post</h3>
        <div class="quantum-post">
            <div class="quantum-post-header">
                <strong>${post.author.name}</strong>
                <span>${new Date(post.timestamp).toLocaleString()}</span>
            </div>
            <div class="quantum-post-content">${post.content}</div>
        </div>
        <h4>Comments:</h4>
    `;
    post.comments.forEach(comment => {
        commentsHTML += `
            <div class="quantum-comment">
                <strong>${comment.user}</strong>: ${comment.content}
                <span>${new Date(comment.timestamp).toLocaleString()}</span>
            </div>
        `;
    });
    commentsHTML += `
        <div>
            <textarea id="new-quantum-comment" placeholder="Add a quantum comment..."></textarea>
            <button onclick="addQuantumComment('${postId}')">Post Comment</button>
        </div>
    `;
    document.getElementById('quantumconnect-main').innerHTML = commentsHTML;
}

function addQuantumComment(postId) {
    const commentContent = document.getElementById('new-quantum-comment').value;
    // In a real implementation, this would send the comment to the server
    console.log(`Added comment to post ${postId}: ${commentContent}`);
    showQuantumComments(postId); // Refresh comments
}
