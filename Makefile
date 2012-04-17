# makefile to automatize simple operations

server:
	python -m SimpleHTTPServer

deploy:
	# assume there is something to commit
	# use "git diff --exit-code HEAD" to know if there is something to commit
	# so two lines: one if no commit, one if something to commit 
	git commit -a -m "New deploy" && git push -f origin HEAD:gh-pages && git reset HEAD~

build:
	echo				 > build/augmentedgesture.js
	cat src/augmentedgesture.js	>> build/augmentedgesture.js
	cat src/option.js		>> build/augmentedgesture.js
	cat src/gesturerecognition.js	>> build/augmentedgesture.js
	cat src/handleDatGui.js	 	>> build/augmentedgesture.js

minify: build
	curl --data-urlencode "js_code@build/augmentedgesture.js" 	\
		-d "output_format=text&output_info=compiled_code&compilation_level=SIMPLE_OPTIMIZATIONS" \
		http://closure-compiler.appspot.com/compile		\
		>> build/augmentedgesture.min.js
	@echo size minified + gzip is `gzip -c build/augmentedgesture.min.js | wc -c` byte
	
.PHONY: build minify