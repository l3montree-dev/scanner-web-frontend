module.exports = {
    ci: {
        collect: {
            url: ['http://localhost:3000/'],
            startServerCommand: 'npm run start',
            settings: { chromeFlags: '--no-sandbox' },
        },
        upload: {
            target: "filesystem",
        },
    },
};
