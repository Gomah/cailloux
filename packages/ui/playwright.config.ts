export default {
  webServer: {
    command: process.env.TYPE === 'dev' ? 'bun run dev' : 'bun run preview',
    url: 'http://localhost:61000',
  },
};
