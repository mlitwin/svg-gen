#!/bin/sh

rm -rf output
mkdir output&&  mkdir output/examples && mkdir output/examples/images

cp -r static/* output/

npm run make-examples
npm run make-samples