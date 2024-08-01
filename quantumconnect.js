class QuantumConnect {
    constructor() {
        this.users = new Map();
        this.posts = [];
        this.projects = new Map();
        this.publications = [];
        this.conferences = [];
        this.quantumTopics = [
            'Quantum Entanglement', 'Quantum Superposition', 'Quantum Tunneling',
            'Quantum Computing', 'Quantum Cryptography', 'Quantum Teleportation',
            'Quantum Field Theory', 'Quantum Decoherence', 'Quantum Measurement',
            'Quantum Error Correction', 'Quantum Simulation', 'Quantum Sensing',
            'Quantum Machine Learning', 'Topological Quantum Computing', 'Quantum Metrology',
            'Quantum Optics', 'Quantum Thermodynamics', 'Quantum Biology'
        ];
        this.institutions = [
            'CERN', 'Fermilab', 'Max Planck Institute for Quantum Optics',
            'MIT Center for Theoretical Physics', 'Perimeter Institute',
            'Institute for Quantum Computing', 'Harvard Quantum Initiative',
            'Google Quantum AI Lab', 'IBM Quantum', 'Microsoft Quantum',
            'QuTech (Delft)', 'Joint Quantum Institute (UMD/NIST)', 'JILA (Colorado)',
            'Centre for Quantum Technologies (Singapore)', 'IQIM (Caltech)',
            'Quantum Science Center (Oak Ridge)', 'Australian Research Council Centre of Excellence for Quantum Computation and Communication Technology'
        ];
        this.journals = [
            'Physical Review Letters', 'Nature', 'Science', 'Quantum',
            'npj Quantum Information', 'Quantum Science and Technology',
            'New Journal of Physics', 'Communications Physics'
        ];
        this.initializeNetwork();
    }

    initializeNetwork() {
        // Create initial set of quantum physicists
        for (let i = 0; i < 1000; i++) {
            const name = this.generateName();
            const specialties = this.getRandomSubset(this.quantumTopics, 1, 3);
            const institution = this.getRandomItem(this.institutions);
            this.createUser(name, specialties, institution);
        }

        // Create initial connections, posts, projects, and publications
        this.users.forEach(user => {
            this.createInitialUserData(user);
        });

        // Create conferences
        this.createConferences();

        // Start network simulation
        setInterval(() => this.simulateNetworkActivity(), 5000);
    }

    createInitialUserData(user) {
        // Create connections
        const numConnections = Math.floor(Math.random() * 50) + 20;
        for (let i = 0; i < numConnections; i++) {
            const randomUser = this.getRandomUser();
            if (randomUser !== user) {
                user.follow(randomUser);
            }
        }

        // Create posts
        const numPosts = Math.floor(Math.random() * 10) + 5;
        for (let i = 0; i < numPosts; i++) {
            this.createPost(user);
        }

        // Create or join projects
        const numProjects = Math.floor(Math.random() * 3) + 1;
        for (let i = 0; i < numProjects; i++) {
            if (Math.random() < 0.3) {
                this.createProject(user);
            } else {
                const randomProject = this.getRandomItem(Array.from(this.projects.values()));
                if (randomProject) {
                    randomProject.members.add(user.id);
                }
            }
        }

        // Create publications
        const numPublications = Math.floor(Math.random() * 5) + 1;
        for (let i = 0; i < numPublications; i++) {
            this.createPublication(user);
        }
    }

    createUser(name, specialties, institution) {
        const user = {
            id: Math.random().toString(36).substr(2, 9),
            name,
            specialties,
            institution,
            followers: new Set(),
            following: new Set(),
            posts: [],
            projects: new Set(),
            publications: [],
            citations: 0,
            hIndex: 0,
            follow: function(otherUser) {
                this.following.add(otherUser.id);
                otherUser.followers.add(this.id);
            },
            unfollow: function(otherUser) {
                this.following.delete(otherUser.id);
                otherUser.followers.delete(this.id);
            }
        };
        this.users.set(user.id, user);
        return user;
    }

    createPost(user) {
        const post = {
            id: Math.random().toString(36).substr(2, 9),
            author: user,
            content: this.generateQuantumPost(user),
            timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
            likes: new Set(),
            comments: [],
            shares: new Set()
        };
        user.posts.push(post);
        this.posts.push(post);
        return post;
    }

    createProject(user) {
        const project = {
            id: Math.random().toString(36).substr(2, 9),
            name: this.generateProjectName(),
            description: this.generateProjectDescription(),
            leader: user,
            members: new Set([user.id]),
            status: 'Ongoing',
            startDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
            updates: []
        };
        this.projects.set(project.id, project);
        user.projects.add(project.id);
        return project;
    }

    createPublication(user) {
        const coauthors = this.getRandomSubset(Array.from(this.users.values()), 1, 5)
            .filter(coauthor => coauthor.id !== user.id)
            .map(coauthor => coauthor.id);
        
        const publication = {
            id: Math.random().toString(36).substr(2, 9),
            title: this.generatePublicationTitle(),
            authors: [user.id, ...coauthors],
            journal: this.getRandomItem(this.journals),
            date: new Date(Date.now() - Math.random() * 5 * 365 * 24 * 60 * 60 * 1000),
            citations: Math.floor(Math.random() * 100),
            abstract: this.generateAbstract()
        };
        
        this.publications.push(publication);
        user.publications.push(publication.id);
        coauthors.forEach(coauthorId => {
            const coauthor = this.users.get(coauthorId);
            coauthor.publications.push(publication.id);
        });
        
        return publication;
    }

    createConferences() {
        const conferenceNames = [
            'International Conference on Quantum Computing and Engineering (QCE)',
            'Quantum Information Processing (QIP)',
            'International Conference on Quantum Cryptography (QCrypt)',
            'Quantum Science and Technologies Conference (QSTC)',
            'Quantum Tech Congress'
        ];

        conferenceNames.forEach(name => {
            const conference = {
                id: Math.random().toString(36).substr(2, 9),
                name,
                date: new Date(Date.now() + Math.random() * 365 * 24 * 60 * 60 * 1000),
                location: this.generateLocation(),
                attendees: new Set(),
                talks: []
            };
            this.conferences.push(conference);
        });
    }

    generateQuantumPost(user) {
        const templates = [
            `Exciting breakthrough in ${this.getRandomItem(user.specialties)}! Our team has achieved ${this.generateBreakthrough()}. This could revolutionize ${this.getRandomItem(this.quantumTopics)}. #QuantumPhysics #${user.specialties[0].replace(/\s+/g, '')}`,
            `Just submitted our latest paper on ${this.generateResearchTopic()} to ${this.getRandomItem(this.journals)}. Fingers crossed! #AcademicLife #QuantumResearch`,
            `Fascinating seminar by ${this.getRandomUser().name} on the intersection of ${this.getRandomItem(this.quantumTopics)} and ${this.getRandomItem(this.quantumTopics)}. The implications for ${this.getRandomItem(user.specialties)} are mind-boggling! #QuantumSeminar`,
            `Our lab just received a $${(Math.random() * 10 + 1).toFixed(2)}M grant for ${this.generateResearchTopic()} research. Excited to push the boundaries of ${this.getRandomItem(user.specialties)}! #QuantumFunding #ScienceAdvancement`,
            `New preprint on arXiv: "${this.generatePublicationTitle()}". We propose a novel approach to ${this.generateResearchTopic()}. Feedback welcome! #OpenScience #QuantumPreprint`,
            `Heading to ${this.getRandomItem(this.conferences).name} next week. Looking forward to presenting our latest results on ${this.generateResearchTopic()}. Who else will be there? #QuantumConference #NetworkingInScience`,
            `Just set up a new experiment to test ${this.generateHypothesis()}. The suspense is killing me! #QuantumExperiment #ScientificMethod`,
            `Exciting collaboration brewing with ${this.getRandomUser().name} from ${this.getRandomItem(this.institutions)}. We're combining our expertise in ${this.getRandomItem(user.specialties)} and ${this.getRandomItem(this.quantumTopics)}. Stay tuned! #QuantumCollaboration`,
            `Reflecting on the philosophical implications of ${this.getRandomItem(this.quantumTopics)}. How does it change our understanding of reality and consciousness? #QuantumPhilosophy #ScienceAndPhilosophy`,
            `Just finished reviewing a fascinating paper on ${this.generateResearchTopic()} for ${this.getRandomItem(this.journals)}. The peer review process is crucial for maintaining scientific integrity. #PeerReview #ScientificPublishing`
        ];
        return this.getRandomItem(templates);
    }

    generateProjectName() {
        const adjectives = ['Advanced', 'Quantum', 'Integrated', 'Scalable', 'Robust', 'Coherent', 'Entangled'];
        const nouns = ['Systems', 'Algorithms', 'Architectures', 'Protocols', 'Frameworks', 'Platforms', 'Networks'];
        const purposes = ['for Quantum Computing', 'for Quantum Sensing', 'for Quantum Cryptography', 'for Quantum Simulation'];
        return `${this.getRandomItem(adjectives)} ${this.getRandomItem(nouns)} ${this.getRandomItem(purposes)}`;
    }

    generateProjectDescription() {
        const descriptions = [
            `This project aims to develop novel ${this.generateResearchTopic()} techniques, potentially revolutionizing ${this.getRandomItem(this.quantumTopics)}.`,
            `We're exploring the intersection of ${this.getRandomItem(this.quantumTopics)} and ${this.getRandomItem(this.quantumTopics)} to create next-generation quantum technologies.`,
            `Our team is working on scaling up ${this.generateResearchTopic()} to address real-world challenges in ${this.getRandomItem(this.quantumTopics)}.`,
            `This collaborative effort focuses on integrating ${this.generateResearchTopic()} with classical systems for practical quantum applications.`,
            `We're investigating fundamental limits of ${this.generateResearchTopic()} and developing new theoretical frameworks for quantum information processing.`
        ];
        return this.getRandomItem(descriptions);
    }

    generatePublicationTitle() {
        const structures = [
            `${this.generateResearchTopic()}: A Novel Approach to ${this.getRandomItem(this.quantumTopics)}`,
            `Experimental Demonstration of ${this.generateResearchTopic()} in ${this.getRandomItem(this.quantumTopics)}`,
            `Theoretical Foundations of ${this.generateResearchTopic()} for Quantum ${this.getRandomItem(['Computing', 'Sensing', 'Communication'])}`,
            `Scalable ${this.generateResearchTopic()} Architecture for ${this.getRandomItem(this.quantumTopics)}`,
            `Quantum Advantage in ${this.generateResearchTopic()} Using ${this.getRandomItem(this.quantumTopics)}`
        ];
        return this.getRandomItem(structures);
    }

    generateAbstract() {
        return `This paper presents a novel approach to ${this.generateResearchTopic()} 
        in the context of ${this.getRandomItem(this.quantumTopics)}. We demonstrate 
        ${this.generateBreakthrough()} using ${this.generateMethodology()}. Our results show 
        a significant improvement in ${this.generateMetric()}, paving the way for 
        practical applications in ${this.getRandomItem(this.quantumTopics)}. We discuss 
        the implications of our findings and propose future directions for research in this area.`;
    }

    generateResearchTopic() {
        const topics = [
            'quantum error correction', 'topological quantum computing', 'quantum machine learning',
            'quantum sensing', 'quantum simulation', 'quantum cryptography', 'quantum metrology',
            'quantum-inspired algorithms', 'quantum annealing', 'quantum-classical hybrid systems',
            'quantum thermodynamics', 'quantum biology', 'quantum chaos', 'quantum optics'
        ];
        return this.getRandomItem(topics);
    }

    generateBreakthrough() {
        const breakthroughs = [
            'a 10x improvement in qubit coherence time',
            'a novel quantum error correction code with a higher threshold',
            'the first experimental realization of a topological qubit',
            'a quantum algorithm that outperforms classical methods for machine learning tasks',
            'a quantum sensor with unprecedented sensitivity for magnetic field detection',
            'a scalable architecture for quantum communication over long distances',
            'a quantum simulation of a complex molecular system relevant to drug discovery'
        ];
        return this.getRandomItem(breakthroughs);
    }

    generateMethodology() {
        const methodologies = [
            'superconducting qubits', 'trapped ions', 'photonic qubits', 'topological qubits',
            'quantum dots', 'neutral atoms', 'diamond NV centers', 'quantum annealing',
            'continuous variable quantum computing', 'measurement-based quantum computing'
        ];
        return this.getRandomItem(methodologies);
    }

    generateMetric() {
        const metrics = [
            'gate fidelity', 'qubit coherence time', 'entanglement fidelity',
            'quantum volume', 'quantum advantage', 'error correction threshold',
            'quantum state transfer efficiency', 'quantum sensing precision'
        ];
        return this.getRandomItem(metrics);
    }

    generateHypothesis() {
        const hypotheses = [
            'the scalability of our quantum error correction scheme in the presence of noise',
            'the quantum advantage of our algorithm for specific problem instances',
            'the coherence properties of our newly developed qubit architecture',
            'the entanglement dynamics in our quantum simulation protocol',
            'the robustness of our quantum cryptographic scheme against side-channel attacks'
        ];
        return this.getRandomItem(hypotheses);
    }

    generateLocation() {
        const cities = ['Zurich', 'Boston', 'Tokyo', 'Singapore', 'London', 'San Francisco', 'Beijing', 'Paris', 'Munich', 'Sydney'];
        return this.getRandomItem(cities);
    }

    simulateNetworkActivity() {
        // Simulate user actions
        for (let i = 0; i < 10; i++) {
            const user = this.getRandomUser();
            const action = Math.random();
            if (action < 0.3) {
                this.createPost(user);
            } else if (action < 0.5) {
                const randomPost = this.getRandomItem(this.posts);
                randomPost.likes.add(user.id);
            } else if (action < 0.7) {
                const randomPost = this.getRandomItem(this.posts);
                randomPost.comments.push({
                    user: user.name,
                    content: this.generateQuantumComment(),
                    timestamp: new Date()
                });
            } else if (action < 0.8) {
                const randomUser = this.getRandomUser();
                if (randomUser !== user) {
                    user.follow(randomUser);
                }
            } else if (action < 0.9) {
                this.updateProject(user);
            } else {
                this.createPublication(user);
            }
        }

        // Simulate conference activities
        this.conferences.forEach(conference => {
            if (conference.date > new Date() && conference.date < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)) {
                const potentialAttendees = Array.from(this.users.values())
                    .filter(user => !conference.attendees.has(user.id));
                const newAttendees = this.getRandomSubset(potentialAttendees, 5, 20);
                newAttendees.forEach(attendee => {
                    conference.attendees.add(attendee.id);
                    if (Math.random() < 0.3) {
                        conference.talks.push({
                            speaker: attendee.name,
                            title: this.generateTalkTitle(attendee)
                        });
                    }
                });
            }
        });

        // Update citation counts and h-index
        this.updateCitations();

        // Remove old posts
        this.posts = this.posts.filter(post => {
            const age = (new Date() - post.timestamp) / (1000 * 60 * 60 * 24); // age in days
            return Math.random() > age / 365; // probability of removal increases with age
        });
    }

    updateProject(user) {
        const project = this.getRandomItem(Array.from(this.projects.values()));
        if (project && project.members.has(user.id)) {
            project.updates.push({
                author: user.name,
                content: this.generateProjectUpdate(),
                timestamp: new Date()
            });
        }
    }

    updateCitations() {
        this.publications.forEach(publication => {
            if (Math.random() < 0.1) {
                publication.citations += Math.floor(Math.random() * 5) + 1;
            }
        });

        this.users.forEach(user => {
            const citations = user.publications.reduce((total, pubId) => {
                const pub = this.publications.find(p => p.id === pubId);
                return total + (pub ? pub.citations : 0);
            }, 0);
            user.citations = citations;

            // Calculate h-index
            const citationCounts = user.publications.map(pubId => {
                const pub = this.publications.find(p => p.id === pubId);
                return pub ? pub.citations : 0;
            }).sort((a, b) => b - a);
            let hIndex = 0;
            while (hIndex < citationCounts.length && citationCounts[hIndex] > hIndex) {
                hIndex++;
            }
            user.hIndex = hIndex;
        });
    }

    generateProjectUpdate() {
        const updates = [
            "We've made significant progress on the theoretical framework.",
            "Our latest experimental results show promising improvements in quantum coherence.",
            "We've successfully integrated our quantum algorithm with a classical preprocessing step.",
            "New simulation data suggests our approach could scale to larger qubit systems.",
            "We've identified and resolved a key challenge in our quantum error correction scheme.",
            "Our team has developed a novel calibration technique for improved gate fidelity.",
            "We've submitted an abstract detailing our recent findings to an upcoming conference.",
            "Collaboration with industry partners has opened up new avenues for practical applications.",
            "We've made our quantum simulation software open-source for the community to use and contribute.",
            "Recent benchmarking shows our quantum sensing protocol outperforms current classical methods."
        ];
        return this.getRandomItem(updates);
    }

    generateTalkTitle(user) {
        const titles = [
            `Recent Advances in ${this.getRandomItem(user.specialties)}`,
            `A Novel Approach to ${this.generateResearchTopic()} Using ${this.generateMethodology()}`,
            `Challenges and Opportunities in Scaling ${this.getRandomItem(this.quantumTopics)}`,
            `Quantum Advantage Demonstrated in ${this.generateResearchTopic()}`,
            `Bridging Theory and Experiment in ${this.getRandomItem(user.specialties)}`,
            `Industrial Applications of ${this.getRandomItem(this.quantumTopics)}`,
            `The Future of ${this.generateResearchTopic()}: A Roadmap`,
            `Quantum-Inspired Algorithms for ${this.generateResearchTopic()}`,
            `Ethical Considerations in Advanced ${this.getRandomItem(this.quantumTopics)} Research`,
            `Cross-disciplinary Approaches to ${this.generateResearchTopic()}`
        ];
        return this.getRandomItem(titles);
    }

    generateQuantumComment() {
        const comments = [
            "Fascinating work! Have you considered the implications for ${this.getRandomItem(this.quantumTopics)}?",
            "This aligns closely with some findings in our lab. Would love to discuss potential collaborations.",
            "Interesting approach. How does this hold up under realistic noise models?",
            "Have you encountered any issues with scalability? We've been working on similar challenges.",
            "This could have significant implications for ${this.generateResearchTopic()}. Exciting stuff!",
            "I'd be curious to see how this performs in a NISQ (Noisy Intermediate-Scale Quantum) environment.",
            "How does this compare to the ${this.generateMethodology()} approach? Any thoughts on the trade-offs?",
            "Congratulations on the breakthrough! Looking forward to seeing the full paper.",
            "This raises some interesting questions about the nature of ${this.getRandomItem(this.quantumTopics)}. Any thoughts on the foundational implications?",
            "Impressive results! What's the next step in extending this to larger qubit systems?"
        ];
        return this.getRandomItem(comments).replace('${this.getRandomItem(this.quantumTopics)}', this.getRandomItem(this.quantumTopics))
                                           .replace('${this.generateResearchTopic()}', this.generateResearchTopic())
                                           .replace('${this.generateMethodology()}', this.generateMethodology());
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
                authorId: post.author.id,
                content: post.content,
                timestamp: post.timestamp,
                likes: post.likes.size,
                comments: post.comments.length,
                shares: post.shares.size,
                isLiked: post.likes.has(userId),
                isShared: post.shares.has(userId)
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
            posts: user.posts.length,
            projects: Array.from(user.projects).map(projectId => this.projects.get(projectId)).filter(Boolean),
            publications: user.publications.map(pubId => this.publications.find(p => p.id === pubId)).filter(Boolean),
            citations: user.citations,
            hIndex: user.hIndex
        };
    }

    getTopInfluencers(n = 10) {
        return Array.from(this.users.values())
            .sort((a, b) => b.citations - a.citations)
            .slice(0, n)
            .map(user => ({
                id: user.id,
                name: user.name,
                institution: user.institution,
                citations: user.citations,
                hIndex: user.hIndex,
                topSpecialty: user.specialties[0]
            }));
    }

    getTrendingTopics() {
        const topicCounts = {};
        this.posts.forEach(post => {
            this.quantumTopics.forEach(topic => {
                if (post.content.toLowerCase().includes(topic.toLowerCase())) {
                    topicCounts[topic] = (topicCounts[topic] || 0) + 1;
                }
            });
        });
        return Object.entries(topicCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([topic, count]) => ({ topic, count }));
    }

    getUpcomingConferences() {
        const now = new Date();
        return this.conferences
            .filter(conf => conf.date > now)
            .sort((a, b) => a.date - b.date)
            .slice(0, 5)
            .map(conf => ({
                id: conf.id,
                name: conf.name,
                date: conf.date,
                location: conf.location,
                attendees: conf.attendees.size,
                talks: conf.talks.length
            }));
    }

    searchUsers(query) {
        return Array.from(this.users.values())
            .filter(user => 
                user.name.toLowerCase().includes(query.toLowerCase()) ||
                user.institution.toLowerCase().includes(query.toLowerCase()) ||
                user.specialties.some(specialty => specialty.toLowerCase().includes(query.toLowerCase()))
            )
            .slice(0, 10)
            .map(user => ({
                id: user.id,
                name: user.name,
                institution: user.institution,
                specialties: user.specialties,
                citations: user.citations,
                hIndex: user.hIndex
            }));
    }

    searchPosts(query) {
        return this.posts
            .filter(post => post.content.toLowerCase().includes(query.toLowerCase()))
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, 20)
            .map(post => ({
                id: post.id,
                author: post.author.name,
                authorId: post.author.id,
                content: post.content,
                timestamp: post.timestamp,
                likes: post.likes.size,
                comments: post.comments.length,
                shares: post.shares.size
            }));
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
        const firstNames = ['Emma', 'Liam', 'Olivia', 'Noah', 'Ava', 'Ethan', 'Sophia', 'Mason', 'Isabella', 'William', 'James', 'Benjamin', 'Lucas', 'Henry', 'Alexander', 'Chao', 'Yuki', 'Aisha', 'Zoe', 'Rafael'];
        const lastNames = ['Smith', 'Johnson', 'Brown', 'Taylor', 'Miller', 'Wilson', 'Moore', 'Anderson', 'Thomas', 'Jackson', 'White', 'Harris', 'Martin', 'Thompson', 'Garcia', 'Martinez', 'Robinson', 'Clark', 'Rodriguez', 'Lewis'];
        return `Dr. ${this.getRandomItem(firstNames)} ${this.getRandomItem(lastNames)}`;
    }
}

// Initialize QuantumConnect
const quantumConnect = new QuantumConnect();

// Simulate a logged-in user
let currentQuantumUser = quantumConnect.getRandomUser();
