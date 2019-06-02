module.exports = {
  apps : [
      {
        name: "88wpm",
        script: "./dist/server/index.js",
        watch: false,
        env: {
          "NODE_ENV": "production"
        }
      }
  ]
}
