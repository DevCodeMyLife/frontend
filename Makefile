

main:
	yarn install
	#yarn run build

staging:
	yarn install
	yarn run build
	docker build . -t registry.devcodemylife.tech/devcodemylife/frontend:test
	docker push registry.devcodemylife.tech/devcodemylife/frontend:test