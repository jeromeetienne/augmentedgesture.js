# makefile to automatize simple operations

server:
	python -m SimpleHTTPServer

deploy:
	# assume there is something to commit
	# use "git diff --exit-code HEAD" to know if there is something to commit
	# so two lines: one if no commit, one if something to commit 
	git commit -a -m "New deploy" && git push -f origin HEAD:gh-pages && git reset HEAD~

build: buildCore buildBundle

buildCore:
	echo				 > build/augmentedgesture.js
	cat src/augmentedgesture.js	>> build/augmentedgesture.js

buildBundle:
	echo					 > build/augmentedgesture-bundle.js
	cat build/augmentedgesture.js		>> build/augmentedgesture-bundle.js
	cat vendor/imageprocessing.js		>> build/augmentedgesture-bundle.js
	cat vendor/requestanimationframe.js	>> build/augmentedgesture-bundle.js
	cat vendor/dat.gui/dat.gui.js		>> build/augmentedgesture-bundle.js

minify: minifyCore minifyBundle

minifyCore: buildCore
	curl --data-urlencode "js_code@build/augmentedgesture.js" 	\
		-d "output_format=text&output_info=compiled_code&compilation_level=SIMPLE_OPTIMIZATIONS" \
		http://closure-compiler.appspot.com/compile		\
		>> build/augmentedgesture.min.js
	@echo size minified + gzip is `gzip -c build/augmentedgesture.min.js | wc -c` byte
	
minifyBundle: buildBundle
	curl --data-urlencode "js_code@build/augmentedgesture-bundle.js" 	\
		-d "output_format=text&output_info=compiled_code&compilation_level=SIMPLE_OPTIMIZATIONS" \
		http://closure-compiler.appspot.com/compile		\
		>> build/augmentedgesture-bundle.min.js
	@echo size minified + gzip is `gzip -c build/augmentedgesture-bundle.min.js | wc -c` byte
	
.PHONY: build minify