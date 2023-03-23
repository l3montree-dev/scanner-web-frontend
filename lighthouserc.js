module.exports = {
    ci: {
        collect: {
            url: ['http://localhost:3000/'],
            startServerCommand: 'npm run start',
            settings: { chromeFlags: '--no-sandbox' },
        },
        assert: {
            preset: 'lighthouse:no-pwa',
            assertions: {
                'categories:performance': ['error', { minScore: 0.9 }],
                'categories:accessibility': ['error', { minScore: 0.9 }],
                'categories:best-practices': ['error', { minScore: 0.9 }],
                'categories:seo': ['error', { minScore: 0.9 }],
                // should get served using an nginx
                "csp-xss": "off",
                "unused-javascript": "off",
            },
        },
        upload: {
            target: "filesystem",
        },
    },
};
