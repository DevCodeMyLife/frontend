
build:
	docker build . -t registry.devcodemylife.tech/devcodemylife/api:test
	docker push registry.devcodemylife.tech/devcodemylife/api:test
