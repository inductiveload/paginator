module.exports = {
	chainWebpack: config => config.optimization.minimize( false ),
	pages: {
		index: {
			entry: 'src/main.js',
			title: 'Page Game'
		}
	}
};
