
main:
	yarn install
	yarn run build

staging:
	yarn install
	yarn run build
	docker build . -t registry.devcodemylife.tech/devcodemylife/app:test
	docker push registry.devcodemylife.tech/devcodemylife/app:test