export default [
	{
		ignores: [
			"extension/editor/*",
			"test/**/*",
			".coverage/**/*",
			"eslint.config.js"
		]
	},
	{
		files: [
			"**/*.js"
		],
		languageOptions: {
			ecmaVersion: "latest",
			sourceType: "script"
		},
		rules: {
			"no-undef": "off", // eslint doesn't know that all files joined together
			"no-unused-vars": "off" // no matter, especially method params not used for now
		}
	}
];