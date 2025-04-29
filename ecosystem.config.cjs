module.exports = {
    apps: [
        {
            name: "Backend",
            exec_mode: "cluster",
            script: "./server.js",
            watch: true,
            ignore_watch: [
                './node_modules',
            ]
        }
    ]
}
