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
