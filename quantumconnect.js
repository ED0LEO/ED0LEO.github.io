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
        this.mediaTypes = ['image', 'video', 'gif', 'chart'];
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
        const hasMedia = Math.random() < 0.6; // 60% chance of having media
        const post = {
            id: Math.random().toString(36).substr(2, 9),
            author: user,
            content: this.generateQuantumPost(user),
            timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
            likes: new Set(),
            comments: [],
            shares: new Set(),
            media: hasMedia ? this.generateMedia() : null
        };
        user.posts.push(post);
        this.posts.push(post);
        return post;
    }

    generateMedia() {
        const mediaType = this.getRandomItem(this.mediaTypes);
        switch (mediaType) {
            case 'image':
                return {
                    type: 'image',
                    url: `https://picsum.photos/seed/${Math.random()}/800/600`,
                    caption: this.generateImageCaption()
                };
            case 'video':
                return {
                    type: 'video',
                    url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', // Placeholder video
                    caption: this.generateVideoCaption()
                };
            case 'gif':
                return {
                    type: 'gif',
                    url: 'https://media.giphy.com/media/3o7btNa0RUYa5E7iiQ/giphy.gif', // Placeholder GIF
                    caption: this.generateGifCaption()
                };
            case 'chart':
                return {
                    type: 'chart',
                    data: this.generateChartData(),
                    caption: this.generateChartCaption()
                };
        }
    }

    generateImageCaption() {
        const captions = [
            "Visualizing quantum entanglement in our latest experiment",
            "Our new quantum computer setup in the lab",
            "Presenting our findings at the International Quantum Conference",
            "A snapshot of quantum interference patterns",
            "Our team celebrating a breakthrough in quantum error correction"
        ];
        return this.getRandomItem(captions);
    }

    generateVideoCaption() {
        const captions = [
            "Watch our quantum computing demonstration",
            "Time-lapse of our 72-hour quantum experiment",
            "Interview with our lead researcher on recent quantum discoveries",
            "Animated explanation of quantum superposition",
            "Live stream of our quantum cryptography workshop"
        ];
        return this.getRandomItem(captions);
    }

    generateGifCaption() {
        const captions = [
            "When the quantum experiment finally works",
            "Trying to explain quantum mechanics to non-physicists like",
            "Our reaction to achieving quantum supremacy",
            "Quantum entanglement visualized",
            "How it feels to debug a quantum algorithm"
        ];
        return this.getRandomItem(captions);
    }

    generateChartData() {
        return {
            labels: ['Q1', 'Q2', 'Q3', 'Q4'],
            datasets: [{
                label: 'Quantum Coherence Time (μs)',
                data: [
                    Math.random() * 100,
                    Math.random() * 100,
                    Math.random() * 100,
                    Math.random() * 100
                ],
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1
            }]
        };
    }

    generateChartCaption() {
        const captions = [
            "Quarterly progress in extending quantum coherence time",
            "Comparison of quantum algorithm performance",
            "Quantum vs Classical: Speed comparison for factorization",
            "Error rates in our latest quantum error correction scheme",
            "Entanglement fidelity across different qubit types"
        ];
        return this.getRandomItem(captions);
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
            `Heading to ${this.conferences.length > 0 ? this.getRandomItem(this.conferences).name : 'a quantum conference'} next week. Looking forward to presenting our latest results on ${this.generateResearchTopic()}. Who else will be there? #QuantumConference #NetworkingInScience`,
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
                media: post.media,
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

function showQuantumFeed() {
    const posts = quantumConnect.getFeed(currentQuantumUser.id);
    let feedHTML = '<h2>Quantum Feed</h2>';
    
    posts.forEach(post => {
        feedHTML += `
            <div class="quantum-post">
                <div class="quantum-post-header">
                    <strong>${post.author}</strong>
                    <span>${new Date(post.timestamp).toLocaleString()}</span>
                </div>
                <div class="quantum-post-content">${post.content}</div>
                ${post.media ? renderQuantumMedia(post.media) : ''}
                <div class="quantum-post-actions">
                    <button onclick="likeQuantumPost('${post.id}')" class="${post.isLiked ? 'liked' : ''}">
                        ${post.isLiked ? 'Unlike' : 'Like'} (${post.likes})
                    </button>
                    <button onclick="showQuantumComments('${post.id}')">Comments (${post.comments})</button>
                    <button onclick="shareQuantumPost('${post.id}')" class="${post.isShared ? 'shared' : ''}">
                        ${post.isShared ? 'Unshare' : 'Share'} (${post.shares})
                    </button>
                </div>
            </div>
        `;
    });
    document.getElementById('quantumconnect-main').innerHTML = feedHTML;
    initializeQuantumCharts();
}

function showLoading(elementId) {
    document.getElementById(elementId).innerHTML = '<div class="loading-spinner"></div>';
}

function hideLoading(elementId) {
    document.getElementById(elementId).innerHTML = '';
}

function renderQuantumMedia(media) {
    console.log("Rendering media:", media);
    if (!media || !media.type) {
        console.error("Invalid media object:", media);
        return '<p>Error: Invalid media</p>';
    }
    try {
        switch (media.type) {
            case 'image':
                return `
                    <div class="quantum-media">
                        <img src="${media.url}" alt="${media.caption}" class="quantum-image">
                        <p class="quantum-media-caption">${media.caption}</p>
                    </div>
                `;
            case 'video':
                return `
                    <div class="quantum-media">
                        <iframe width="560" height="315" src="${media.url}" frameborder="0" allowfullscreen></iframe>
                        <p class="quantum-media-caption">${media.caption}</p>
                    </div>
                `;
            case 'gif':
                return `
                    <div class="quantum-media">
                        <img src="${media.url}" alt="${media.caption}" class="quantum-gif">
                        <p class="quantum-media-caption">${media.caption}</p>
                    </div>
                `;
            case 'chart':
                const chartId = `chart-${Math.random().toString(36).substr(2, 9)}`;
                return `
                    <div class="quantum-media">
                        <canvas id="${chartId}" data-chart='${JSON.stringify(media.data)}'></canvas>
                        <p class="quantum-media-caption">${media.caption}</p>
                    </div>
                `;
            default:
                return '';
        }
    } catch (error) {
        console.error("Error rendering media:", error);
        return '<p>Error rendering media</p>';
    }
}

function initializeQuantumCharts() {
    document.querySelectorAll('.quantum-media canvas').forEach(canvas => {
        const ctx = canvas.getContext('2d');
        const chartData = JSON.parse(canvas.getAttribute('data-chart'));
        new Chart(ctx, {
            type: 'line',
            data: chartData,
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    });
}

function showQuantumProfile(userId = currentQuantumUser.id) {
    const profile = quantumConnect.getUserProfile(userId);
    let profileHTML = `
        <div class="quantum-profile-header">
            <div class="quantum-profile-avatar"></div>
            <div class="quantum-profile-info">
                <h2>${profile.name}</h2>
                <p>${profile.institution}</p>
                <p>Specialties: ${profile.specialties.join(', ')}</p>
                <p>Followers: ${profile.followers} | Following: ${profile.following}</p>
                <p>Citations: ${profile.citations} | h-index: ${profile.hIndex}</p>
                ${userId !== currentQuantumUser.id ? 
                    `<button onclick="followQuantumUser('${userId}')">Follow</button>` : 
                    ''}
            </div>
        </div>
        <h3>Recent Publications</h3>
        <ul>
            ${profile.publications.slice(0, 5).map(pub => `
                <li>
                    <strong>${pub.title}</strong><br>
                    ${pub.authors.map(authorId => quantumConnect.users.get(authorId).name).join(', ')}<br>
                    ${pub.journal}, ${pub.date.getFullYear()} | Citations: ${pub.citations}
                </li>
            `).join('')}
        </ul>
        <button onclick="showAllPublications('${userId}')">View All Publications</button>
        
        <h3>Current Projects</h3>
        <ul>
            ${profile.projects.slice(0, 3).map(project => `
                <li>
                    <strong>${project.name}</strong><br>
                    ${project.description}<br>
                    Status: ${project.status} | Members: ${project.members.size}
                </li>
            `).join('')}
        </ul>
        <button onclick="showAllProjects('${userId}')">View All Projects</button>
        
        <h3>Recent Posts</h3>
        ${showQuantumFeed(userId, 5)}
    `;
    document.getElementById('quantumconnect-main').innerHTML = profileHTML;
}

function showAllPublications(userId) {
    const profile = quantumConnect.getUserProfile(userId);
    let publicationsHTML = `
        <h2>Publications by ${profile.name}</h2>
        <ul>
            ${profile.publications.map(pub => `
                <li>
                    <strong>${pub.title}</strong><br>
                    ${pub.authors.map(authorId => quantumConnect.users.get(authorId).name).join(', ')}<br>
                    ${pub.journal}, ${pub.date.getFullYear()} | Citations: ${pub.citations}<br>
                    <em>Abstract:</em> ${pub.abstract}
                </li>
            `).join('')}
        </ul>
    `;
    document.getElementById('quantumconnect-main').innerHTML = publicationsHTML;
}

function showAllProjects(userId) {
    const profile = quantumConnect.getUserProfile(userId);
    let projectsHTML = `
        <h2>Projects involving ${profile.name}</h2>
        <ul>
            ${profile.projects.map(project => `
                <li>
                    <strong>${project.name}</strong><br>
                    ${project.description}<br>
                    Status: ${project.status} | Start Date: ${project.startDate.toDateString()}<br>
                    Members: ${Array.from(project.members).map(memberId => quantumConnect.users.get(memberId).name).join(', ')}<br>
                    <strong>Recent Updates:</strong>
                    <ul>
                        ${project.updates.slice(-3).reverse().map(update => `
                            <li>
                                ${update.content} - ${update.author} (${new Date(update.timestamp).toLocaleString()})
                            </li>
                        `).join('')}
                    </ul>
                </li>
            `).join('')}
        </ul>
    `;
    document.getElementById('quantumconnect-main').innerHTML = projectsHTML;
}

function showQuantumInfluencers() {
    const influencers = quantumConnect.getTopInfluencers();
    let influencersHTML = '<h2>Top Quantum Influencers</h2>';
    influencers.forEach((influencer, index) => {
        influencersHTML += `
            <div class="quantum-influencer">
                <h3>${index + 1}. <a href="#" onclick="showQuantumProfile('${influencer.id}'); return false;">${influencer.name}</a></h3>
                <p>Institution: ${influencer.institution}</p>
                <p>Top Specialty: ${influencer.topSpecialty}</p>
                <p>Citations: ${influencer.citations} | h-index: ${influencer.hIndex}</p>
            </div>
        `;
    });
    document.getElementById('quantumconnect-main').innerHTML = influencersHTML;
}

function showQuantumTrends() {
    const trends = quantumConnect.getTrendingTopics();
    let trendsHTML = '<h2>Trending Quantum Topics</h2>';
    trends.forEach((trend, index) => {
        trendsHTML += `
            <div class="quantum-trend-item">
                <span>${index + 1}. ${trend.topic}</span>
                <span>${trend.count} posts</span>
                <button onclick="searchQuantumPosts('${trend.topic}')">View Related Posts</button>
            </div>
        `;
    });
    
    const conferences = quantumConnect.getUpcomingConferences();
    trendsHTML += '<h2>Upcoming Conferences</h2>';
    conferences.forEach(conf => {
        trendsHTML += `
            <div class="quantum-conference-item">
                <h3>${conf.name}</h3>
                <p>Date: ${conf.date.toDateString()} | Location: ${conf.location}</p>
                <p>Attendees: ${conf.attendees} | Talks: ${conf.talks}</p>
                <button onclick="showConferenceDetails('${conf.id}')">View Details</button>
            </div>
        `;
    });
    
    document.getElementById('quantumconnect-main').innerHTML = trendsHTML;
}

function showConferenceDetails(confId) {
    const conference = quantumConnect.conferences.find(c => c.id === confId);
    if (!conference) return;

    let detailsHTML = `
        <h2>${conference.name}</h2>
        <p>Date: ${conference.date.toDateString()}</p>
        <p>Location: ${conference.location}</p>
        <p>Attendees: ${conference.attendees.size}</p>
        <h3>Talks:</h3>
        <ul>
            ${conference.talks.map(talk => `
                <li>
                    <strong>${talk.title}</strong> by ${talk.speaker}
                </li>
            `).join('')}
        </ul>
        <h3>Attendees:</h3>
        <ul>
            ${Array.from(conference.attendees).slice(0, 20).map(attendeeId => `
                <li>
                    <a href="#" onclick="showQuantumProfile('${attendeeId}'); return false;">
                        ${quantumConnect.users.get(attendeeId).name}
                    </a>
                </li>
            `).join('')}
        </ul>
        ${conference.attendees.size > 20 ? `<p>And ${conference.attendees.size - 20} more...</p>` : ''}
    `;
    document.getElementById('quantumconnect-main').innerHTML = detailsHTML;
}

function likeQuantumPost(postId) {
    const post = quantumConnect.posts.find(p => p.id === postId);
    if (post) {
        if (post.likes.has(currentQuantumUser.id)) {
            post.likes.delete(currentQuantumUser.id);
        } else {
            post.likes.add(currentQuantumUser.id);
        }
        showQuantumFeed(); // Refresh the feed to show updated like count
    }
}

function shareQuantumPost(postId) {
    const post = quantumConnect.posts.find(p => p.id === postId);
    if (post) {
        if (post.shares.has(currentQuantumUser.id)) {
            post.shares.delete(currentQuantumUser.id);
        } else {
            post.shares.add(currentQuantumUser.id);
            // Create a new post representing the share
            quantumConnect.createPost(currentQuantumUser, `Shared: "${post.content.substring(0, 50)}..."`);
        }
        showQuantumFeed(); // Refresh the feed to show the share
    }
}

function showQuantumComments(postId) {
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
    const post = quantumConnect.posts.find(p => p.id === postId);
    if (post) {
        post.comments.push({
            user: currentQuantumUser.name,
            content: commentContent,
            timestamp: new Date()
        });
        showQuantumComments(postId); // Refresh comments
    }
}

function searchQuantumUsers(query) {
    const results = quantumConnect.searchUsers(query);
    let searchHTML = `<h2>Search Results for "${query}"</h2>`;
    results.forEach(user => {
        searchHTML += `
            <div class="quantum-user-result">
                <h3><a href="#" onclick="showQuantumProfile('${user.id}'); return false;">${user.name}</a></h3>
                <p>Institution: ${user.institution}</p>
                <p>Specialties: ${user.specialties.join(', ')}</p>
                <p>Citations: ${user.citations} | h-index: ${user.hIndex}</p>
                <button onclick="followQuantumUser('${user.id}')">Follow</button>
            </div>
        `;
    });
    document.getElementById('quantumconnect-main').innerHTML = searchHTML;
}

function searchQuantumPosts(query) {
    const results = quantumConnect.searchPosts(query);
    let searchHTML = `<h2>Post Results for "${query}"</h2>`;
    results.forEach(post => {
        searchHTML += `
            <div class="quantum-post">
                <div class="quantum-post-header">
                    <strong><a href="#" onclick="showQuantumProfile('${post.authorId}'); return false;">${post.author}</a></strong>
                    <span>${new Date(post.timestamp).toLocaleString()}</span>
                </div>
                <div class="quantum-post-content">${post.content}</div>
                <div class="quantum-post-actions">
                    <button onclick="likeQuantumPost('${post.id}')">Like (${post.likes})</button>
                    <button onclick="showQuantumComments('${post.id}')">Comments (${post.comments})</button>
                    <button onclick="shareQuantumPost('${post.id}')">Share (${post.shares})</button>
                </div>
            </div>
        `;
    });
    document.getElementById('quantumconnect-main').innerHTML = searchHTML;
}

function followQuantumUser(userId) {
    const userToFollow = quantumConnect.users.get(userId);
    if (userToFollow && userToFollow.id !== currentQuantumUser.id) {
        currentQuantumUser.follow(userToFollow);
        alert(`You are now following ${userToFollow.name}`);
        showQuantumProfile(userId); // Refresh the profile view
    }
}

function showQuantumMessages() {
    let messagesHTML = '<h2>Quantum Messages</h2>';
    messagesHTML += `
        <div class="quantum-message-compose">
            <input type="text" id="quantum-message-recipient" placeholder="Recipient">
            <textarea id="quantum-message-content" placeholder="Your message..."></textarea>
            <button onclick="sendQuantumMessage()">Send</button>
        </div>
        <div id="quantum-message-list">
            <!-- In a real app, you'd fetch and display actual messages here -->
            <div class="quantum-message">
                <strong>Dr. Alice Quantum</strong>: Have you seen the latest results on quantum error correction?
                <span>2 hours ago</span>
            </div>
            <div class="quantum-message">
                <strong>Dr. Bob Superposition</strong>: Interested in collaborating on a new quantum sensing project?
                <span>1 day ago</span>
            </div>
        </div>
    `;
    document.getElementById('quantumconnect-main').innerHTML = messagesHTML;
}

function sendQuantumMessage() {
    const recipient = document.getElementById('quantum-message-recipient').value;
    const content = document.getElementById('quantum-message-content').value;
    alert(`Message sent to ${recipient}: ${content}`);
    // In a real app, you'd send this message to a server and update the message list
    showQuantumMessages(); // Refresh the messages view
}

// Initialize the QuantumConnect window
function initQuantumConnect() {
    // Set up navigation event listeners
    document.getElementById('quantum-feed-button').addEventListener('click', showQuantumFeed);
    document.getElementById('quantum-profile-button').addEventListener('click', () => showQuantumProfile(currentQuantumUser.id));
    document.getElementById('quantum-influencers-button').addEventListener('click', showQuantumInfluencers);
    document.getElementById('quantum-trends-button').addEventListener('click', showQuantumTrends);
    document.getElementById('quantum-messages-button').addEventListener('click', showQuantumMessages);
    
    // Set up search functionality
    document.getElementById('quantum-search-button').addEventListener('click', () => {
        const query = document.getElementById('quantum-search-input').value;
        searchQuantumUsers(query);
    });

    // Initialize with the feed view
    showQuantumFeed();
}

function startRealTimeUpdates() {
    setInterval(() => {
        quantumConnect.simulateNetworkActivity();
        if (document.getElementById('quantumconnect-main').innerHTML.includes('Quantum Feed')) {
            showQuantumFeed();
        }
        updateQuantumNotifications();
    }, 30000); // Update every 30 seconds
}

function updateQuantumNotifications() {
    const notificationCount = Math.floor(Math.random() * 5); // Simulate 0-4 new notifications
    const notificationBadge = document.getElementById('quantum-notification-badge');
    if (notificationCount > 0) {
        notificationBadge.textContent = notificationCount;
        notificationBadge.style.display = 'inline';
    } else {
        notificationBadge.style.display = 'none';
    }
}

function handleQuantumError(error, operation) {
    console.error(`Error during ${operation}:`, error);
    alert(`An error occurred while ${operation}. Please try again later.`);
}

