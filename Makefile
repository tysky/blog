install:
	npm install

start:
	npm run nodemon -- --exec babel-node bin/server.js

publish:
	npm publish

lint:
	npm run eslint src

test:
	npm test

.PHONY: test
